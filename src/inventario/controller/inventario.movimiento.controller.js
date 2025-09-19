const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function obtenerTiposPago(req, res) {
  try {
    const tiposPago = await prisma.cAT_TIPO_PAGO.findMany({
      select: {
        id_tipo_pago: true,
        descripcion_pago: true,
      },
    });
    return res.status(200).json({ tiposPago });
  } catch (error) {
    console.error("Error al obtener tipos de pago:", error);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function obtenerEstadosFactura(req, res) {
  try {
    const estados = await prisma.cAT_ESTADO_FACTURA.findMany({
      select: {
        id_estado_factura: true,
        estado: true,
      },
    });
    return res.status(200).json({ estadosFactura: estados });
  } catch (error) {
    console.error("Error al obtener estados de factura:", error);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
}
// este aun no
//async function obtenerMovimientosInventario(params) {}

async function agregarMovimientoProducto(params) {
  try {
  } catch (error) {}
}

module.exports = {
  obtenerTiposPago,
  obtenerEstadosFactura,
  obtenerMovimientosInventario,
};
