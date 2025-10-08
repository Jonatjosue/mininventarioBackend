const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function actualizarCliente(req, res) {
  try {
    const esEmpleado = req.user.hasOwnProperty("userId");
    const esCliente = req.user.hasOwnProperty("id_cliente");
    let {
      id_cliente,
      p_nombre,
      p_apellido,
      s_nombre,
      s_apellido,
      id_sexo,
      correo,
    } = req.body;
    if (esCliente) {
      id_cliente = req.user.id_cliente;
    }

    const resultado = await prisma.$transaction(async (tx) => {
      if (
        id_cliente === undefined ||
        p_nombre === undefined ||
        s_nombre === undefined ||
        s_apellido === undefined ||
        id_sexo === undefined ||
        correo === undefined
      ) {
        return res.status(400).json({ error: "Faltan datos obligatorios" });
      }
      const clienteExistente = await tx.cLIENTE.findFirst({
        where: { id_cliente },
      });
      const correoExistente = await tx.cLIENTE.findFirst({
        where: { correo, NOT: { id_cliente } },
      });
      if (!clienteExistente) {
        return res.status(404).json({ error: "Cliente no encontrado" });
      }
      if (correo === null || correo === "") {
        return res
          .status(400)
          .json({ error: "El correo no puede estar vacío" });
      }
      if (correoExistente) {
        return res.status(400).json({ error: "Correo ya en uso" });
      }
      let idsexo = Number(id_sexo);
      const clienteActualizado = await tx.cLIENTE.update({
        where: { id_cliente },
        data: {
          p_nombre,
          p_apellido,
          s_nombre,
          s_apellido,
          id_sexo: idsexo,
          correo,
          id_usuario_modificacion: esCliente ? null : req.user.userId ?? null,
          fecha_modificacion: new Date(),
        },
      });
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

      await tx.bITACORA_MODIFICACION.create({
        data: {
          entidad_modificada: "CLIENTE",
          fecha_modificacion: new Date().toString(),
          id_entidad_modificada: clienteActualizado.id_cliente,
          usuario_modifica: esCliente
            ? `Cliente ${personaCrea}`
            : `Usuario ${personaCrea}`,
          valor_modificado_varchar: `Cliente Modificado:
                                         ${clienteActualizado.p_nombre}, 
                                         ${clienteActualizado.p_apellido} , 
                                         ${clienteActualizado.s_nombre},
                                         ${clienteActualizado.s_apellido},
                                         ${clienteActualizado.correo}, 
                                    Sexo:${clienteActualizado.id_sexo}`,
          observacion: `Creación de nueva dirección en el sistema por ${personaCrea}`,
        },
      });

      return clienteActualizado;
    });
    return res.status(200).json({
      mensaje: esCliente ? "Informacion Actualizada" : "Cliente actualizado",
    });
  } catch (error) {
    console.error("Error al actualizar el cliente:", error);
    return res.status(500).json({ error: "Error al actualizar el cliente" });
  }
}

async function crearDocumentoIdentificacion(req, res) {
  try {
    const { id_tipo_documento, id_cliente, id_cliente_identificacion } =
      req.body;

    if (!id_tipo_documento || !id_cliente) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const esEmpleado = req.user.hasOwnProperty("userId");
    const esCliente = req.user.hasOwnProperty("id_cliente");

    const clienteExistente = await prisma.cLIENTE.findFirst({
      where: { id_cliente },
    });
    if (!clienteExistente)
      return res.status(404).json({ error: "Cliente no encontrado" });

    const identificacionExistente =
      await prisma.cLIENTE_IDENTIFICACION.findFirst({
        where: { id_cliente_identificacion },
      });
    if (identificacionExistente) {
      return res
        .status(200)
        .json({ error: "El cliente ya tiene tipo de documento creado" });
    }

    const resultado = await prisma.$transaction(async (tx) => {
      // Verificar que el tipo de documento existe
      const tipoDocumento = await tx.CAT_TIPO_DOCUMENTO.findFirst({
        where: { id_tipo_documento },
      });
      if (!tipoDocumento)
        return res
          .status(404)
          .json({ error: "Tipo de documento no encontrado" });

      // Crear la identificación
      const nuevaIdentificacion = await tx.cLIENTE_IDENTIFICACION.create({
        data: {
          id_cliente_identificacion, // solo si no es autoincrement
          CAT_TIPO_DOCUMENTO: { connect: { id_tipo_documento } },
          CLIENTE: { connect: { id_cliente } },
          id_estado_registro: "1",
          fecha_creacion: new Date(),
          id_usuario_creacion: req.user.userId ?? null,
          id_usuario_modificacion: null,
          fecha_modificacion: new Date(),
        },
      });

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

      // Crear bitácora
      const bitacora = await tx.bITACORA_MODIFICACION.create({
        data: {
          entidad_modificada: "CLIENTE_IDENTIFICACION",
          fecha_modificacion: new Date().toISOString(),
          id_entidad_modificada: nuevaIdentificacion.id_cliente,
          usuario_modifica: esCliente
            ? `Cliente ${personaCrea}`
            : `Usuario ${personaCrea}`,
          valor_modificado_varchar: `Cliente identificacion creado:
                                      ${nuevaIdentificacion.id_cliente_identificacion}, 
                                      ${tipoDocumento.descripcion}, 
                                      ${nuevaIdentificacion.id_cliente},
                                      ${nuevaIdentificacion.id_estado_registro}`,
          observacion: `Creación de nueva identificacion en el sistema por ${personaCrea}`,
        },
      });

      // Actualizar identificación con id de bitácora si aplica
      await tx.cLIENTE_IDENTIFICACION.update({
        where: {
          id_cliente_identificacion:
            nuevaIdentificacion.id_cliente_identificacion,
        },
        data: { id_bitacora_modificacion: bitacora.id_bitacora_modificacion },
      });

      return nuevaIdentificacion;
    });

    return res
      .status(201)
      .json({ mensaje: "Identificación creada", resultado });
  } catch (error) {
    console.error("Error al crear el tipo de identificación:", error);
    return res
      .status(500)
      .json({ error: "Error al crear el tipo de identificación." });
  }
}

