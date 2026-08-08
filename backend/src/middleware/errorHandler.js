const errorHandler = (err, req, res, next) => {
  req.log.error({ err }, 'Unhandled error');

  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors,
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 && process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : message,
  });
};

module.exports = errorHandler;
