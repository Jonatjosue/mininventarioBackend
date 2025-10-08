const express = require("express");
const router = express.Router();
const verificarToken = require("../middlewares/auth.middleware");
const {
  obtnerClientes,
  obtenerEstadosPedido,
  obtenerProductosPedido,
  crearPedido,
  obtenerPedidos,
  obtenerDetallePedido,
  actualizarEstadoPedido,
  obtenerProductosParaCompra,
  obtenerClientePorCorreo,
  obtenerConsidenciasCorreo,
  clienteDebeActualizar,
  obtenerPedidosPorNumero,
  crearFacturaCliente,
  obtenerFacturasClientes,
} = require("../venta/controller/venta.controller.js");

router.post("/crearPedido", verificarToken, crearPedido);
router.get("/obtnerClientes", verificarToken, obtnerClientes);
router.get("/obtenerEstadosPedido", verificarToken, obtenerEstadosPedido);
router.get("/obtenerProductosPedido", verificarToken, obtenerProductosPedido);
router.get("/obtenerPedidos", verificarToken, obtenerPedidos);
router.get("/obtenerDetallePedido", verificarToken, obtenerDetallePedido);
router.get(
  "/obtenerProductosParaCompra",
  verificarToken,
  obtenerProductosParaCompra
);
router.post("/actualizarEstadoPedido", verificarToken, actualizarEstadoPedido);
router.get("/obtenerClientePorCorreo", verificarToken, obtenerClientePorCorreo);
router.get("/clienteDebeActualizar", verificarToken, clienteDebeActualizar);
router.get(
  "/obtenerConsidenciasCorreo",
  verificarToken,
  obtenerConsidenciasCorreo
);
router.get("/obtenerPedidosPorNumero", verificarToken, obtenerPedidosPorNumero);
router.post("/crearFacturaCliente", verificarToken, crearFacturaCliente);
router.get("/obtenerFacturasClientes", verificarToken, obtenerFacturasClientes);
/*
router.post(
  "/agregarMovimientoProducto",
  verificarToken,
  agregarMovimientoProducto
);
router.delete(
  "/borrarFacturayDetalle/:id_factura",
  verificarToken,
  borrarFacturayDetalle
);*/

module.exports = router;
