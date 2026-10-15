export function respond(res, data = null, meta = null, statusCode = 200) {
  const payload = {
    success: true,
    data,
  };
  if (meta !== null && meta !== undefined) {
    payload.meta = meta;
  }
  return res.status(statusCode).json(payload);
}

export function respondCreated(res, data = null, meta = null) {
  return respond(res, data, meta, 201);
}

export function respondNoContent(res) {
  return res.status(204).send();
}
