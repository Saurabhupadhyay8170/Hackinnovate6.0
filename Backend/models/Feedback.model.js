import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema(
  {
    documentId: { type: String, required: true },
    vote: { type: Number, required: true }, // e.g., a rating from 1 to 5
    suggestion: { type: String, default: "" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    username: { type: String, default: "" },
  },
  { timestamps: true }
);

const Feedback = mongoose.model("Feedback", FeedbackSchema);

export default Feedback;
