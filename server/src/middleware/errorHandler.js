import multer from 'multer';

export function notFoundHandler(_req, res) {
  res.status(404).json({ error: 'Not found' });
}

/* eslint-disable-next-line no-unused-vars -- Express identifies error handlers by arity */
export function errorHandler(error, _req, res, _next) {
  const status = resolveStatus(error);
  if (status >= 500) {
    console.error(error);
  }
  res.status(status).json({ error: error.message ?? 'Unexpected server error' });
}

function resolveStatus(error) {
  if (error instanceof multer.MulterError) {
    return error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
  }
  return error.status ?? 500;
}
