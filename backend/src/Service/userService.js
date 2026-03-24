const User = require("../models/User");

// Get user by ID
exports.getUserById = async (id) => {
    return await User.findById(id);
};

// Get all users
exports.getAllUsers = async () => {
    return await User.find();
};

// Update user
exports.updateUser = async (id, data) => {
    return await User.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    });
};

// Delete user
exports.deleteUser = async (id) => {
    return await User.findByIdAndDelete(id);
};
