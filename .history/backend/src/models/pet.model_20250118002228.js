const mongoose = require("mongoose");

const petSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["dog", "cat", "other"],
    },
    breed: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
      min: 0,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female"],
    },
    size: {
      type: String,
      enum: ["small", "medium", "large"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    status: {
      type: String,
      enum: ["available", "pending", "adopted"],
      default: "available",
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    health: {
      vaccinated: {
        type: Boolean,
        default: false,
      },
      sterilized: {
        type: Boolean,
        default: false,
      },
      dewormed: {
        type: Boolean,
        default: false,
      },
    },
    requirements: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// 创建地理空间索引
petSchema.index({ location: "2dsphere" });

const Pet = mongoose.model("Pet", petSchema);

module.exports = Pet;
