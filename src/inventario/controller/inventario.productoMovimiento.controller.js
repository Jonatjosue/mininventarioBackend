const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function obtenerEstadosProducto(req, res) {
  try {
    const estados = await prisma.cAT_ESTADO_PRODUCTO.findMany({
      where: {
        id_estado_registro: "1",
      },
    });
    const estadosLimpios = estados.map((estado) => ({
      id_estado_producto: estado.id_estado_producto,
      estado: estado.nombre_estado,
    }));
    return res.status(200).json({ estados: estadosLimpios });
  } catch (error) {
    console.error("Error al traer los estados", error);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function obtenerProductos(req, res) {
  try {
    const productosFormateados = [];
    const productos = await prisma.pRODUCTO.findMany({
      where: {
        id_estado_registro: "1",
      },
      select: {
        p_producto_Id: true,
        nombre_producto: true,
        valor_compra: true,
        valor_unitario: true,
        fecha_creacion: true,
        codigo: true,
        publicado: true,
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
          select: { nombre: true },
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
        nombre: a.nombre_producto,
        precioCompra: a.valor_compra,
        publicado: a.publicado || false,
        precioVenta: a.valor_unitario,
        id_estado_producto: a.id_estado_producto,
        id_tipo_producto: a.id_tipo_producto,
        id_proveedor: a.id_proveedor,
        nombre_estado: a.CAT_ESTADO_PRODUCTO?.nombre_estado || "",
        stock: stockProducto?.cantidad_disponible || 0,
        codigo: a.codigo ?? "",
        proveedor: a.CAT_PROVEEDOR?.nombre_proveedor || "Sin proveedor",
        categoria: a.CAT_TIPO_PRODUCTO?.nombre || "Sin tipo",
        descripcion: a.descripcion,
      };

      productosFormateados.push(producto);
    }

    return res.status(200).json({ productos: productosFormateados });
  } catch (error) {
    console.error("Error productos", error);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function crearProducto(req, res) {
  try {
    const {
      descripcion,
      id_proveedor,
      id_tipo_producto,
      id_estado_producto,
      nombre_producto,
      valor_compra,
      valor_unitario,
      codigo,
      publicado,
    } = req.body;

    const usuario = req.user;
    const id_usuario_creacion = usuario.userId;

    const producto = await prisma.pRODUCTO.create({
      data: {
        descripcion: descripcion,
        fecha_creacion: new Date(),
        fecha_modificacion: new Date(),
        id_estado_producto: id_estado_producto,
        id_estado_registro: "1",
        id_proveedor: id_proveedor,
        id_tipo_producto: id_tipo_producto,
        id_usuario_creacion: id_usuario_creacion,
        id_usuario_modificacion: id_usuario_creacion,
        nombre_producto: nombre_producto,
        valor_compra: Number(valor_compra),
        valor_unitario: Number(valor_unitario),
        codigo: codigo,
        publicado: publicado,
      },
    });

    const categoria = await prisma.cAT_TIPO_PRODUCTO.findFirst({
      where: {
        id_tipo_producto: producto.id_tipo_producto,
      },
    });
    producto.categoria = categoria.nombre;
    return res.status(200).json({ producto: producto });
  } catch (error) {
    console.error("error al crear producto", error);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function actualizarProducto(req, res) {
  try {
    const {
      p_producto_Id,
      descripcion,
      id_proveedor,
      id_tipo_producto,
      id_estado_producto,
      nombre_producto,
      valor_compra,
      valor_unitario,
      codigo,
      publicado,
    } = req.body;

    const usuario = req.user;
    const id_usuario_modificacion = usuario.userId;

    const productoActualizado = await prisma.pRODUCTO.update({
      where: { p_producto_Id: Number(p_producto_Id) },
      data: {
        descripcion,
        id_estado_producto,
        id_proveedor,
        id_tipo_producto,
        nombre_producto,
        codigo: codigo,
        valor_compra: Number(valor_compra),
        valor_unitario: Number(valor_unitario),
        id_usuario_modificacion,
        fecha_modificacion: new Date(),
        publicado: publicado,
      },
    });

    const producto = await prisma.pRODUCTO.findFirst({
      where: {
        p_producto_Id: Number(p_producto_Id),
      },
      select: {
        p_producto_Id: true,
        nombre_producto: true,
        valor_compra: true,
        valor_unitario: true,
        fecha_creacion: true,
        codigo: true,
        publicado: true,
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
          select: { nombre: true },
        },
        CAT_PROVEEDOR: {
          select: { nombre_proveedor: true },
        },
        MOVIMIENTO_INVENTARIO: {
          select: { cantidad_disponible: true },
          take: 1,
          orderBy: { movimiento_inventario_Id: "desc" },
        },
      },
    });

    const formtateaPRoducosAcutalizados = {
      p_producto_Id: producto.p_producto_Id,
      nombre: producto.nombre_producto,
      precioCompra: producto.valor_compra,
      precioVenta: producto.valor_unitario,
      id_estado_producto: producto.id_estado_producto,
      publicado: producto.publicado || false,
      id_tipo_producto: producto.id_tipo_producto,
      id_proveedor: producto.id_proveedor,
      nombre_estado:
        producto.CAT_ESTADO_PRODUCTO?.nombre_estado || "Sin estado",
      stock: producto.MOVIMIENTO_INVENTARIO[0]?.cantidad_disponible || 0,
      codigo: producto.codigo ?? "",
      proveedor: producto.CAT_PROVEEDOR?.nombre_proveedor || "Sin proveedor",
      categoria: producto.CAT_TIPO_PRODUCTO?.nombre || "Sin tipo",
      descripcion: producto.descripcion,
    };

    return res.status(200).json({ producto: formtateaPRoducosAcutalizados });
  } catch (error) {
    console.error("Error al actualizar producto", error);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function borrarProducto(req, res) {
  try {
    const { p_producto_Id } = req.params;

    const usuario = req.user;
    const id_usuario_modificacion = usuario.userId;

    const productoBorrado = await prisma.pRODUCTO.update({
      where: { p_producto_Id: Number(p_producto_Id) },
      data: {
        id_estado_registro: "0",
        id_usuario_modificacion,
        fecha_modificacion: new Date(),
      },
    });

    return res
      .status(200)
      .json({ mensaje: "Producto eliminado", producto: productoBorrado });
  } catch (error) {
    console.error("Error al borrar producto", error);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

module.exports = {
  obtenerEstadosProducto,
  crearProducto,
  actualizarProducto,
  borrarProducto,
  obtenerProductos,
};
