// ============================================================
// File Model
// ============================================================

const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
    {
        originalName: {
            type: String,
            required: [true, "Original file name is required"],
        },

        filePath: {
            type: String,
            required: [true, "File path is required"],
        },

        fileType: {
            type: String,
            required: [true, "File type is required"],
        },

        fileSize: {
            type: Number,
            required: true,
        },

        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Transform output
fileSchema.set("toJSON", {
    transform: (_doc, ret) => {
        ret.id = ret._id;
        ret.uploadedAt = ret.createdAt;
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

module.exports = mongoose.model("File", fileSchema);
