const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function rutasPermitidasEmpleado(esEmpleado, req, res) {
  try {
    const usuario = await prisma.uSUARIO.findFirst({
      where: { usuario_id: req.user.userId },
      include: {
        ROLE_USUARIO: {
          where: { id_estado_registro: "1" },
          include: {
            ROLE: true,
          },
        },
      },
    });
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const rolesActivos = usuario.ROLE_USUARIO.filter(
      (role) => role.id_estado_registro === "1"
    );
    const rolesIds = rolesActivos.map((role) => role.id_role);

    if (rolesIds.length === 0) {
      return res.status(403).json({ error: "Usuario sin roles activos" });
    }

    const rutas = await prisma.rOLE_OPCION.findMany({
      where: {
        id_role: { in: rolesIds },
        id_estado_registro: "1",
      },
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

    const opcionesUnicas = opcionesPermitidas.filter(
      (opcion, index, self) =>
        index === self.findIndex((o) => o.endpoint === opcion.endpoint)
    );

    const rutasFormateadas = opcionesUnicas.map((opcion) => {
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
  } catch (error) {
    console.error("Error en rutasPermitidasEmpleado:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
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
    where: { id_role: parseInt(idobtenerRoleCliente.id_role) },
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

module.exports = { rutasPermitidasEmpleado, rutasPermitidasCliente };
