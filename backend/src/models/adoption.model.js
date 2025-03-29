const mongoose = require("mongoose");

const adoptionSchema = new mongoose.Schema(
  {
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
      required: true,
    },
    livingCondition: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "approved", "rejected", "cancelled"],
      default: "active",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// 确保每个用户对同一个宠物只能有一个活跃的申请
adoptionSchema.index(
  { pet: 1, applicant: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["active", "pending"] },
    },
  }
);

const Adoption = mongoose.model("Adoption", adoptionSchema);

module.exports = Adoption;
