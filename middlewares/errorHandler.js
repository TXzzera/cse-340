function errorHandler(err, req, res, next) {
  console.error(err.stack);
  res.status(500).render('error', { message: err.message });
}

module.exports = errorHandler;