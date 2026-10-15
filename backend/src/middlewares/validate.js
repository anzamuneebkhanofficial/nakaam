export function validate(schemas = {}) {
  return async (req, res, next) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.validate(req.body, {
          abortEarly: false,
          stripUnknown: true,
        });
      }

      if (schemas.query) {
        const validatedQuery = await schemas.query.validate(req.query, {
          abortEarly: false,
          stripUnknown: true,
        });
        // Express 5: req.query is a getter. Redefine via Object.defineProperty
        Object.defineProperty(req, 'query', {
          value: validatedQuery,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }

      if (schemas.params) {
        req.params = await schemas.params.validate(req.params, {
          abortEarly: false,
          stripUnknown: true,
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
