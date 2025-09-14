const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const tiempoToken = process.env.TIME_TOKEN;

function generarToken(user, familyId = null) {
  const accesToken = jwt.sign(
    {
      userId: user.usuario_id,
      correo: user.correo_principal,
      version: user.token_version,
    },
    process.env.JWT_SECRET,
    { expiresIn: tiempoToken }
  );
  const rawRefreshToken = crypto.randomBytes(64).toString("hex");
  const family_id = familyId || crypto.randomUUID();
  return { accesToken, rawRefreshToken, family_id };
}
function generarTokenCliente(cliente, familyId = null) {
  const accesToken = jwt.sign(
    {
      id_cliente: cliente.id_cliente,
      correo: cliente.correo,
      version: cliente.token_version,
    },
    process.env.JWT_SECRET,
    { expiresIn: tiempoToken }
  );
  const rawRefreshToken = crypto.randomBytes(64).toString("hex");
  const family_id = familyId || crypto.randomUUID();
  return { accesToken, rawRefreshToken, family_id };
}

module.exports = { generarToken, generarTokenCliente };
