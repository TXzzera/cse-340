exports.triggerError = (req, res, next) => {
  try {
    throw new Error("500-type error: Intentional error triggered for testing purposes");
  } catch (err) {
    next(err); //
  }
}
