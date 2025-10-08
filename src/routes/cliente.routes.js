const express = require("express");
const router = express.Router();
const verificarToken = require("../middlewares/auth.middleware");

const {
  actualizarCliente,
  crearDocumentoIdentificacion,
  crearTelefonosContacto,
} = require("../cliente/cliente.controller.js");

router.post("/actualizarCliente", verificarToken, actualizarCliente);
router.post(
  "/crearDocumentoIdentificacion",
  verificarToken,
  crearDocumentoIdentificacion
);
router.post("/crearTelefonosContacto", verificarToken, crearTelefonosContacto);

module.exports = router;
