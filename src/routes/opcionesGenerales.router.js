const express = require("express");
const router = express.Router();
const verificarToken = require("../middlewares/auth.middleware");

const {
  obtenerPais,
  obtenerDepartamento,
  obtenerMunicipio,
  crearDireccion,
  obtenerTiposIdentificacion,
  obtenerEstadotelefono,
  obtenerPorcentajeIva,
} = require("../opcionesGenerales/general.controller");

router.get("/obtenerPais", verificarToken, obtenerPais);
router.get("/obtenerPorcentajeIva", verificarToken, obtenerPorcentajeIva);
router.get("/obtenerDepartamento", verificarToken, obtenerDepartamento);
router.get("/obtenerMunicipio", verificarToken, obtenerMunicipio);
router.get(
  "/obtenerTiposIdentificacion",
  verificarToken,
  obtenerTiposIdentificacion
);
router.get("/obtenerEstadotelefono", verificarToken, obtenerEstadotelefono);
router.post("/crearDireccion", verificarToken, crearDireccion);

module.exports = router;
