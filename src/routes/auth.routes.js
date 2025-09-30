const express = require("express");
const router = express.Router();
const obtenerMetaToken = require("../middlewares/auth.metaToken.middleware");
const verificarToken = require("../middlewares/auth.middleware");

const {
  login,
  registro,
  getRutasIniciales,
  refresh,
  logout,
} = require("../LogicaGeneral/controller/auth.controllers");

router.post("/login", login);
router.get("/rutasInicio", getRutasIniciales);
router.post("/refreshToken", obtenerMetaToken, refresh);
router.post("/logout", obtenerMetaToken, logout);
router.post("/SignUp", registro);

module.exports = router;
