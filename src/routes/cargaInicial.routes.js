const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/auth.middleware');
const { paginasDefault, paginasPorRole, obtenerhistorialInicalLogs , obtenerResumenProductos} = require('../LogicaGeneral/controller/cargaInicial.controller');

router.get('/paginasDefault',verificarToken, paginasDefault);
router.get('/cargaRutas',verificarToken, paginasPorRole);
router.get('/obtenerhistorialInicalLogs',verificarToken, obtenerhistorialInicalLogs);
router.get('/obtenerResumenProductos',verificarToken, obtenerResumenProductos);

module.exports = router;
