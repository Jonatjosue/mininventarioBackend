const { PrismaClient } = require("@prisma/client");
const {
  rutasPermitidasEmpleado,
  rutasPermitidasCliente,
} = require("../services/auth.serviceCargaInicial");
const prisma = new PrismaClient();

async function paginasDefault(req, res) {
  const rutasDefault = await prisma.mENU.findMany({
    where: {
      id_estado_registro: "1",
      OR: [{ menu: "Inicial_login" }, { menu: "Inicio" }],
    },
    select: {
      OPCION: {
        select: {
          opcion: true,
          endpoint: true,
        },
      },
    },
  });
  const opcionesDefault = rutasDefault.flatMap((ruta) => ruta.OPCION);
  return res.status(200).json({ rutasDefault: opcionesDefault });
}
// Versión para clientes || PENDIENTE
async function paginasDefaultCliente(req, res) {
  const rutasDefault = await prisma.mENU.findMany({
    where: {
      id_estado_registro: "1",
      OR: [{ menu: "Inicial_login_cliente" }, { menu: "Inicio_cliente" }],
    },
    select: {
      OPCION: {
        select: {
          opcion: true,
          endpoint: true,
        },
      },
    },
  });
  const opcionesDefault = rutasDefault.flatMap((ruta) => ruta.OPCION);
  return res.status(200).json({ rutasDefault: opcionesDefault });
}
async function paginasPorRole(req, res) {
  const esEmpleado = req.user.hasOwnProperty("userId");
  const esCliente = req.user.hasOwnProperty("id_cliente");

  if (!esEmpleado && !esCliente) {
    return res.status(403).json({ error: "No autorizado" });
  }
  try {
    if (esEmpleado) {
      return await rutasPermitidasEmpleado(esEmpleado, req, res);
    } else if (esCliente) {
      return await rutasPermitidasCliente(esCliente, req, res);
    }
  } catch (error) {
    console.error("Error al obtener rutas por rol:", error);
    return res.status(500).json({ error: "Error en el servidor" });
  }
}

async function obtenerhistorialInicalLogs(req, res) {
  try {
    const logs = await prisma.$queryRaw`
      select * from vista_logs_actividad order by fechaordenamiento desc
    `;
    return res.status(200).json({ logs });
  } catch (error) {
    console.error("Error al obtener los últimos movimientos:", error);
    return res.status(500).json({ error: "Error en el servidor" });
  }
}

async function obtenerResumenProductos(req, res) {
  try {
    const resumenProductos = await prisma.$queryRaw`
      SELECT 
        COUNT(producto."p_producto_Id")::INTEGER as cantidad_productos,
        COUNT(CASE WHEN ultimoMovimiento.cantidad_disponible IS NOT NULL THEN 1 END)::INTEGER as enStock,
        COUNT(CASE WHEN ultimoMovimiento.cantidad_disponible IS NOT NULL AND ultimoMovimiento.cantidad_disponible >= 10 THEN 1 END)::INTEGER as bajoStock,
        COUNT(CASE WHEN ultimoMovimiento.cantidad_disponible IS NULL OR ultimoMovimiento.cantidad_disponible = 0 THEN 1 END)::INTEGER as agotados 
      FROM (
        SELECT *,
          ROW_NUMBER() OVER (PARTITION BY mi.p_producto_id ORDER BY mi.fecha_creacion DESC, mi."movimiento_inventario_Id" DESC) as rn
        FROM "MOVIMIENTO_INVENTARIO" mi
      ) as ultimoMovimiento
      RIGHT JOIN "PRODUCTO" producto
        ON producto."p_producto_Id" = ultimoMovimiento.p_producto_id
        AND ultimoMovimiento.rn = 1
      where producto.id_estado_registro = '1'
    `;
    const resumenProductosFormateado = resumenProductos[0];
    return res.status(200).json({ resumenProductosFormateado });
  } catch (error) {
    console.error("Error al obtener el stock de productos:", error);
    return res.status(500).json({ error: "Error en el servidor" });
  }
}

module.exports = {
  paginasDefault,
  paginasPorRole,
  obtenerhistorialInicalLogs,
  obtenerResumenProductos,
};
