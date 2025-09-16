const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function rutasPermitidasEmpleado(esEmpleado, req, res) {
  const usuario = await prisma.uSUARIO.findFirst({
    where: { usuario_id: req.user.userId },
    select: { ROLE_USUARIO: true },
  });
  const role = usuario.ROLE_USUARIO;
  if (!usuario) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }
  const rutas = await prisma.rOLE_OPCION.findMany({
    where: { id_rol: role.id_rol, id_estado_registro: "1" },
    select: {
      OPCION: {
        select: {
          opcion: true,
          endpoint: true,
          MENU: {
            select: { menu: true },
          },
        },
      },
    },
  });
  const opcionesPermitidas = rutas.map((ruta) => ruta.OPCION);
  const rutasFormateadas = opcionesPermitidas.map((opcion) => {
    return {
      path: opcion.endpoint,
      name: opcion.opcion,
      meta: {
        group: opcion.MENU.menu,
        title: opcion.opcion,
        icon: "Home",
        requiresAuth: true,
        allowed: true,
      },
    };
  });
  return res.status(200).json({ rutasPermitidas: rutasFormateadas });
}
async function rutasPermitidasCliente(esEmpleado, req, res) {
  const cliente = await prisma.cLIENTE.findFirst({
    where: { id_cliente: req.user.id_cliente },
    select: { id_cliente: true },
  });
  if (!cliente) {
    return res.status(404).json({ error: "Cliente no encontrado" });
  }
  const idobtenerRoleCliente = await prisma.rOLE.findFirst({
    where: { role: "Cliente" },
    select: { id_role: true },
  });
  const rutas = await prisma.rOLE_OPCION.findMany({
    where: { id_role: idobtenerRoleCliente },
    select: {
      OPCION: {
        select: {
          opcion: true,
          endpoint: true,
          MENU: {
            select: { menu: true },
          },
        },
      },
    },
  });
  const opcionesPermitidas = rutas.map((ruta) => ruta.OPCION);
  return res.status(200).json({ rutasPermitidas: opcionesPermitidas });
}

module.exports = { rutasPermitidasEmpleado, rutasPermitidasCliente };
