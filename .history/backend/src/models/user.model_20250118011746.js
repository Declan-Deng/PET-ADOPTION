const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    notifications: [
      {
        type: {
          type: String,
          enum: ["adoption_request", "message", "system"],
          required: true,
        },
        title: String,
        message: String,
        read: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    publications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pet",
      },
    ],
    adoptions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Adoption",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
