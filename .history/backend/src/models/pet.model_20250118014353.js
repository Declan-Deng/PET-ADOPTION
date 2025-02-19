const mongoose = require("mongoose");

const petSchema = new mongoose.Schema(
  {
    petName: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["cat", "dog", "other"],
    },
    breed: {
      type: String,
      required: true,
    },
    age: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    requirements: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    medical: {
      vaccinated: {
        type: Boolean,
        default: false,
      },
      sterilized: {
        type: Boolean,
        default: false,
      },
      healthStatus: {
        type: String,
        enum: ["healthy", "subHealth", "needTreatment"],
        default: "healthy",
      },
    },
    status: {
      type: String,
      enum: ["待审核", "已通过", "已领养", "已拒绝"],
      default: "待审核",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    applicants: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Pet = mongoose.model("Pet", petSchema);

module.exports = Pet;
