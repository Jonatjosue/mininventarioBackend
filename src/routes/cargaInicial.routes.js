const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/auth.middleware');
const { paginasDefault, paginasPorRole } = require('../LogicaGeneral/controller/cargaInicial.controller');

router.get('/paginasDefault',verificarToken, paginasDefault);
router.get('/cargaRutas',verificarToken, paginasPorRole);

module.exports = router;
