const mongoose = require("mongoose");
const { GridFSBucket, ObjectId } = require("mongodb");
const { Readable } = require("stream");

/**
 * Initializes and returns the GridFS bucket instance
 */
const getBucket = () => {
  if (!mongoose.connection.db) {
    throw new Error("Database connection not established for GridFS.");
  }
  return new GridFSBucket(mongoose.connection.db, {
    bucketName: "fs", // Standard GridFS bucket name
  });
};

/**
 * Uploads a file buffer to GridFS
 * @param {Buffer} buffer - File data
 * @param {string} filename - Original filename
 * @param {string} contentType - Mimetype
 * @returns {Promise<ObjectId>} - ID of the saved file
 */
const uploadToGridFS = (buffer, filename, contentType) => {
  return new Promise((resolve, reject) => {
    const bucket = getBucket();
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: contentType,
    });

    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);

    readableStream
      .pipe(uploadStream)
      .on("error", (err) => reject(err))
      .on("finish", () => resolve(uploadStream.id));
  });
};

/**
 * Downloads a file from GridFS to a response stream
 * @param {string} fileId - ID of the file in GridFS
 * @param {Object} res - Express response object
 */
const downloadFromGridFS = async (fileId, res) => {
  try {
    const bucket = getBucket();
    const _id = new ObjectId(fileId);

    // Get file info for headers
    const files = await bucket.find({ _id }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ message: "File not found in database." });
    }

    const file = files[0];
    res.set({
      "Content-Type": file.contentType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${file.filename}"`,
      "Content-Length": file.length,
    });

    const downloadStream = bucket.openDownloadStream(_id);
    downloadStream.pipe(res);
    
    downloadStream.on("error", (err) => {
      console.error("GridFS Download Error:", err);
      res.status(500).end();
    });
  } catch (error) {
    console.error("GridFS Download catch:", error);
    res.status(400).json({ message: "Invalid File ID." });
  }
};

/**
 * Deletes a file from GridFS
 * @param {string} fileId - ID of the file to delete
 */
const deleteFromGridFS = async (fileId) => {
  try {
    const bucket = getBucket();
    await bucket.delete(new ObjectId(fileId));
  } catch (error) {
      // If file doesn't exist, we skip
      console.warn(`GridFS: Could not delete file ${fileId}`, error.message);
  }
};

module.exports = {
  uploadToGridFS,
  downloadFromGridFS,
  deleteFromGridFS,
};
