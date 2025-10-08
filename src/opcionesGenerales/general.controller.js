const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function obtenerPais(req, res) {
  try {
    const pais = await prisma.cAT_PAIS.findMany({
      where: { id_pais: 1 },
      orderBy: { id_pais: "asc" },
      select: { id_pais: true, nombre_pais: true },
    });
    return res.status(200).json({ pais });
  } catch (error) {
    console.error("Error al obtener el país:", error);
    return res.status(500).json({ error: "Error al obtener el país" });
  }
}

async function obtenerDepartamento(req, res) {
  try {
    const paisId = parseInt(req.query.paisId) || 1;
    const departamento = await prisma.cAT_DEPARTAMENTO.findMany({
      orderBy: { id_departamento: "asc" },
      select: { id_departamento: true, nombre_departamento: true },
    });
    return res.status(200).json({ departamento });
  } catch (error) {
    console.error("Error al obtener el departamento:", error);
    return res.status(500).json({ error: "Error al obtener el departamento" });
  }
}

async function obtenerMunicipio(req, res) {
  try {
    const departamentoId = parseInt(req.query.departamentoId);
    if (isNaN(departamentoId)) {
      return res.status(400).json({ error: "ID de departamento inválido" });
    }
    const obtenerMunicipio = await prisma.cAT_MUNICIPIO.findMany({
      orderBy: { id_municipio: "asc" },
      where: { id_departamento: departamentoId },
      select: { id_municipio: true, nombre_municipio: true },
    });
    return res.status(200).json({ obtenerMunicipio });
  } catch (error) {
    console.error("Error al obtener el municipio:", error);
    return res.status(500).json({ error: "Error al obtener el municipio" });
  }
}

async function crearDireccion(req, res) {
  try {
    const esEmpleado = req.user.hasOwnProperty("userId");
    const esCliente = req.user.hasOwnProperty("id_cliente");

    const {
      id_pais,
      id_departamento,
      id_municipio,
      direccion_detallada,
      id_cliente = 0,
      id_usuario = 0,
      no_casa = "",
      no_calle = "",
    } = req.body;

    if (id_cliente !== 0 && id_usuario !== 0) {
      return res.status(400).json({
        error: "Solo puede crear dirección para cliente o usuario, no ambos.",
      });
    }

    if (!id_pais || !id_departamento || !id_municipio || !direccion_detallada) {
      return res.status(400).json({ error: "Faltan datos obligatorios." });
    }

    // 🚀 Inicia la transacción
    const resultado = await prisma.$transaction(async (tx) => {
      // Crear dirección
      const nuevaDireccion = await tx.dIRECCION.create({
        data: {
          id_municipio,
          direccion_completa: direccion_detallada,
          no_casa,
          no_calle,
          id_estado_registro: "1",
          id_usuario_creacion: esCliente ? null : req.user.userId ?? null,
          id_usuario_modificacion: esCliente ? null : req.user.userId ?? null,
          fecha_creacion: new Date(),
          fecha_modificacion: new Date(),
        },
      });

      // Actualizar cliente o usuario según corresponda
      if (id_cliente !== 0) {
        await tx.cLIENTE_DIRECCION_FACTURA.updateMany({
          where: { id_cliente, id_estado_registro: "1" },
          data: { id_estado_registro: "0" },
        });

        await tx.cLIENTE_DIRECCION_FACTURA.create({
          data: {
            id_cliente,
            id_direccion: nuevaDireccion.id_direccion,
            id_estado_registro: "1",
          },
        });
      } else if (id_usuario !== 0) {
        await tx.uSUARIO.updateMany({
          where: { usuario_id: id_usuario, id_estado_registro: "1" },
          data: { id_direccion: nuevaDireccion.id_direccion },
        });
      }

      // Obtener correo de quien crea
      const personaCrea = esCliente
        ? (
            await tx.cLIENTE.findFirst({
              where: { id_cliente: req.user.id_cliente },
              select: { correo: true },
            })
          )?.correo
        : (
            await tx.uSUARIO.findFirst({
              where: { usuario_id: req.user.userId },
              select: { correo_principal: true },
            })
          )?.correo_principal;

      // Registrar bitácora
      const bitacora = await tx.bITACORA_MODIFICACION.create({
        data: {
          entidad_modificada: "DIRECCION",
          fecha_modificacion: new Date().toISOString(),
          id_entidad_modificada: nuevaDireccion.id_direccion,
          usuario_modifica: esCliente
            ? `Cliente ${personaCrea}`
            : `Usuario ${personaCrea}`,
          valor_modificado_varchar: `Dirección creada: ${direccion_detallada} No. Casa: ${no_casa} No. Calle: ${no_calle}`,
          observacion: `Creación de nueva dirección en el sistema por ${personaCrea}`,
        },
      });
      // se actualiza la dirección con el id de la bitácora
      await tx.dIRECCION.update({
        where: { id_direccion: nuevaDireccion.id_direccion },
        data: { id_bitacora_modificacion: bitacora.id_bitacora_modificacion },
      });
      // Retornar dirección para usar fuera de la transacción
      return nuevaDireccion;
    });

    // Si todo fue exitoso
    return res.status(201).json({
      message: "Dirección creada exitosamente",
      direccion: resultado,
    });
  } catch (error) {
    console.error("Error al crear la dirección:", error);
    return res.status(500).json({ error: "Error al crear la dirección." });
  }
}

