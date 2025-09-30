const { PrismaClient } = require("@prisma/client");
const { formatearHora } = require("../../utils/utils");
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
    const productosLimpios = productos.map((producto) => ({
      p_producto_id: producto.p_producto_Id,
      nombre: producto.nombre_producto,
      precio: producto.valor_unitario,
      codigo: producto.codigo,
    }));
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

      const producto = {
        p_producto_Id: a.p_producto_Id,
        codigo: a.codigo ?? "",
        nombre: a.nombre_producto,
        descripcion: a.descripcion,
        precio: a.valor_unitario,
        id_tipo_producto: a.id_tipo_producto,
        descuento: 0,
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

    return res.status(200).json({ productos: productosFormateados });
  } catch (error) {
    console.error("Error productos", error);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

module.exports = {
  actualizarEstadoPedido,
  obtenerDetallePedido,
  obtenerPedidos,
  crearPedido,
  obtenerProductosPedido,
  obtenerEstadosPedido,
  obtnerClientes,
  obtenerProductosParaCompra,
};
