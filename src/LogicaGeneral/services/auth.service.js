const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function logoutcliente(cliente, tokenHash) {
  const tokenDB = await prisma.rEFRESH_TOKEN_CLIENTE.findUnique({
    where: { token_hash: tokenHash },
  });
  if (!tokenDB) {
    return res.status(400).json({ error: "Refresh token inválido" });
  }
  // Marcar token como revocado
  const _cliente = await prisma.cLIENTE.findFirst({
    where: { id_cliente: cliente.id_cliente },
  });

  await prisma.cLIENTE.update({
    where: { id_cliente: _cliente.id_cliente },
    data: {
      token_version: _cliente.token_version + 1,
      fecha_ultimo_acceso: new Date(),
    },
  });

  await prisma.rEFRESH_TOKEN_CLIENTE.update({
    where: { id_refresh_token: tokenDB.id_refresh_token },
    data: {
      revoked_at: new Date(),
      revoked_reason: "LOGOUT",
      replaced_by: undefined,
    },
  });
}
async function logoutusuario(usuario, tokenHash) {
  const tokenDB = await prisma.rEFRESH_TOKEN.findUnique({
    where: { token_hash: tokenHash },
  });
  if (!tokenDB) {
    return res.status(400).json({ error: "Refresh token inválido" });
  }
  const _usuario = await prisma.uSUARIO.findFirst({
    where: { usuario_id: usuario.userId },
  });
  await prisma.uSUARIO.update({
    where: { usuario_id: _usuario.usuario_id },
    data: {
      token_version: _usuario.token_version + 1,
      fecha_ultimo_acceso: new Date(),
    },
  });
  // Marcar token como revocado
  await prisma.rEFRESH_TOKEN.update({
    where: { id_refresh_token: tokenDB.id_refresh_token },

    data: {
      revoked_at: new Date(),
      revoked_reason: "LOGOUT",
      replaced_by: undefined,
    },
  });
}
async function idEstadoTelefono(textoEstado) {
  const estado = await prisma.cAT_ESTADO_TELEFONO.findFirst({
    where: { nombre_estado: textoEstado },
    select: { id_estado_telefono: true },
  });

  if (!estado) throw new Error(`No se encontró el estado "${textoEstado}"`);

  return estado.id_estado_telefono;
}
module.exports = { logoutusuario, logoutcliente, idEstadoTelefono };
