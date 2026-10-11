export function sendSuccess(res, data, statusCode = 200, meta) {
  res.status(statusCode).json({
    success: true,
    data,
    meta: {
      requestId: res.req.id,
      ...meta,
    },
  });
}

export function sendError(res, statusCode, code, message, details) {
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
    meta: {
      requestId: res.req.id,
    },
  });
}
