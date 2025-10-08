const { PrismaClient } = require("@prisma/client");
const { formatearHora } = require("../../utils/utils");
const {
  obtenerPorcentajeIvaMetodo,
} = require("../../opcionesGenerales/general.controller");
const prisma = new PrismaClient();

async function obtenerEstadosPedido(req, res) {
  try {
    const estados = await prisma.cAT_ESTADO_PEDIDO.findMany({
      where: { id_estado_registro: "1" },
    });
    const estadosLimpios = estados.map((estado) => ({
      id_estado_pedido: estado.id_estado_pedido,
      estado_pedido: estado.estado_pedido,
    }));
    return res.status(200).json({ estados: estadosLimpios });
  } catch (error) {
    console.error("Error al traer los estados", error);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function obtnerClientes(req, res) {
  try {
    const clientes = await prisma.cLIENTE.findMany({
      select: {
        id_cliente: true,
        p_nombre: true,
        p_apellido: true,
        correo: true,
        TELEFONO_CLIENTE: {
          select: {
            telefono: true,
          },
        },
      },
    });

    const clientesLimpios = clientes.map((cliente) => ({
      id_cliente: cliente.id_cliente,
      nombre: cliente.p_nombre,
      apellido: cliente.p_apellido,
      correo: cliente.correo,
      telefonos: cliente.TELEFONO_CLIENTE.map((t) => t.telefono),
    }));

    return res.status(200).json({ clientes: clientesLimpios });
  } catch (error) {
    console.error("Error al traer los clientes", error);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function obtenerProductosPedido(req, res) {
  try {
    const productos = await prisma.pRODUCTO.findMany({
      where: {
        id_estado_registro: "1",
        CAT_ESTADO_PRODUCTO: {
          is: { id_estado_registro: "1", nombre_estado: "ACTIVO" },
        },
        publicado: true,
      },
      select: {
        p_producto_Id: true,
        nombre_producto: true,
        valor_unitario: true,
        codigo: true,
      },
    });

    const productosLimpiosRaw = await Promise.all(
      productos.map(async (producto) => {
        const ofertaProducto = await obtenerProductosOferta(
          producto.p_producto_Id
        );
        const stockProducto = await prisma.mOVIMIENTO_INVENTARIO.findFirst({
          where: { p_producto_id: producto.p_producto_Id },
          orderBy: { movimiento_inventario_Id: "desc" },
        });

        // Validamos que el producto tenga stock
        if (stockProducto?.cantidad_disponible >= 1) {
          return {
            p_producto_id: producto.p_producto_Id,
            nombre: producto.nombre_producto,
            precio: ofertaProducto?.valor_calculado ?? producto.valor_unitario,
            codigo: producto.codigo,
          };
        }

        // Si no tiene stock, no devolvemos nada
        return null;
      })
    );

    // Filtramos los nulls o undefined
    const productosLimpios = productosLimpiosRaw.filter(Boolean);

    return res.status(200).json({ productos: productosLimpios });
  } catch (error) {
    console.error("Error al traer los productos", error);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function crearPedido(req, res) {
  try {
    const usuario = req.user;
    const id_usuario_creacion = usuario?.userId || 3; // ID por defecto si no está autenticado
    const { id_cliente, productos, observacion, fecha_entrega } = req.body;

    if (usuario.id_cliente) {
      const ultimoPedido = await prisma.cLIENTE_PEDIDO.findFirst({
        where: { id_cliente: usuario.id_cliente },
        orderBy: { fecha_creacion: "desc" },
        include: { CAT_ESTADO_PEDIDO: true }, // incluir el estado para poder chequearlo
      });

      if (ultimoPedido) {
        const estadosFinalizados = ["Vencido", "Entregado", "Rechazado"];
        if (
          !estadosFinalizados.includes(
            ultimoPedido.CAT_ESTADO_PEDIDO.estado_pedido
          )
        ) {
          return res
            .status(403)
            .json({ mensaje: "No autorizado. Tienes un pedido en proceso." });
        }
      }
    }
    if (!id_cliente || !productos || productos.length === 0) {
      return res
        .status(400)
        .json({ mensaje: "Faltan datos obligatorios para crear el pedido" });
    }

    const id_estado_pedido = await prisma.cAT_ESTADO_PEDIDO
      .findFirst({
        where: { estado_pedido: "En recepcion", id_estado_registro: "1" },
      })
      .then((estado) => estado.id_estado_pedido);
    if (!id_estado_pedido) {
      return res
        .status(500)
        .json({ mensaje: "No se encontró el estado 'En recepcion'" });
    }
    const fechaEntrega = fecha_entrega
      ? new Date(fecha_entrega)
      : new Date(new Date().getTime() + 60 * 60 * 1000);
    const horaEntrega = formatearHora(fechaEntrega, "HH:MM", "prisma-time");
    const hora_creacion = formatearHora(new Date(), "HH:MM", "prisma-time");
    const nuevoPedido = await prisma.cLIENTE_PEDIDO.create({
      data: {
        cantidad_productos: productos.length,
        valor_total: productos.reduce(
          (total, prod) =>
            total + parseFloat(prod.precio) * parseInt(prod.cantidad),
          0
        ),
        fecha_creacion: new Date(),
        hora_creacion: hora_creacion,
        fecha_entrega: fechaEntrega,
        observacion: observacion || "",
        hora_entrega: horaEntrega,
        UID_PEDIDO: require("crypto").randomUUID(),
        id_estado_registro: "1",
        CLIENTE: {
          connect: { id_cliente },
        },
        CAT_ESTADO_PEDIDO: {
          connect: { id_estado_pedido },
        },
        USUARIO: { connect: { usuario_id: id_usuario_creacion } },
      },
    });
    for (const prod of productos) {
      await prisma.cLIENTE_PEDIDO_DETALLE.create({
        data: {
          id_cliente_pedido: nuevoPedido.id_cliente_pedido,
          p_producto_id: prod.p_producto_id,
          cantidad: prod.cantidad,
          cantidad_total_unidad: prod.cantidad,
          id_estado_registro: "1",
          id_usuario_creacion,
          fecha_creacion: new Date(),
        },
      });
    }

    return res
      .status(200)
      .json({ mensaje: "Pedido creado exitosamente", pedido: nuevoPedido });
  } catch (error) {
    console.error("Error al crear el pedido", error);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function obtenerPedidos(req, res) {
  try {
    const usuario = req.user;
    if (usuario.id_cliente) {
      req.query.id_cliente = usuario.id_cliente;
    }
    let { id_cliente } = req?.query;
    if (
      id_cliente === "undifined" ||
      id_cliente === undefined ||
      id_cliente === null
    ) {
      id_cliente = usuario.id_cliente;
    }
    const pedidos = await prisma.cLIENTE_PEDIDO.findMany({
      where: {
        id_estado_registro: "1",
        ...(id_cliente && { id_cliente: parseInt(id_cliente) }),
      },
      include: {
        CLIENTE: {
          select: {
            p_nombre: true,
            p_apellido: true,
            correo: true,
          },
        },
        CAT_ESTADO_PEDIDO: {
          select: {
            estado_pedido: true,
          },
        },
      },
    });
    const pedidosLimpios = pedidos.map((pedido) => ({
      id_cliente_pedido: pedido.id_cliente_pedido,
      id_cliente: pedido.id_cliente,
      nombre: pedido.CLIENTE.p_nombre,
      apellido: pedido.CLIENTE.p_apellido,
      correo: pedido.CLIENTE.correo,
      id_estado_pedido: pedido.id_estado_pedido,
      estado_pedido: pedido.CAT_ESTADO_PEDIDO.estado_pedido,
      cantidad_productos: pedido.cantidad_productos,
      valor_total: pedido.valor_total,
      fecha_creacion: pedido.fecha_creacion,
      hora_creacion: pedido.hora_creacion,
      fecha_entrega: pedido.fecha_entrega,
      hora_entrega: pedido.hora_entrega,
      fech_finalizado: pedido.fecha_finalizado,
      hora_finalizado: pedido.hora_finalizado,
      observacion: pedido.observacion,
      UID_PEDIDO: pedido.UID_PEDIDO,
    }));
    return res.status(200).json({ pedidos: pedidosLimpios });
  } catch (error) {
    console.error("Error al traer los pedidos", error);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function obtenerDetallePedido(req, res) {
  try {
    const { id_cliente_pedido } = req?.query;
    if (!id_cliente_pedido) {
      return res
        .status(400)
        .json({ mensaje: "El id_cliente_pedido es obligatorio" });
    }
    const detalles = await prisma.cLIENTE_PEDIDO_DETALLE.findMany({
      where: {
        id_cliente_pedido: parseInt(id_cliente_pedido),
        id_estado_registro: "1",
      },
      include: {
        PRODUCTO: {
          select: {
            nombre_producto: true,
            valor_unitario: true,
            codigo: true,
          },
        },
      },
    });
    const detallesLimpios = detalles.map((detalle) => ({
      id_pedido_detalle: detalle.id_pedido_detalle,
      p_producto_id: detalle.p_producto_id,
      nombre: detalle.PRODUCTO.nombre_producto,
      codigo: detalle.PRODUCTO.codigo,
      precio: detalle.PRODUCTO.valor_unitario,
      cantidad: detalle.cantidad,
      cantidad_total_unidad: detalle.cantidad_total_unidad,
      observacion: detalle.observacion,
    }));
    return res.status(200).json({ detalles: detallesLimpios });
  } catch (error) {
    console.error("Error al traer los detalles del pedido", error);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function actualizarEstadoPedido(req, res) {
  const usuario = req.user;
  if (usuario.id_cliente) {
    return res.status(403).json({ mensaje: "No autorizado" });
  }
  try {
    const usuario = req.user;
    const id_usuario_modificacion = usuario.userId;
    const { id_cliente_pedido, id_estado_pedido } = req.body;
    if (!id_cliente_pedido || !id_estado_pedido) {
      return res
        .status(400)
        .json({ mensaje: "Faltan datos obligatorios para actualizar" });
    }
    const pedidoExistente = await prisma.cLIENTE_PEDIDO.findFirst({
      where: { id_cliente_pedido },
    });
    if (!pedidoExistente) {
      return res.status(404).json({ mensaje: "El pedido no existe" });
    }
    const estado = await prisma.cAT_ESTADO_PEDIDO.findFirst({
      where: {
        id_estado_pedido: id_estado_pedido,
      },
    });
    let fechaFinalizado = null;
    let hora_finalizado = null;
    if (estado.estado_pedido.toLowerCase() === "entregado") {
      fechaFinalizado = new Date();
      hora_finalizado = formatearHora(fechaFinalizado, "HH:MM", "prisma-time");
    }
    await prisma.cLIENTE_PEDIDO.update({
      where: { id_cliente_pedido },
      data: {
        CAT_ESTADO_PEDIDO: {
          connect: { id_estado_pedido: id_estado_pedido },
        },
        id_usuario_modificacion,
        fecha_modificacion: new Date(),
        fecha_finalizado: fechaFinalizado,
        hora_finalizado: hora_finalizado,
      },
    });
    return res
      .status(200)
      .json({ mensaje: "Estado del pedido actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar el estado del pedido", error);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function obtenerProductosParaCompra(req, res) {
  try {
    const productosFormateados = [];
    const productos = await prisma.pRODUCTO.findMany({
      where: {
        id_estado_registro: "1",
        publicado: true,
      },
      select: {
        p_producto_Id: true,
        nombre_producto: true,
        valor_compra: true,
        valor_unitario: true,
        fecha_creacion: true,
        codigo: true,
        descripcion: true,
        id_estado_producto: true,
        id_tipo_producto: true,
        id_proveedor: true,
        CAT_ESTADO_PRODUCTO: {
          select: {
            nombre_estado: true,
            id_estado_producto: true,
          },
        },
        CAT_TIPO_PRODUCTO: {
          select: { nombre: true, id_tipo_producto: true },
        },
        CAT_PROVEEDOR: {
          select: { nombre_proveedor: true },
        },
        MOVIMIENTO_INVENTARIO: {
          select: { cantidad_disponible: true },
        },
      },
    });

    for (const a of productos) {
      const stockProducto = await prisma.mOVIMIENTO_INVENTARIO.findFirst({
        where: { p_producto_id: a.p_producto_Id },
        orderBy: { movimiento_inventario_Id: "desc" },
      });

      const valorFinal = await obtenerProductosOferta(a.p_producto_Id);
      if (stockProducto?.cantidad_disponible >= 1) {
        const producto = {
          p_producto_Id: a.p_producto_Id,
          codigo: a.codigo ?? "",
          nombre: a.nombre_producto,
          descripcion: a.descripcion,
          precio: a.valor_unitario,
          id_tipo_producto: a.id_tipo_producto,
          descuento: valorFinal?.valor_calculado
            ? a.valor_unitario - valorFinal.valor_calculado
            : 0,
          rating: 0,
          reviews: 0,
          imagen: "",
          imagenes: [],
          stock: stockProducto?.cantidad_disponible || 0,
          proveedor: a.CAT_PROVEEDOR?.nombre_proveedor || "Sin proveedor",
          categoria: a.CAT_TIPO_PRODUCTO?.nombre || "Sin tipo",
        };
        productosFormateados.push(producto);
      }
    }

    return res.status(200).json({ productos: productosFormateados });
  } catch (error) {
    console.error("Error productos", error);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
}
async function obtenerProductosOferta(id_producto) {
  try {
    const ofertaProducto = await prisma.pRODUCTO_OFERTA.findFirst({
      where: {
        p_producto_id: parseInt(id_producto),
        id_estado_registro: "1",
        fecha_vigencia: { gte: new Date() },
      },
      select: {
        aplica_por_porcentaje: true,
        valor_calculado: true,
        OFERTA: {
          select: {
            valor_oferta_numerico: true,
            valor_oferta_porcentaje: true,
          },
        },
      },
    });
    const valorRetorno = {
      valor_calculado: ofertaProducto?.valor_calculado || null,
      aplica_por_porcentaje: ofertaProducto?.aplica_por_porcentaje
        ? ofertaProducto.OFERTA.valor_oferta_porcentaje
        : ofertaProducto?.OFERTA.valor_oferta_numerico || null,
    };
    return valorRetorno;
  } catch (error) {
    console.error("Error productos", error);
  }
}

async function obtenerClientePorCorreo(req, res) {
  try {
    const { correo } = req?.query;

    if (!correo) {
      return res
        .status(400)
        .json({ mensaje: "El correo es un dato obligatorio" });
    }

    const cliente = await prisma.cLIENTE.findFirst({
      where: { correo },
      select: {
        id_cliente: true,
        p_nombre: true,
        p_apellido: true,
        s_nombre: true,
        s_apellido: true,
        correo: true,
        datos_actualizados: true,
        id_sexo: true,
        TELEFONO_CLIENTE: {
          select: {
            telefono: true,
            CAT_ESTADO_TELEFONO: {
              select: { id_estado_telefono: true, nombre_estado: true },
            },
            id_estado_registro: true,
          },
        },
        CLIENTE_DIRECCION_FACTURA: {
          where: { id_estado_registro: "1" },
          select: {
            id_direccion: true,
            id_cliente: true,
            DIRECCION: {
              select: {
                id_municipio: true,
                no_calle: true,
                no_casa: true,
                direccion_completa: true,
              },
            },
          },
        },
        CLIENTE_IDENTIFICACION: {
          where: {
            id_estado_registro: "1",
          },
          select: {
            id_cliente_identificacion: true,
            id_estado_registro: true,
            CAT_TIPO_DOCUMENTO: {
              select: {
                id_tipo_documento: true,
                descripcion: true,
              },
            },
          },
        },
      },
    });

    if (!cliente) {
      return res.status(404).json({ mensaje: "Cliente no encontrado" });
    }
    const direccionRaw = await Promise.all(
      cliente.CLIENTE_DIRECCION_FACTURA.map(async (d) => {
        const municipio = await prisma.cAT_MUNICIPIO.findFirst({
          where: { id_municipio: d.DIRECCION?.id_municipio },
          select: { nombre_municipio: true, id_departamento: true },
        });

        const departamento = await prisma.cAT_DEPARTAMENTO.findFirst({
          where: { id_departamento: municipio?.id_departamento },
          select: { nombre_departamento: true, id_pais: true },
        });

        const pais = await prisma.cAT_PAIS.findFirst({
          where: { id_pais: departamento?.id_pais },
          select: { nombre_pais: true },
        });

        return {
          id_direccion: d.id_direccion,
          id_municipio: d.DIRECCION?.id_municipio,
          no_calle: d.DIRECCION?.no_calle,
          no_casa: d.DIRECCION?.no_casa,
          direccion_completa: d.DIRECCION?.direccion_completa,
          municipio: municipio?.nombre_municipio ?? null,
          departamento: departamento?.nombre_departamento ?? null,
          pais: pais?.nombre_pais ?? null,
          direccion_detallada: `${d.DIRECCION?.direccion_completa}, No. Casa: ${
            d.DIRECCION?.no_casa || " "
          }, No. Calle: ${d.DIRECCION?.no_calle || " "}, ${
            municipio?.nombre_municipio || " "
          }, ${departamento?.nombre_departamento || " "}, ${
            pais?.nombre_pais || " "
          }`,
        };
      })
    );

    const clientesLimpios = {
      id_cliente: cliente.id_cliente,
      p_nombre: cliente.p_nombre,
      p_apellido: cliente.p_apellido,
      s_nombre: cliente.s_nombre,
      s_apellido: cliente.s_apellido,
      correo: cliente.correo,
      id_sexo: cliente.id_sexo,
      nit_actualizado:
        cliente.CLIENTE_IDENTIFICACION.some(
          (a) => a.CAT_TIPO_DOCUMENTO.descripcion.toLowerCase() === "nit"
        ) ?? false,
      datos_actualizados: cliente.datos_actualizados,
      telefonos: cliente.TELEFONO_CLIENTE.map((t) => ({
        telefono: t.telefono,
        estado: t.CAT_ESTADO_TELEFONO?.nombre_estado,
        id_estado_telefono: t.CAT_ESTADO_TELEFONO?.id_estado_telefono,
        id_estado_registro: t.id_estado_registro,
      })),
      identificaciones: cliente.CLIENTE_IDENTIFICACION.map((i) => ({
        id: i.id_cliente_identificacion,
        estado: i.id_estado_registro,
        tipoDoc: i.CAT_TIPO_DOCUMENTO?.id_tipo_documento,
        descripcion: i.CAT_TIPO_DOCUMENTO?.descripcion,
      })),
      direccionRaw: direccionRaw,
    };

    return res.status(200).json({ cliente: clientesLimpios });
  } catch (error) {
    console.error("Error al traer los clientes", error);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function clienteDebeActualizar(req, res) {
  try {
    const { correo } = req?.query;

    if (!correo) {
      return res
        .status(400)
        .json({ mensaje: "El ID cliente es un dato obligatorio" });
    }

    const cliente = await prisma.cLIENTE.findFirst({
      where: { correo },
      select: { datos_actualizados: true },
    });
    if (!cliente) {
      return res.status(404).json({ mensaje: "Cliente no encontrado" });
    }
    return res
      .status(200)
      .json({ datos_actualizados: cliente.datos_actualizados });
  } catch (error) {
    console.error("Error al verificar si el cliente debe actualizar", error);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function obtenerConsidenciasCorreo(req, res) {
  try {
    let { correo } = req?.query;
    if (!correo) {
      return res.status(400).json({
        error: true,
        mensaje: "Ingrese un correo para realizar la búsqueda",
      });
    }

    correo = correo.trim();

    const clientes = await prisma.CLIENTE.findMany({
      where: {
        correo: {
          contains: correo,
          mode: "insensitive",
        },
      },
      select: {
        correo: true,
      },
    });

    return res.status(200).json({ correos: clientes });
  } catch (error) {
    console.error("error en obtener correo", error);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function obtenerPedidosPorNumero(req, res) {
  try {
    const { numero_pedido } = req?.query;
    if (!numero_pedido) {
      return res
        .status(400)
        .json({ mensaje: "El numero_pedido es un dato obligatorio" });
    }
    const pedidos = await prisma.cLIENTE_PEDIDO.findMany({
      where: {
        id_cliente_pedido: Number(numero_pedido),
        CAT_ESTADO_PEDIDO: {
          is: {
            estado_pedido: {
              equals: "listo",
              mode: "insensitive",
            },
          },
        },
      },
      include: {
        CLIENTE: {
          select: {
            p_nombre: true,
            p_apellido: true,
            datos_actualizados: true,
            id_cliente: true,
            correo: true,
            CLIENTE_DIRECCION_FACTURA: {
              where: { id_estado_registro: "1" },
              select: {
                DIRECCION: {
                  select: {
                    direccion_completa: true,
                    no_calle: true,
                    no_casa: true,
                    id_municipio: true,
                  },
                },
              },
            },
            CLIENTE_IDENTIFICACION: {
              where: {
                id_estado_registro: "1",
                CAT_TIPO_DOCUMENTO: {
                  descripcion: {
                    in: ["NIT"],
                    mode: "insensitive",
                  },
                },
              },
              select: {
                id_cliente_identificacion: true,
                id_estado_registro: true,
                CAT_TIPO_DOCUMENTO: {
                  select: {
                    id_tipo_documento: true,
                    descripcion: true,
                    valor: true,
                  },
                },
              },
            },
          },
        },
        CAT_ESTADO_PEDIDO: {
          select: {
            estado_pedido: true,
          },
        },
        CLIENTE_PEDIDO_DETALLE: {
          select: {
            p_producto_id: true,
            cantidad: true,
            cantidad_total_unidad: true,
            PRODUCTO: {
              select: {
                nombre_producto: true,
                valor_unitario: true,
                codigo: true,
              },
            },
          },
        },
      },
    });
    if (pedidos.length === 0) {
      return res
        .status(404)
        .json({ mensaje: "No se encontraron pedidos listos con ese numero" });
    }
    const pedidosLimpios = await Promise.all(
      pedidos.map(async (pedido) => {
        const direccionRaw = await Promise.all(
          pedido.CLIENTE.CLIENTE_DIRECCION_FACTURA.map(async (d) => {
            const municipio = await prisma.cAT_MUNICIPIO.findFirst({
              where: { id_municipio: d.DIRECCION?.id_municipio },
              select: { nombre_municipio: true, id_departamento: true },
            });

            const departamento = await prisma.cAT_DEPARTAMENTO.findFirst({
              where: { id_departamento: municipio?.id_departamento },
              select: { nombre_departamento: true, id_pais: true },
            });

            const pais = await prisma.cAT_PAIS.findFirst({
              where: { id_pais: departamento?.id_pais },
              select: { nombre_pais: true },
            });

            return {
              id_direccion: d.id_direccion,
              id_municipio: d.DIRECCION?.id_municipio,
              no_calle: d.DIRECCION?.no_calle,
              no_casa: d.DIRECCION?.no_casa,
              direccion_completa: d.DIRECCION?.direccion_completa,
              municipio: municipio?.nombre_municipio ?? null,
              departamento: departamento?.nombre_departamento ?? null,
              pais: pais?.nombre_pais ?? null,
              direccion_detallada: `${
                d.DIRECCION?.direccion_completa || ""
              }, No. Casa: ${d.DIRECCION?.no_casa || ""}, No. Calle: ${
                d.DIRECCION?.no_calle || ""
              }, ${municipio?.nombre_municipio || ""}, ${
                departamento?.nombre_departamento || ""
              }, ${pais?.nombre_pais || ""}`,
            };
          })
        );

        const detalle = await Promise.all(
          pedido.CLIENTE_PEDIDO_DETALLE.map(async (detalle) => {
            const valorConDescuento = await obtenerProductosOferta(
              detalle.p_producto_id
            );

            return {
              id_pedido_detalle: detalle.id_pedido_detalle,
              p_producto_id: detalle.p_producto_id,
              nombre: detalle.PRODUCTO.nombre_producto,
              codigo: detalle.PRODUCTO.codigo,
              precio: Number(detalle.PRODUCTO.valor_unitario),
              descuento: valorConDescuento?.valor_calculado
                ? Number(detalle.PRODUCTO.valor_unitario) -
                  Number(valorConDescuento.valor_calculado)
                : 0,
              cantidad: Number(detalle.cantidad),
              cantidad_total_unidad: Number(detalle.cantidad_total_unidad),
              observacion: detalle.observacion,
            };
          })
        );

        return {
          id_cliente_pedido: pedido.id_cliente_pedido,
          id_cliente: pedido.id_cliente,
          nombre: pedido.CLIENTE.p_nombre,
          apellido: pedido.CLIENTE.p_apellido,
          correo: pedido.CLIENTE.correo,
          datos_actualizados: pedido.datos_actualizados,
          id_estado_pedido: pedido.id_estado_pedido,
          estado_pedido: pedido.CAT_ESTADO_PEDIDO.estado_pedido,
          nit_actualizado:
            pedido.CLIENTE.CLIENTE_IDENTIFICACION.some(
              (a) => a.CAT_TIPO_DOCUMENTO.descripcion.toLowerCase() === "nit"
            ) ?? false,
          nit: pedido.CLIENTE.CLIENTE_IDENTIFICACION[0]
            ?.id_cliente_identificacion,
          cantidad_productos: pedido.cantidad_productos,
          valor_total: pedido.valor_total,
          fecha_creacion: pedido.fecha_creacion,
          hora_creacion: pedido.hora_creacion,
          fecha_entrega: pedido.fecha_entrega,
          hora_entrega: pedido.hora_entrega,
          fecha_finalizado: pedido.fecha_finalizado,
          hora_finalizado: pedido.hora_finalizado,
          observacion: pedido.observacion,
          UID_PEDIDO: pedido.UID_PEDIDO,
          direccion: direccionRaw[0]?.direccion_detallada,
          detalle_pedido: detalle,
          informacion_linea: `No Pedido ${pedido.id_cliente_pedido}, Nombre ${
            pedido.CLIENTE.p_nombre
          } ${pedido.CLIENTE.p_apellido}, Dirección ${
            direccionRaw[0]?.direccion_detallada || ""
          }`,
        };
      })
    );

    return res.status(200).json({ pedidos: pedidosLimpios });
  } catch (error) {
    console.error("Error al traer los pedidos", error);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function crearFacturaCliente(req, res) {
  try {
    const usuario = req.user;
    const id_usuario_creacion = usuario.userId;

    const {
      id_factura_cliente,
      id_cliente,
      id_cliente_pedido,
      id_estado_factura,
      id_tipo_pago,
      direccion_factura,
      telefono,
      nit,
      persona,
      detalle, // array de productos con: p_producto_id, cantidad, precio, descuento
      fecha_vencimiento, // opcional por si se creo por pedido
    } = req.body;

    const esFacturaValida =
      id_factura_cliente !== undefined &&
      id_factura_cliente !== null &&
      id_factura_cliente !== "" &&
      !isNaN(Number(id_factura_cliente));

    let porcentajeIva = await obtenerPorcentajeIvaMetodo();
    porcentajeIva = Number(porcentajeIva.iva) || 0;

    /// validar existencias producto
    for (const item of detalle) {
      const ultimoMovimiento = await prisma.mOVIMIENTO_INVENTARIO.findFirst({
        where: { p_producto_id: item.p_producto_id },
        orderBy: { movimiento_inventario_Id: "desc" },
      });
      const stockAnterior = ultimoMovimiento?.cantidad_disponible ?? 0;
      if (stockAnterior < item.cantidad) {
        const producto = await prisma.pRODUCTO.findFirst({
          where: { p_producto_Id: item.p_producto_id },
          select: { nombre_producto: true },
        });

        return res.status(400).json({
          ok: false,
          mensaje: `No hay suficiente stock para el producto ${producto?.nombre_producto} (ID: ${item.p_producto_id})`,
        });
        break;
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const tipoMovimiento = await tx.cAT_TIPO_MOVIMIENTO.findFirst({
        where: { tipo_movimiento: "SALIDA" },
        select: { id_tipo_movimiento: true },
      });

      const razonMovimiento = await tx.cAT_RAZON_MOVIMIENTO.findFirst({
        where: { razon_movimiento: "Venta" },
        select: { id_razon_movimiento: true },
      });

      if (!tipoMovimiento || !razonMovimiento) {
        throw new Error("Catálogo de movimiento o razón no encontrado");
      }

      const subtotalFactura = detalle.reduce(
        (acc, item) => acc + item.cantidad * item.precio,
        0
      );
      const impuestosFactura = (porcentajeIva / 100) * subtotalFactura;
      const totalFactura = subtotalFactura + impuestosFactura;

      // Crear o actualizar factura
      let facturaCliente;
      if (esFacturaValida) {
        facturaCliente = await tx.fACTURA_CLIENTE.update({
          where: { id_factura_cliente: Number(id_factura_cliente) },
          data: {
            id_cliente,
            id_cliente_pedido,
            id_estado_factura,
            id_tipo_pago,
            direccion_factura,
            telefono,
            nit,
            persona,
            fecha_modificacion: new Date(),
            fecha_vencimiento: fecha_vencimiento
              ? new Date(fecha_vencimiento)
              : null,
            subtotal: subtotalFactura,
            impuestos: impuestosFactura,
            total: totalFactura,
            id_usuario_modificacion: id_usuario_creacion,
          },
        });

        // Eliminar detalles previos
        await tx.fACTURA_CLIENTE_DETALLE.deleteMany({
          where: { id_factura_cliente: facturaCliente.id_factura_cliente },
        });
      } else {
        facturaCliente = await tx.fACTURA_CLIENTE.create({
          data: {
            id_cliente,
            id_cliente_pedido,
            id_estado_factura,
            id_tipo_pago,
            direccion_factura,
            telefono,
            nit,
            persona,
            numero_factura: `FC-${Date.now()}-${Math.floor(
              Math.random() * 1000
            )}`, // Generar un número único
            serie_factura: generarSerieUnica(), // Valor por defecto o generar según lógica
            fecha_emision: new Date(),
            fecha_modificacion: new Date(),
            fecha_vencimiento: fecha_vencimiento
              ? new Date(fecha_vencimiento)
              : null,
            subtotal: subtotalFactura,
            impuestos: impuestosFactura,
            total: totalFactura,
            id_usuario_creacion,
          },
        });
      }

      // Preparar datos para createMany
      const detallesData = detalle.map((item) => {
        const subtotalItem = item.cantidad * item.precio;
        const impuestosItem = (porcentajeIva / 100) * subtotalItem;
        const totalItem = subtotalItem + impuestosItem;
        return {
          id_factura_cliente: facturaCliente.id_factura_cliente,
          p_producto_id: item.p_producto_id,
          cantidad: item.cantidad,
          cantidad_total_unidad: item.cantidad,
          descuento: item.descuento ?? 0,
          subtotal: subtotalItem,
          impuestos: impuestosItem,
          total: totalItem,
          observacion: "",
          fecha_creacion: new Date(),
          id_usuario_creacion,
          id_estado_registro: "1",
        };
      });

      // Crear detalles de la factura de por muchos
      await tx.fACTURA_CLIENTE_DETALLE.createMany({ data: detallesData });

      // Registrar movimientos de inventario
      for (const item of detalle) {
        const ultimoMovimiento = await tx.mOVIMIENTO_INVENTARIO.findFirst({
          where: { p_producto_id: item.p_producto_id },
          orderBy: { movimiento_inventario_Id: "desc" },
        });

        const stockAnterior = ultimoMovimiento?.cantidad_disponible ?? 0;
        const nuevoStock = stockAnterior - item.cantidad;

        let cliente = null;
        if (id_cliente === null || id_cliente === undefined) {
          cliente = await tx.cLIENTE.findFirst({
            where: { id_cliente },
            select: { p_nombre: true, p_apellido: true },
          });
        }
        cliente === null || cliente === undefined
          ? persona
          : "Nombre:" + cliente.p_nombre + "Apellido:" + cliente.p_apellido;

        await tx.mOVIMIENTO_INVENTARIO.create({
          data: {
            p_producto_id: item.p_producto_id,
            id_estado_registro: "1",
            cantidad_disponible: nuevoStock,
            fecha_creacion: new Date(),
            id_usuario_creacion,
            valor_total_unitario: item.precio,
            cantidad_entra: 0,
            cantidad_sale: item.cantidad,
            id_tipo_movimiento: tipoMovimiento.id_tipo_movimiento,
            id_razon_movimiento: razonMovimiento.id_razon_movimiento,
            observacion: `Salida por factura cliente ${facturaCliente.id_factura_cliente} , ${cliente}`,
          },
        });
      }
      const estadoFacturado = await prisma.cAT_ESTADO_PEDIDO.findFirst({
        where: {
          estado_pedido: {
            equals: "Entregado",
            mode: "insensitive",
          },
        },
      });

      await prisma.cLIENTE_PEDIDO.update({
        where: { id_cliente_pedido: id_cliente_pedido },
        data: {
          id_estado_registro: "1",
          CAT_ESTADO_PEDIDO: {
            connect: { id_estado_pedido: estadoFacturado.id_estado_pedido },
          },
          id_usuario_modificacion: id_usuario_creacion,
          fecha_modificacion: new Date(),
        },
      });

      return facturaCliente;
    });

    return res.json({
      ok: true,
      mensaje: "Factura cliente y detalles registrados correctamente",
      facturaCliente: result,
    });
  } catch (error) {
    console.error("Error en crearFacturaCliente:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al registrar la factura cliente",
      error: error.message,
    });
  }
}
function generarSerieUnica() {
  const letras = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const numeros = Math.floor(100 + Math.random() * 900); // entre 100 y 999
  return `${letras}${numeros}`;
}

async function obtenerFacturasClientes(req, res) {
  try {
    const facturasObtenidas = await prisma.fACTURA_CLIENTE.findMany({
      select: {
        id_factura_cliente: true,
        CLIENTE: {
          select: {
            p_nombre: true,
            p_apellido: true,
            id_cliente: true,
          },
        },
        id_cliente: true,
        serie_factura: true,
        numero_factura: true,
        id_cliente_pedido: true,
        id_estado_factura: true,
        id_tipo_pago: true,
        direccion_factura: true,
        telefono: true,
        nit: true,
        persona: true,
        numero_factura: true,
        serie_factura: true,
        fecha_emision: true,
        fecha_vencimiento: true,
        subtotal: true,
        impuestos: true,
        total: true,
        fecha_modificacion: true,
        id_usuario_creacion: true,
        id_usuario_modificacion: true,
        FACTURA_CLIENTE_DETALLE: {
          select: {
            id_factura_cliente_detalle: true,
            p_producto_id: true,
            PRODUCTO: {
              select: {
                nombre_producto: true,
                valor_unitario: true,
                codigo: true,
              },
            },
            cantidad: true,
            cantidad_total_unidad: true,
            descuento: true,
            subtotal: true,
            impuestos: true,
            total: true,
            observacion: true,
            fecha_creacion: true,
            id_usuario_creacion: true,
            id_estado_registro: true,
          },
        },
      },
    });

    const cantidadProductosDetalle =
      await prisma.fACTURA_CLIENTE_DETALLE.groupBy({
        by: ["id_factura_cliente"],
        _sum: {
          cantidad: true,
        },
      });

    const facturas = facturasObtenidas.map((factura) => ({
      ...factura,
      numero:  factura.numero_factura,
      serie:  factura.serie_factura,
      nombre_cliente: factura.persona ? factura.persona : "Consumidor Final",
      fecha_emision: factura.fecha_emision,
      crearPorPedido: factura.id_cliente_pedido ? true : false,
      detalle: factura.FACTURA_CLIENTE_DETALLE.map((detalle) => ({
        id_factura_cliente_detalle: detalle.id_factura_cliente_detalle,
        p_producto_Id: detalle.p_producto_id,
        nombre: detalle.PRODUCTO?.nombre_producto || "Producto no disponible",
        codigo: detalle.PRODUCTO?.codigo || "No disponible",
        cantidad: detalle.cantidad,
        cantidad_total_unidad: detalle.cantidad_total_unidad,
        descuento: detalle.descuento ? Number(detalle.descuento) : 0,
        precio: detalle.subtotal ? detalle.subtotal : 0,
        impuestos: detalle.impuestos ? Number(detalle.impuestos) : 0,
        total: detalle.total ? Number(detalle.total) : 0,
        observacion: detalle.observacion,
        fecha_creacion: detalle.fecha_creacion,
        id_usuario_creacion: detalle.id_usuario_creacion,
        id_estado_registro: detalle.id_estado_registro,
      })),
      fecha_vencimiento: factura.fecha_vencimiento,
      cantidad_productos:
        cantidadProductosDetalle.find(
          (det) => det.id_factura_cliente === factura.id_factura_cliente
        )?._sum.cantidad || 0,
    }));

    /* const facturasLimpias = facturas.map(async (factura) => {
      const cliente = await prisma.cLIENTE.findFirst({
        where: { id_cliente: factura.id_cliente },
        select: { p_nombre: true, p_apellido: true, correo: true },
      });
      return {
        ...factura,
        nombre_cliente: cliente
          ? `${cliente.p_nombre} ${cliente.p_apellido}`
          : "Cliente no registrado",
        correo_cliente: cliente ? cliente.correo : "No disponible",
      };
    });*/

    return res.status(200).json({ facturas });
  } catch (error) {
    console.error("Error al traer las facturas de clientes", error);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

module.exports = {
  obtenerFacturasClientes,
  crearFacturaCliente,
  obtenerProductosOferta,
  obtenerPedidosPorNumero,
  clienteDebeActualizar,
  obtenerConsidenciasCorreo,
  obtenerClientePorCorreo,
  actualizarEstadoPedido,
  obtenerDetallePedido,
  obtenerPedidos,
  crearPedido,
  obtenerProductosPedido,
  obtenerEstadosPedido,
  obtnerClientes,
  obtenerProductosParaCompra,
};
