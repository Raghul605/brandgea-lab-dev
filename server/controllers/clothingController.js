import uploadImages from "../utils/s3Upload.js";
import sendEmails from "../utils/sendEmails.js";
import OpenAI from "openai";
import Product from "../models/product.js";
import User from "../models/User.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const ProfitMarginIndia = Number(process.env.Profit_Marg_India) || 2;
const ProfitMarginUS = Number(process.env.Profit_Marg_US) || 4;
const conversionRate = Number(process.env.Conversion_Rate_USD) || 0.012;

function convertINRtoUSD(inrAmount) {
  return +(inrAmount * conversionRate).toFixed(2);
}

function adjustManufacturingCosts(costs, country) {
  const adjustedCosts = {};
  if (country.toLowerCase() === "india") {
    for (const qty in costs) {
      adjustedCosts[qty] = +(costs[qty] * ProfitMarginIndia).toFixed(2);
    }
    adjustedCosts.currency = "INR";
  } else {
    for (const qty in costs) {
      const increased = costs[qty] * ProfitMarginUS;
      adjustedCosts[qty] = convertINRtoUSD(increased);
    }
    adjustedCosts.currency = "USD";
  }
  return adjustedCosts;
}

async function callOpenAIGPTValidateClothing(prompt, images) {
  const imagePayloads = images.map((img, i) => ({
    type: "image_url",
    image_url: {
      url: `data:${img.mimetype};base64,${img.buffer.toString("base64")}`,
    },
  }));

  const unifiedPrompt = `
Role: apparel analyst and cost estimator. *Return JSON only.*

1. If image not clothing → {"error":"image_not_clothing"} (STOP)
2. If text not clothing → {"error":"text_not_clothing"} (STOP)

3. Let I = garment_type from image, T = garment_type from text (null if absent)
   • If T && T !== I → {"match":false,"reason":"garment_type_mismatch"} (STOP)
   • Else { "match": true, garment_type: I }

4. Text overrides image; otherwise infer all visible/implicit details.
5. Fill gaps with sensible defaults.

6. In "tech_pack" object, include ONLY these keys:
   garment_type: string
   material: string
   gsm: number
   color: array of strings (one or more colors)
   Design: array of objects (one per placement) describing decoration type (e.g., print, embroidery, dtf, dtg, screen, heat_transfer, etc.)
   tech: string, decoration method; free text (e.g., print, embroidery, dtf, dtg, screen, heat_transfer)
   wash_treatments: array of strings (e.g., ['enzyme_wash']), or [] if none
   complexity_class: "basic" (no zipper/lining), "standard" (typical sweatshirt/tee), or "complex" (zipper/lining/many panels)
   additional_comments: string; anything important not covered elsewhere (e.g., special packaging, testing, unusual trims)

7. Estimate average manufacturing cost per piece (INR) for quantities: 50, 100, 250, 1000.
   Consider raw material costs, bulk discounts, labor amortization, tooling setup, and typical manufacturing rates in India.
   Respond with a "manufacturing_costs" object.

Input
Text: "${prompt}"
Image: uploaded

Return:
{
  "match": true,
  "tech_pack": {
    garment_type,
    material,
    gsm,
    color,
    Design,
    tech,
    wash_treatments,
    complexity_class,
    additional_comments
  },
  "manufacturing_costs": { /* costs object */ }
}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "user",
        content: [{ type: "text", text: unifiedPrompt }, ...imagePayloads],
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.0,
    seed: 12345,
  });

  return JSON.parse(response.choices[0].message.content);
}

export const validateClothing = async (req, res) => {
  try {
    
    const { prompt, country } = req.body;
    const userId = req.user?.userId;
    const images = req.files;

    if (
      !prompt ||
      !images ||
      images.length === 0 ||
      images.length > 2 ||
      !userId ||
      !country
    ) {
      return res.status(400).json({
        error:
          "Prompt, 1–2 images, authenticated user, and country are required.",
      });
    }

    // 1. GPT call with both images and prompt
    const gptResponse = await callOpenAIGPTValidateClothing(prompt, images);

    if (gptResponse.error || gptResponse.match === false) {
      const code =
        gptResponse.reason || gptResponse.error || "validation_failed";

      const messages = {
        invalid_image_count: "Please attach 1–2 product reference images.",
        image_not_clothing:
          "The uploaded image doesn’t look like a clothing item.",
        text_not_clothing:
          "Your description doesn’t look like a clothing item.",
        garment_type_mismatch:
          "Your text and images don’t match. Please update either the text or the images.",
      };

      return res.status(400).json({
        code,
        message:
          messages[code] ||
          "We couldn't validate your request. Please review and try again.",
      });
    }
    
    // 2. Upload images to S3
    const imageUrls = await uploadImages(images); // [url1, url2]


    // 3. User lookup
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 4. Cost adjustments

    const originalCosts = gptResponse.manufacturing_costs || {};
    const updatedCosts = adjustManufacturingCosts(originalCosts, country);

    // 5. Save chat to user
    const chatEntry = {
      prompt: {
        text: prompt,
        imageUrls: imageUrls,
      },
      manufacturing_costs: updatedCosts,
    };
    user.chat.push(chatEntry);
    await user.save();

    // 6. Chat id for reference
    const newChat = user.chat[user.chat.length - 1];
    const chat_id = newChat._id;

    // 7. Profit margin used
    const profitMargin =
      country.toLowerCase() === "india"
        ? Number(process.env.Profit_Marg_India) || 1.3
        : Number(process.env.Profit_Marg_US) || 1.5;

    // 8. Product creation with original costs and tech pack

    await Product.create({
      user_id: userId,
      chat_id,
      tech_pack: gptResponse.tech_pack,
      manufacturing_costs: originalCosts,
      profit_margin: profitMargin,
      country,
      conversion_rate: conversionRate,
      cost_with_profit: updatedCosts,
    });
    
    // 9. Send emails
    const techPack = gptResponse.tech_pack;
    
    sendEmails(
      userId,
      originalCosts,
      updatedCosts,
      prompt,
      techPack,
      images,
      profitMargin,
      country
    );

    // 10. Response
    return res.json({
      manufacturing_costs: updatedCosts,
      tech_pack: gptResponse.tech_pack,
      imageUrls,
    });
  } catch (err) {
    console.error("validateClothing error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};