const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function obtenerCategoriasProducto(req, res) {
  try {
    const categoriasDB = await prisma.cAT_TIPO_PRODUCTO.findMany({
      where: {
        id_estado_registro: "1",
      },
      select: {
        id_tipo_producto: true,
        nombre: true,
        observacion: true,
        PRODUCTO: {
          where: {
            id_estado_registro: "1",
          },
          select: {
            p_producto_Id: true,
          },
        },
      },
    });
    const categorias = categoriasDB.map((cat) => ({
      id_tipo_producto: cat.id_tipo_producto,
      nombre: cat.nombre,
      observacion: cat.observacion,
      catTieneProducto: cat.PRODUCTO.length > 0,
      cantidad: cat.PRODUCTO.length,
    }));

    return res.status(200).json({ categorias });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener categorías" });
  }
}

async function crearCategoriaProducto(req, res) {
  const { nombre, observacion } = req.body;
  if (nombre === null) {
    return res.status(400).json({ mensaje: "Nombre cateogoría requerido" });
  }
  const usuario = req.user;
  const id_usuario_creacion = usuario.userId;
  try {
    const categoria = await prisma.cAT_TIPO_PRODUCTO.create({
      data: {
        nombre: nombre,
        fecha_creacion: new Date(),
        fecha_modificacion: new Date(),
        id_estado_registro: "1",
        id_usuario_creacion: id_usuario_creacion,
        id_usuario_modificacion: id_usuario_creacion,
        observacion: observacion,
      },
    });

    return res.status(200).json({ mensaje: "categoria creada", categoria });
  } catch (error) {
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function actualizarCategoriaProducto(req, res) {
  const { id_tipo_producto, nombre, observacion } = req.body;

  if (!id_tipo_producto) {
    return res.status(400).json({ mensaje: "ID de categoría requerido" });
  }
  if (!nombre) {
    return res.status(400).json({ mensaje: "Nombre de categoría requerido" });
  }

  const usuario = req.user;
  const id_usuario_modificacion = usuario.userId;

  try {
    const categoria = await prisma.cAT_TIPO_PRODUCTO.update({
      where: { id_tipo_producto: id_tipo_producto },
      data: {
        nombre: nombre,
        observacion: observacion,
        fecha_modificacion: new Date(),
        id_usuario_modificacion: id_usuario_modificacion,
      },
    });

    return res
      .status(200)
      .json({ mensaje: "Categoría actualizada", categoria });
  } catch (error) {
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function eliminarCategoriaProducto(req, res) {
  const { id_tipo_producto } = req.params;

  if (!id_tipo_producto) {
    return res.status(400).json({ mensaje: "ID de categoría requerido" });
  }
  const usuario = req.user;
  const id_usuario_modificacion = usuario.userId;
  try {
    const categoria = await prisma.cAT_TIPO_PRODUCTO.update({
      where: { id_tipo_producto: Number(id_tipo_producto) },
      data: {
        id_estado_registro: "0",
        fecha_modificacion: new Date(),
        id_usuario_modificacion: id_usuario_modificacion,
      },
    });

    return res.status(200).json({ mensaje: "Categoría eliminada", categoria });
  } catch (error) {
    // Si Prisma no encuentra el registro, lanza error P2025
    if (error.code === "P2025") {
      return res.status(404).json({ mensaje: "Categoría no encontrada" });
    }
    console.error(error);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function obtenerProveedoresProducto(req, res) {
  try {
    const proveedores = await prisma.cAT_PROVEEDOR.findMany({
      where: {
        id_estado_registro: "1",
      },
      select: {
        id_proveedor: true,
        nombre_proveedor: true,
      },
    });
    return res
      .status(200)
      .json({ mensaje: "proveedores para productos", proveedores });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

module.exports = {
  crearCategoriaProducto,
  obtenerCategoriasProducto,
  actualizarCategoriaProducto,
  eliminarCategoriaProducto,
  obtenerProveedoresProducto,
};
