exports.success = (res, data, message = "Success") => {
    res.json({
        success: true,
        message,
        data,
    });
};

exports.error = (res, message = "Error", statusCode = 500) => {
    res.status(statusCode).json({
        success: false,
        message,
    });
};
