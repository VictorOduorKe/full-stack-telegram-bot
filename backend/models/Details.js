import mongoose from "mongoose";

const detailsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
   totalMessagesDeleted: {
      type: Number,
      required: true,
    },
    lastUsed: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Details = mongoose.model("Details", detailsSchema);

export default Details;