async function obtenerTiposIdentificacion(req, res) {
  try {
    const tiposIdentificacion = await prisma.cAT_TIPO_DOCUMENTO.findMany({
      where: { id_estado_registro: "1" },
      orderBy: { id_tipo_documento: "asc" },
      select: { id_tipo_documento: true, descripcion: true, valor: true },
    });
    return res.status(200).json({ tiposIdentificacion });
  } catch (error) {
    console.error("Error al obtener los tipos de identificación:", error);
    return res
      .status(500)
      .json({ error: "Error al obtener los tipos de identificación" });
  }
}

async function obtenerEstadotelefono(req, res) {
  try {
    const estadosTelefono = await prisma.cAT_ESTADO_TELEFONO.findMany({
      where: { id_estado_registro: "1" },
      orderBy: { id_estado_telefono: "asc" },
      select: { id_estado_telefono: true, nombre_estado: true },
    });
    return res.status(200).json({ estadosTelefono });
  } catch (error) {
    console.error("Error al obtener los estados de teléfono:", error);
    return res
      .status(500)
      .json({ error: "Error al obtener los estados de teléfono" });
  }
}

async function obtenerPorcentajeIva(req, res) {
  try {
    const valorIva = await prisma.cONFIGURACION_GENERAL.findFirst({
      where: { parametro_var_1: "iva" },
      select: { parametro_des_1: true },
    });
    if (!valorIva) {
      return res
        .status(404)
        .json({ error: "Configuración de IVA no encontrada" });
    }
    return res.status(200).json({ iva: valorIva.parametro_des_1 });
  } catch (error) {
    console.error("Error al obtener el porcentaje de IVA:", error);
    return res
      .status(500)
      .json({ error: "Error al obtener el porcentaje de IVA" });
  }
}

async function obtenerPorcentajeIvaMetodo() {
  try {
    const valorIva = await prisma.cONFIGURACION_GENERAL.findFirst({
      where: { parametro_var_1: "iva" },
      select: { parametro_des_1: true },
    });
    return { iva: valorIva?.parametro_des_1 };
  } catch (error) {
    console.error("Error al obtener el porcentaje de IVA:", error);
    return { error: "Error al obtener el porcentaje de IVA" };
  }
}

module.exports = {
  obtenerPorcentajeIvaMetodo,
  obtenerPorcentajeIva,
  obtenerEstadotelefono,
  obtenerTiposIdentificacion,
  obtenerPais,
  crearDireccion,
  obtenerDepartamento,
  obtenerMunicipio,
};