async function crearTelefonosContacto(req, res) {
  try {
    const { id_cliente, telefonos, id_estado_telefono } = req.body;

    if (!id_cliente || !Array.isArray(telefonos) || telefonos.length === 0) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const esEmpleado = req.user.hasOwnProperty("userId");
    const esCliente = req.user.hasOwnProperty("id_cliente");
    const clienteExistente = await prisma.cLIENTE.findFirst({
      where: { id_cliente },
    });
    if (!clienteExistente)
      return res.status(404).json({ error: "Cliente no encontrado" });
    const resultado = await prisma.$transaction(async (tx) => {
      const nuevosTelefonos = [];
      for (const tel of telefonos) {
        const { telefono, id_estado_telefono } = tel;
        if (!telefono || !id_estado_telefono) {
          return res.status(400).json({
            error: "Faltan datos obligatorios en uno de los teléfonos",
          });
        }
        const telefonoExistente = await tx.tELEFONO_CLIENTE.findFirst({
          where: {
            telefono: parseInt(telefono),
            id_cliente: Number(id_cliente),
          },
        });
        if (telefonoExistente?.telefono === parseInt(telefono)) {
          const actualizarEstadoTelefono = await tx.tELEFONO_CLIENTE.update({
            where: {
              id_telefono_cliente: telefonoExistente.id_telefono_cliente,
            },
            data: {
              CAT_ESTADO_TELEFONO: {
                connect: { id_estado_telefono: Number(id_estado_telefono) },
              },
            },
          });
          nuevosTelefonos.push(actualizarEstadoTelefono);
          continue;
        } else {
          const telefonoCreado = await tx.tELEFONO_CLIENTE.create({
            data: {
              telefono: Number(telefono),
              id_estado_telefono: Number(id_estado_telefono),
              id_cliente,
              id_estado_registro: "1",
              fecha_creacion: new Date(),
            },
          });
          nuevosTelefonos.push(telefonoCreado);
        }
      }

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
      await tx.bITACORA_MODIFICACION.create({
        data: {
          entidad_modificada: "TELEFONO_CLIENTE",
          fecha_modificacion: new Date().toISOString(),
          id_entidad_modificada: id_cliente,
          usuario_modifica: esCliente
            ? `Cliente ${personaCrea}`
            : `Usuario ${personaCrea}`,
          valor_modificado_varchar: `Telefonos creados para el cliente ${id_cliente}: ${nuevosTelefonos
            .map((t) => t.telefono)
            .join(", ")}`,
          observacion: `Creación de nuevos teléfonos en el sistema por ${personaCrea}`,
        },
      });
      return nuevosTelefonos;
    });
    return res.status(201).json({ mensaje: "Teléfonos creados", resultado });

    /**model TELEFONO_CLIENTE {
  telefono            Int
  id_empresa          Int?
  fecha_creacion      DateTime            @db.Date
  id_usuario_creacion Int?
  id_estado_registro  String              @db.Bit(1)
  id_estado_telefono  Int
  id_cliente          Int
  id_telefono_cliente Int                 @id(map: "pk_telefono_cliente") @default(autoincrement())
  CLIENTE             CLIENTE             @relation(fields: [id_cliente], references: [id_cliente], onDelete: NoAction, onUpdate: NoAction)
  CAT_ESTADO_TELEFONO CAT_ESTADO_TELEFONO @relation(fields: [id_estado_telefono], references: [id_estado_telefono], onDelete: NoAction, onUpdate: NoAction)

  @@index([telefono, id_empresa], map: "TELEFONO_CLIENTE_index_0")
}
 */
  } catch (error) {
    console.error("Error al crear los telefonos de contacto:", error);
    return res.status(500).json({ error: "Error al crear los telefonos" });
  }
}

module.exports = {
  actualizarCliente,
  crearDocumentoIdentificacion,
  crearTelefonosContacto,
};
