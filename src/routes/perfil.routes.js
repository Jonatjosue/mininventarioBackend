const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/auth.middleware');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', verificarToken, async (req, res) => {
  const usuario = await prisma.usuarios.findUnique({
    where: { id: req.user.userId },
    select: { id: true, correo: true }
  });
  res.json(usuario);
});

module.exports = router;
