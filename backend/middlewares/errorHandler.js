module.exports = (err, req, res, next) => {
  const statusCode = res.statusCode || 500;

  res.status(statusCode).json({
    code: statusCode,
    error: err.stack,
  });
};
