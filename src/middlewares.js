const express = require('express')

// If route is not found display (not found - original url) and call error
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

// updates status code depending on error status and displays does not exist message
const errorHandler = (error, req, res, next) => {
    statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.send('Page does not exist');
};

// Export objects
module.exports = {
    notFound,
    errorHandler,
};