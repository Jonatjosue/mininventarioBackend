const jwt = require('jsonwebtoken');
function obtenerMetaToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ error: 'Token no enviado' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.decode(token);
    if (!decoded) {
      return res.status(400).json({ error: 'No se pudieron extraer metadatos del token' });
    }
    req.userMeta = decoded;
    next();
  } catch (err) {
    return res.status(400).json({ error: 'Error al decodificar el token' });
  }
}
module.exports = obtenerMetaToken;
