const validate = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync(req.body);
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = validate;
