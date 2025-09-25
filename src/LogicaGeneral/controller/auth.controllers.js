const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { generarToken } = require("../../utils/jwt.js");
const { generarTokenCliente } = require("../../utils/jwt.js");
const { OAuth2Client } = require("google-auth-library");
const {
  logoutusuario,
  logoutcliente,
  idEstadoTelefono,
} = require("../services/auth.service.js");
const e = require("cors");
const { version } = require("os");

const CLIENT_ID = process.env.ID_CLIENTE_GOOGLE;
const prisma = new PrismaClient();
const client = new OAuth2Client(CLIENT_ID);

async function login(req, res) {
  let user = null;
  let valid = false;

  const {
    correo,
    password,
    codigoUsuario,
    esEmpleado = false,
    esLoginGoogle = false,
    tokenGoogle = null,
  } = req.body;

  if (!esLoginGoogle && !correo) {
    return res.status(400).json({ error: "El correo es requerido" });
  }

  if (!esLoginGoogle && !esEmpleado && !password) {
    return res.status(400).json({ error: "La contraseña es requerida" });
  }

  if (esEmpleado && !codigoUsuario) {
    return res.status(400).json({ error: "El código de usuario es requerido" });
  }

  if (esLoginGoogle && !tokenGoogle) {
    return res.status(400).json({ error: "Token de Google no proporcionado" });
  }

  try {
    if (esEmpleado) {
      user = await prisma.uSUARIO.findFirst({
        where: {
          correo_principal: correo,
          id_estado_registro: "1",
          codigo_usuario: codigoUsuario,
        },
        include: {
          ROLE_USUARIO: {
            where: { id_estado_registro: "1" },
            include: {
              ROLE: true,
            },
            take: 1,
          },
        },
      });
    } else if (!esEmpleado && !esLoginGoogle) {
      user = await prisma.cLIENTE.findFirst({
        where: {
          correo: correo,
        },
      });
      if (!user) {
        return res.status(200).json({
          mensaje: "Usuario no encontrado, puede crear una cuenta",
          googleSignUp: false,
          correo: null,
          clienteSignUp: true,
        });
      }
    } else if (esLoginGoogle) {
      try {
        const ticket = await client.verifyIdToken({
          idToken: tokenGoogle,
          audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();

        user = await prisma.cLIENTE.findFirst({
          where: {
            correo: payload.email,
          },
        });
        if (!user) {
          return res.status(200).json({
            mensaje: "Usuario no encontrado, desea crear una cuenta",
            googleSignUp: true,
            correo: payload.email,
          });
        }
      } catch (error) {
        return res.status(401).json({ error: "Token de Google inválido" });
      }
    }

    if (!user) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    if (!esLoginGoogle) {
      valid = await bcrypt.compare(password, user.contrasenia);
      if (!valid) {
        return res.status(401).json({ error: "Contraseña incorrecta" });
      }
    }
    // Generar token
    let valoresCredenciales = null;
    if (esEmpleado) {
      valoresCredenciales = generarToken(user);
    } else if (!esEmpleado) {
      valoresCredenciales = generarTokenCliente(user);
    }
    if (esEmpleado) {
      await logIngresoUsuario(
        user,
        req.ip ||
          req.headers["x-forwarded-for"] ||
          req.connection.remoteAddress,
        "captcha-ok",
        true,
        200,
        "0",
        req.headers["user-agent"]
      );
    } else if (!esEmpleado) {
      await logIngresoCliente(
        user,
        req.ip ||
          req.headers["x-forwarded-for"] ||
          req.connection.remoteAddress,
        "captcha-ok",
        true,
        200,
        "0",
        req.headers["user-agent"]
      );
    }
    if (esEmpleado) {
      await guardarTokenRefresh(
        user,
        valoresCredenciales.rawRefreshToken,
        req.ip ||
          req.headers["x-forwarded-for"] ||
          req.connection.remoteAddress,
        req.headers["user-agent"],
        null,
        valoresCredenciales.family_id
      );
    } else if (!esEmpleado) {
      await guardarTokenRefreshCliente(
        user,
        valoresCredenciales.rawRefreshToken,
        req.ip ||
          req.headers["x-forwarded-for"] ||
          req.connection.remoteAddress,
        req.headers["user-agent"],
        null,
        valoresCredenciales.family_id
      );
    }

    res.cookie("refreshToken", valoresCredenciales.rawRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Solo HTTPS para producción
      sameSite: "None",
      maxAge: 1 * 60 * 60 * 1000, // 1 día en ms
    });

    return res.json({
      mensaje: "Login exitoso",
      googleSignUp: false,
      usuario: {
        id: user.id_usuario || user.id_cliente,
        correo: user?.correo_principal || user?.correo,
        rol: user?.ROLE_USUARIO?.[0].ROLE?.role || "CLIENTE",
      },
      accessToken: valoresCredenciales.accesToken,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Error en el servidor", error: err.message });
  }
}
function makeTokenId(rawRefreshToken) {
  return crypto
    .createHmac("sha256", process.env.REFRESH_TOKEN_SECRET)
    .update(rawRefreshToken)
    .digest("base64url");
}
async function guardarTokenRefresh(
  user,
  rawRefreshToken,
  ip,
  userAgent,
  fingerprint,
  familyId
) {
  try {
    const tokenHash = makeTokenId(rawRefreshToken);

    await prisma.rEFRESH_TOKEN.create({
      data: {
        id_usuario: user.usuario_id,
        token_hash: tokenHash,
        family_id: familyId,
        expires_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        ip,
        user_agent: userAgent,
        device_fingerprint_hash: fingerprint || null,
      },
    });
  } catch (error) {
    throw new Error("Error al guardar el refresh token");
  }
}
async function guardarTokenRefreshCliente(
  cliente,
  rawRefreshToken,
  ip,
  userAgent,
  fingerprint,
  familyId
) {
  try {
    const tokenHash = makeTokenId(rawRefreshToken);

    await prisma.rEFRESH_TOKEN_CLIENTE.create({
      data: {
        id_cliente: cliente.id_cliente,
        token_hash: tokenHash,
        family_id: familyId, // uuid generado al login
        expires_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 30 días
        ip,
        user_agent: userAgent,
        device_fingerprint_hash: fingerprint || null,
      },
    });
  } catch (error) {
    throw new Error("Error al guardar el refresh token");
  }
}
async function logIngresoUsuario(
  user,
  ip,
  captcha,
  exitoso = false,
  codigorespuesta = 200,
  recuperar_contrasena = "0",
  huella_digital = "null"
) {
  await prisma.uSUARIO.update({
    where: { usuario_id: user.usuario_id },
    data: { fecha_ultimo_acceso: new Date() },
  });
  await prisma.lOG_INGRESO_USUARIO.create({
    data: {
      captcha: captcha,
      fecha: new Date(),
      huella_digital: huella_digital,
      id_usuario: user.usuario_id,
      ip: ip,
      recuperar_contrasena: recuperar_contrasena,
      exitoso: exitoso,
      codigorespuesta: codigorespuesta,
    },
  });
}

async function logIngresoCliente(
  cliente,
  ip,
  captcha,
  exitoso = false,
  codigorespuesta = 200,
  recuperar_contrasena = "0",
  huella_digital = "null"
) {
  await prisma.cLIENTE.update({
    where: { id_cliente: cliente.id_cliente },
    data: { fecha_ultimo_acceso: new Date() },
  });
  await prisma.lOG_INGRESO_CLIENTE.create({
    data: {
      captcha: captcha,
      fecha: new Date(),
      huella_digital: huella_digital,
      id_cliente: cliente.id_cliente,
      ip: ip,
      recuperar_contrasena: recuperar_contrasena,
      exitoso: exitoso,
      codigorespuesta: codigorespuesta,
    },
  });
}

async function registro(req, res) {
  const {
    pNombre,
    pApellido,
    correo,
    genero,
    telefono,
    contrasenia,
    contraseniaConfirmada,
  } = req.body;
  if (!correo || !contrasenia) {
    return res
      .status(400)
      .json({ error: "Correo y contraseña son requeridos" });
  }
  if (contrasenia !== contraseniaConfirmada) {
    return res
      .status(400)
      .json({ error: "La contraseña y su confirmación no coinciden" });
  }
  const clienteExiste = await prisma.cLIENTE.findFirst({
    where: { correo: correo },
  });
  if (clienteExiste) {
    return res.status(400).json({ error: "El correo ya está registrado" });
  }
  if (pNombre.length > 150 || pApellido.length > 150) {
    return res
      .status(400)
      .json({ error: "El nombre o apellido excede el límite de caracteres" });
  }
  if (pNombre.length < 2 || pApellido.length < 2) {
    return res.status(400).json({ error: "El nombre o apellido es muy corto" });
  }
  if (genero === null) {
    return res.status(400).json({ error: "Debe seleccionar un genero" });
  }
  const hashedPassword = await bcrypt.hash(contrasenia, 10);
  try {
    if (isNaN(Number(telefono))) {
      return res.status(400).json({ error: "El teléfono debe ser numérico" });
    }
  } catch (error) {
    return res.status(400).json({ error: "El teléfono debe ser numérico" });
  }
  try {
    const usuarioSistema = await prisma.uSUARIO.findFirst({
      where: { correo_principal: "mininventario@gmail.com" },
    });

    const result = await prisma.$transaction(async (tx) => {
      const nuevoCliente = await tx.cLIENTE.create({
        data: {
          p_nombre: pNombre,
          s_nombre: null,
          p_apellido: pApellido,
          s_apellido: null,
          correo: correo,
          contrasenia: hashedPassword,
          fecha_creacion: new Date(),
          uui_d_cliente: crypto.randomUUID(),
          id_usuario_creacion: usuarioSistema.usuario_id,
          fecha_modificacion: new Date(),
          id_usuario_modificacion: usuarioSistema.usuario_id,
          fecha_ultimo_acceso: new Date(),
          token_version: 0,
          CAT_SEXO: {
            connect: { sexo_id: Number(genero) },
          },
        },
      });
      const idEstado = await idEstadoTelefono("ACTIVO");

      const nuevoTelefono = await tx.tELEFONO_CLIENTE.create({
        data: {
          id_empresa: null,
          telefono: Number(telefono),
          id_usuario_creacion: usuarioSistema.usuario_id,
          fecha_creacion: new Date(),
          id_estado_registro: "1",
          CAT_ESTADO_TELEFONO: {
            connect: { id_estado_telefono: idEstado },
          },
          CLIENTE: {
            connect: { id_cliente: nuevoCliente.id_cliente },
          },
        },
      });

      return { nuevoCliente, nuevoTelefono };
    });

    const nuevoCliente = result.nuevoCliente;

    var token = generarTokenCliente(nuevoCliente);
    await guardarTokenRefreshCliente(
      nuevoCliente,
      token.rawRefreshToken,
      req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress,
      req.headers["user-agent"],
      null,
      token.family_id
    );

    res.cookie("refreshToken", token.rawRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      maxAge: 1 * 60 * 60 * 1000, // 1 día en ms
    });
    return res.status(201).json({
      mensaje: "Usuario creado exitosamente",
      googleSignUp: false,
      usuario: nuevoCliente.correo,
      accessToken: token.accesToken,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Error al crear el usuario", details: err.message });
  }
}

async function getRutasIniciales(req, res) {
  try {
    const rutas = await prisma.mENU.findMany({
      where: {
        menu_protegido: "0",
        id_estado_registro: "1",
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

    const opciones = rutas.flatMap((ruta) => ruta.OPCION);

    res.status(200).json({ opciones });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las rutas iniciales" });
  }
}

async function refresh(req, res) {
  try {
    const rawRefreshToken = req.cookies.refreshToken;
    if (!rawRefreshToken)
      return res.status(401).json({ error: "No token enviado" });

    const tokenHash = makeTokenId(rawRefreshToken);

    const esEmpleado = req.userMeta.hasOwnProperty("userId");
    const esCliente = req.userMeta.hasOwnProperty("id_cliente");
    if (!esEmpleado && !esCliente) {
      return res.status(403).json({ error: "No existe el usuario" });
    }

    if (esEmpleado) {
      return await refreshUsuario(tokenHash, res, req);
    } else if (esCliente) {
      return await refreshCliente(tokenHash, res, req);
    }
  } catch (error) {
    console.error("Error en refresh:", error);
    return res.status(500).json({ error: "Error en el servidor" });
  }
}
async function refreshCliente(tokenHash, res, req) {
  const tokenDB = await prisma.rEFRESH_TOKEN_CLIENTE.findUnique({
    where: { token_hash: tokenHash, AND: { revoked_at: null } },
    include: { CLIENTE: true },
  });
  if (!tokenDB) {
    return res.status(401).json({ error: "Refresh token inválido" });
  }
  if (tokenDB.revoked_at || new Date() > tokenDB.expires_at) {
    return res.status(401).json({ error: "Refresh token expirado o revocado" });
  }
  const cliente = tokenDB.CLIENTE;

  const newAccessToken = generarTokenCliente(cliente, tokenDB.family_id);

  const newRawRefreshToken = newAccessToken.rawRefreshToken;
  const newTokenHash = makeTokenId(newRawRefreshToken);
  // Marcar token antiguo como reemplazado
  await prisma.rEFRESH_TOKEN_CLIENTE.update({
    where: { id_refresh_token: tokenDB.id_refresh_token },
    data: {
      revoked_at: new Date(),
      revoked_reason: "ROTATED",
      replaced_by: undefined,
    },
  });
  // Guardar nuevo refresh token
  const newTokenDB = await prisma.rEFRESH_TOKEN_CLIENTE.create({
    data: {
      id_cliente: cliente.id_cliente,
      token_hash: newTokenHash,
      family_id: tokenDB.family_id, // mantener la misma familia
      expires_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 días
      ip: req.ip,
      user_agent: req.headers["user-agent"],
      device_fingerprint_hash: null,
    },
  });
  res.cookie("refreshToken", newRawRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Solo HTTPS en producción
    sameSite: "None",
    maxAge: 1 * 24 * 60 * 60 * 1000,
  });
  // Devolver nuevo access token
  return res.json({ accessToken: newAccessToken.accesToken });
}
async function refreshUsuario(tokenHash, res, req) {
  const tokenDB = await prisma.rEFRESH_TOKEN.findUnique({
    where: { token_hash: tokenHash, AND: { revoked_at: null } },
    include: { USUARIO: true },
  });
  if (!tokenDB) {
    return res.status(401).json({ error: "Refresh token inválido" });
  }
  // Validar expiración y revocado
  if (tokenDB.revoked_at || new Date() > tokenDB.expires_at) {
    return res.status(401).json({ error: "Refresh token expirado o revocado" });
  }
  const user = tokenDB.USUARIO;
  // Generar nuevo accessToken
  const newAccessToken = generarToken(user, tokenDB.family_id);
  const newRawRefreshToken = newAccessToken.rawRefreshToken;
  const newTokenHash = makeTokenId(newRawRefreshToken);
  // Marcar token antiguo como reemplazado
  await prisma.rEFRESH_TOKEN.update({
    where: { id_refresh_token: tokenDB.id_refresh_token },
    data: {
      revoked_at: new Date(),
      revoked_reason: "ROTATED",
      replaced_by: undefined,
    },
  });
  // Guardar nuevo refresh token
  const newTokenDB = await prisma.rEFRESH_TOKEN.create({
    data: {
      id_usuario: user.usuario_id,
      token_hash: newTokenHash,
      family_id: tokenDB.family_id,
      expires_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 días
      ip: req.ip,
      user_agent: req.headers["user-agent"],
      device_fingerprint_hash: null,
    },
  });
  // Enviar cookie al cliente
  res.cookie("refreshToken", newRawRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Solo HTTPS en producción
    sameSite: "None",
    maxAge: 1 * 24 * 60 * 60 * 1000, // 30 días
  });
  // Devolver nuevo access token
  return res.json({ accessToken: newAccessToken.accesToken });
}

async function logout(req, res) {
  const rawRefreshToken = req.cookies.refreshToken;
  if (!rawRefreshToken)
    return res.status(400).json({ error: "No token enviado" });
  const tokenHash = makeTokenId(rawRefreshToken);
  // Buscar token en la BD

  if (req.user == null) {
    return res.status(403).json({ error: "No autorizado" });
  }
  const esEmpleado = req.user.hasOwnProperty("userId");
  const esCliente = req.user.hasOwnProperty("id_cliente");

  if (!esEmpleado && !esCliente) {
    return res.status(403).json({ error: "No autorizado" });
  }

  try {
    if (esEmpleado) {
      await logoutusuario(req.user, tokenHash);
    } else if (esCliente) {
      await logoutcliente(req.user, tokenHash);
    }
  } catch (error) {
    console.error("Error al logout", error);
    return res.status(500).json({ error: "Error en el servidor" });
  }

  // Limpiar cookie
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
  });
  return res.json({ mensaje: "Logout exitoso" });
}

module.exports = {
  login,
  registro,
  getRutasIniciales,
  refresh,
  logout,
};
