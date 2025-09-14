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

module.exports = { paginasDefault, paginasPorRole };
