import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chat_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    tech_pack: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    manufacturing_costs: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    profit_margin: {
      type: Number, // e.g. 1.1 or 1.5
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    heading: {
      type: String,
    },
    conversion_rate: {
      type: Number,
      required: true,
    },
    cost_with_profit: {
      type: mongoose.Schema.Types.Mixed, // adjusted and possibly converted costs
      required: true,
    },
    quoteNumber: {
      type: Number,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

productSchema.pre("validate", async function (next) {
  if (typeof this.quoteNumber === "number") return next();

  try {
    const lastProduct = await mongoose
      .model("Product")
      .findOne({})
      .sort({ createdAt: -1 })
      .select("quoteNumber")
      .lean();

    this.quoteNumber =
      lastProduct && lastProduct.quoteNumber ? lastProduct.quoteNumber + 1 : 1;

    next();
  } catch (err) {
    next(err);
  }
});

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;
