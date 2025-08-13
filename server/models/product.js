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
    conversion_rate: {
      type: Number,
      required: true,
    },
    cost_with_profit: {
      type: mongoose.Schema.Types.Mixed, // adjusted and possibly converted costs
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
