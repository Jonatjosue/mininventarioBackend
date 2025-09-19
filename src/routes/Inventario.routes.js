const express = require("express");
const router = express.Router();
const verificarToken = require("../middlewares/auth.middleware");
const {
  obtenerProveedores,
  AgregarProveedor,
  eliminarProveedor,
  ActualizarProveedor,
} = require("../inventario/controller/inventario.proveedor.controller");
const {
  crearCategoriaProducto,
  obtenerCategoriasProducto,
  actualizarCategoriaProducto,
  eliminarCategoriaProducto,
  obtenerProveedoresProducto,
} = require("../inventario/controller/inventario.categoria.controller");

const {
  obtenerEstadosProducto,
  crearProducto,
  actualizarProducto,
  borrarProducto,
  obtenerProductos,
} = require("../inventario/controller/inventario.productoMovimiento.controller");

const {
  obtenerTiposOferta,
  crearTipoOferta,
  actualizarTipoOferta,
  eliminarTipoOferta,
  obtenerOfertas,
  crearOferta,
  actualizarOferta,
  eliminarOferta,
  agregarOfertaProducto,
  ofertasProducto,
  borrarProductoOferta,
} = require("../inventario/controller/inventario.oferta.controller");

router.get("/ObtenerProveedores", verificarToken, obtenerProveedores);
router.post("/AgregarProveedor", verificarToken, AgregarProveedor);
router.delete(
  "/quitarProveedor/:id_proveedor",
  verificarToken,
  eliminarProveedor
);
router.post("/ActualizarProveedor", verificarToken, ActualizarProveedor);
router.post("/crearCategoriaProducto", verificarToken, crearCategoriaProducto);
router.get(
  "/obtenerCategoriasProducto",
  verificarToken,
  obtenerCategoriasProducto
);
router.post(
  "/actualizarCategoriaProducto",
  verificarToken,
  actualizarCategoriaProducto
);
router.delete(
  "/eliminarCategoriaProducto/:id_tipo_producto",
  verificarToken,
  eliminarCategoriaProducto
);
router.get(
  "/obtenerProveedoresProducto",
  verificarToken,
  obtenerProveedoresProducto
);
/*Tipos ofertas y Ofertas*/
router.get("/obtenerTiposOferta", verificarToken, obtenerTiposOferta);
router.get("/obtenerOfertas", verificarToken, obtenerOfertas);
router.post("/crearTipoOferta", verificarToken, crearTipoOferta);
router.post("/crearOferta", verificarToken, crearOferta);
router.post("/actualizarTipoOferta", verificarToken, actualizarTipoOferta);
router.post("/actualizarOferta", verificarToken, actualizarOferta);
router.delete(
  "/eliminarTipoOferta/:id_tipo_oferta",
  verificarToken,
  eliminarTipoOferta
);
router.delete("/eliminarOferta/:id_oferta", verificarToken, eliminarOferta);
////
router.get("/obtenerEstadosProducto", verificarToken, obtenerEstadosProducto);
router.get("/obtenerProductos", verificarToken, obtenerProductos);
router.post("/crearProducto", verificarToken, crearProducto);
router.post("/actualizarProducto", verificarToken, actualizarProducto);
router.delete("/borrarProducto/:p_producto_Id", verificarToken, borrarProducto);
router.post("/agregarOfertaProducto", verificarToken, agregarOfertaProducto);
router.get("/ofertasProducto", verificarToken, ofertasProducto);
router.delete(
  "/borrarProductoOferta/:id_producto_oferta",
  verificarToken,
  borrarProductoOferta
);

module.exports = router;
