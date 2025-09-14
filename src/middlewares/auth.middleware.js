  const jwt = require('jsonwebtoken');

  function verificarToken(req, res, next) {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: 'Token no enviado' });

    const token = header.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      
      next();
    } catch (err) {
      let mensaje = 'Error al verificar el token';
      if (err.name === 'TokenExpiredError') {
        mensaje = 'Token expirado';
      } else if (err.name === 'JsonWebTokenError') {
        mensaje = 'Token inválido';
      }
      return res.status(403).json({ error: mensaje });
    }
  }

  module.exports = verificarToken;
