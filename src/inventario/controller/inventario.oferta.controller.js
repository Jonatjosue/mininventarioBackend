const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function obtenerTiposOferta(req, res) {
  try {
    const tiposOferta = await prisma.cAT_TIPO_OFERTA.findMany({
      where: { id_estado_registro: "1" },
      include: {
        OFERTA: true,
      },
    });

    const tiposFormateados = tiposOferta.map((a) => ({
      id_tipo_oferta: a.id_tipo_oferta,
      nombre_tipo_oferta: a.nombre_tipo_oferta,
      descripcion: a.descripcion,
      ofertas_count: a.OFERTA.length,
    }));

    return res.status(200).json({ tiposOferta: tiposFormateados });
  } catch (error) {
    console.error("Error al obtener tipos de oferta", error);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function crearTipoOferta(req, res) {
  try {
    const { nombre_tipo_oferta, descripcion } = req.body;
    const usuario = req.user;
    const id_usuario_creacion = usuario.userId;

    const nuevoTipo = await prisma.cAT_TIPO_OFERTA.create({
      data: {
        nombre_tipo_oferta,
        descripcion,
        id_estado_registro: "1",
        id_usuario_creacion,
      },
    });

    return res.status(201).json({ tipoOferta: nuevoTipo });
  } catch (error) {
    console.error("Error al crear tipo de oferta", error);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function actualizarTipoOferta(req, res) {
  try {
    const { id_tipo_oferta, nombre_tipo_oferta, descripcion } =
      req.body.tipoOfertaActualizacion;
    const tipoActualizado = await prisma.cAT_TIPO_OFERTA.update({
      where: { id_tipo_oferta: Number(id_tipo_oferta) },
      data: {
        nombre_tipo_oferta,
        descripcion,
      },
    });

    return res.status(200).json({ tipoOferta: tipoActualizado });
  } catch (error) {
    console.error("Error al actualizar tipo de oferta", error);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function eliminarTipoOferta(req, res) {
  try {
    const { id_tipo_oferta } = req.params;

    await prisma.cAT_TIPO_OFERTA.update({
      where: { id_tipo_oferta: parseInt(id_tipo_oferta) },
      data: { id_estado_registro: "0" },
    });

    return res.status(200).json({ mensaje: "Tipo de oferta eliminado" });
  } catch (error) {
    console.error("Error al eliminar tipo de oferta", error);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function obtenerOfertas(req, res) {
  try {
    const ofertas = await prisma.oFERTA.findMany({
      select: {
        id_oferta: true,
        oferta: true,
        observacion: true,
        valor_oferta_numerico: true,
        valor_oferta_porcentaje: true,
        id_estado_registro: true,
        CAT_TIPO_OFERTA: true,
        PRODUCTO_OFERTA: true,
      },
    });
    const ofertasFormateadas = ofertas.map((a) => ({
      id_oferta: a.id_oferta,
      activa: a.id_estado_registro == 1 ? true : false,
      tipo_oferta: a.CAT_TIPO_OFERTA.nombre_tipo_oferta,
      id_tipo_oferta: a.CAT_TIPO_OFERTA.id_tipo_oferta,
      nombre: a.oferta,
      descripcion_tipo: a.CAT_TIPO_OFERTA.descripcion,
      observacion: a.observacion,
      valor_oferta_numerico: a.valor_oferta_numerico,
      valor_oferta_porcentaje: a.valor_oferta_porcentaje,
      producto_cantidad: a.PRODUCTO_OFERTA.length,
    }));

    return res.status(200).json({ ofertas: ofertasFormateadas });
  } catch (error) {
    console.error("Error al obtener ofertas", error);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function crearOferta(req, res) {
  try {
    const {
      valor_numerico,
      valor_porcentaje,
      observacion,
      id_tipo_oferta,
      oferta,
    } = req.body;
    const usuario = req.user;
    const id_usuario_creacion = usuario.userId;

    const nuevaOferta = await prisma.oFERTA.create({
      data: {
        valor_oferta_numerico: valor_numerico,
        valor_oferta_porcentaje: valor_porcentaje,
        observacion,
        oferta: oferta,
        id_tipo_oferta,
        fecha_creacion: new Date(),
        id_estado_registro: "1",
        id_usuario_creacion,
      },
    });

    return res.status(201).json({ oferta: nuevaOferta });
  } catch (error) {
    console.error("Error al crear oferta", error);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function actualizarOferta(req, res) {
  try {
    const {
      id_oferta,
      valor_numerico,
      valor_porcentaje,
      observacion,
      id_tipo_oferta,
      oferta,
    } = req.body;

    const ofertaActualizada = await prisma.oFERTA.update({
      where: { id_oferta: parseInt(id_oferta) },
      data: {
        valor_oferta_numerico: valor_numerico,
        valor_oferta_porcentaje: valor_porcentaje,
        observacion,
        id_tipo_oferta,
        oferta: oferta,
      },
    });

    return res.status(200).json({ oferta: ofertaActualizada });
  } catch (error) {
    console.error("Error al actualizar oferta", error);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function eliminarOferta(req, res) {
  try {
    const { id_oferta } = req.params;

    const oferta = await prisma.oFERTA.findUnique({
      where: { id_oferta: parseInt(id_oferta) },
      select: { id_estado_registro: true },
    });

    if (!oferta) {
      return res.status(404).json({ mensaje: "Oferta no encontrada" });
    }

    await prisma.oFERTA.update({
      where: { id_oferta: parseInt(id_oferta) },
      data: {
        id_estado_registro: oferta.id_estado_registro === false ? "0" : "1",
      },
    });

    return res
      .status(200)
      .json({ mensaje: "Oferta desactivada/activada correctamente" });
  } catch (error) {
    console.error("Error al eliminar oferta", error);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function ofertasProducto(req, res) {
  try {
    const hoy = new Date();

    const productos = await prisma.pRODUCTO.findMany({
      where: {
        id_estado_registro: "1",
        CAT_ESTADO_PRODUCTO: {
          is: {
            nombre_estado: {
              in: ["ACTIVO", "REEABASTECER"],
            },
          },
        },
      },
      include: {
        PRODUCTO_OFERTA: {
          where: {
            id_estado_registro: "1",
            fecha_vigencia: {
              gte: hoy,
            },
          },
          include: {
            OFERTA: true,
          },
        },
      },
    });

    const productosNuevos = productos.map((producto) => {
      const ofertas = producto.PRODUCTO_OFERTA.filter(
        (po) => po.fecha_vigencia && po.fecha_vigencia >= hoy
      ).map((po) => {
        const oferta = po.OFERTA;

        let precioOferta = null;
        let porcentaje = null;

        if (!po?.aplica_por_porcentaje) {
          porcentaje = Number(oferta.valor_oferta_numerico);
          precioOferta =
            Number(producto.valor_unitario) -
            Number(oferta.valor_oferta_numerico);
        } else if (po?.aplica_por_porcentaje) {
          porcentaje = Number(oferta.valor_oferta_porcentaje);
          precioOferta =
            Number(producto.valor_unitario) -
            (porcentaje / 100) * producto.valor_unitario;
        }

        return {
          id_producto_oferta: po.id_producto_oferta,
          id: oferta.id_oferta,
          oferta: oferta.oferta ?? null,
          aplica_por_porcentaje: po.aplica_por_porcentaje,
          precio_oferta: precioOferta,
          porcentaje_descuento: porcentaje,
          fecha_inicio: oferta.fecha_creacion,
          fecha_fin: po.fecha_vigencia,
        };
      });

      const precioCalculado =
        ofertas.length > 0
          ? Math.min(...ofertas.map((o) => o.precio_oferta))
          : Number(producto.valor_unitario);

      return {
        id: producto.p_producto_Id,
        nombre: producto.nombre_producto,
        codigo: producto.codigo,
        precio_original: Number(producto.valor_unitario),
        precio_calculado: precioCalculado,
        mostrarOfertas: false,
        ofertas,
      };
    });

    return res.status(200).json(productosNuevos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener ofertas" });
  }
}

async function agregarOfertaProducto(req, res) {
  const { id_producto, id_oferta, fecha_vigencia, aplica_por_porcentaje } =
    req.body;
  const usuario = req.user;
  const id_usuario_modificacion = usuario.userId;

  try {
    if (!id_producto || !id_oferta || !fecha_vigencia) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const producto = await prisma.pRODUCTO.findUnique({
      where: { p_producto_Id: parseInt(id_producto) },
    });
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const oferta = await prisma.oFERTA.findUnique({
      where: { id_oferta: parseInt(id_oferta) },
    });
    if (!oferta) {
      return res.status(404).json({ error: "Oferta no encontrada" });
    }

    /**se realizar el calculo segun el valor que aplique */
    let valorCalculado = 0;
    const ofertaParaCalculo = await prisma.oFERTA.findUnique({
      where: { id_oferta: parseInt(id_oferta) },
    });

    if (!aplica_por_porcentaje) {
      valorCalculado =
        Number(producto.valor_unitario) -
        Number(ofertaParaCalculo.valor_oferta_numerico);
    } else if (aplica_por_porcentaje) {
      valorCalculado =
        Number(producto.valor_unitario) -
        (ofertaParaCalculo.valor_oferta_porcentaje / 100) *
          producto.valor_unitario;
    }

    // Crear la relación producto-oferta
    const productoOferta = await prisma.pRODUCTO_OFERTA.create({
      data: {
        p_producto_id: parseInt(id_producto),
        id_oferta: parseInt(id_oferta),
        fecha_vigencia: new Date(fecha_vigencia),
        id_estado_registro: "1",
        id_usuario_creacion: id_usuario_modificacion,
        id_usuario_modificacion: id_usuario_modificacion,
        aplica_por_porcentaje: aplica_por_porcentaje,
        fecha_creacion: new Date(),
        fecha_modificacion: new Date(),
        valor_calculado: valorCalculado,
      },
    });

    const hoy = new Date();

    const productoConOfertas = await prisma.pRODUCTO.findFirst({
      where: {
        p_producto_Id: parseInt(id_producto),
        id_estado_registro: "1",
        CAT_ESTADO_PRODUCTO: {
          is: {
            nombre_estado: {
              in: ["ACTIVO", "REEABASTECER"],
            },
          },
        },
      },
      include: {
        PRODUCTO_OFERTA: {
          where: {
            id_estado_registro: "1",
            fecha_vigencia: {
              gte: hoy,
            },
          },
          include: {
            OFERTA: true,
          },
        },
      },
    });

    if (!productoConOfertas) {
      return res
        .status(404)
        .json({ error: "Producto no encontrado o inactivo" });
    }

    const ofertas = productoConOfertas.PRODUCTO_OFERTA.map((po) => {
      const oferta = po.OFERTA;

      let precioOferta = null;
      let porcentaje = null;

      if (!po?.aplica_por_porcentaje) {
        porcentaje = Number(oferta.valor_oferta_numerico);
        precioOferta =
          Number(producto.valor_unitario) -
          Number(oferta.valor_oferta_numerico);
      } else if (po?.aplica_por_porcentaje) {
        porcentaje = Number(oferta.valor_oferta_porcentaje);
        precioOferta =
          Number(producto.valor_unitario) -
          (porcentaje / 100) * producto.valor_unitario;
      }

      return {
        id_producto_oferta: po.id_producto_oferta,
        id: oferta.id_oferta,
        oferta: oferta.oferta ?? null,
        aplica_por_porcentaje: po.aplica_por_porcentaje,
        precio_oferta: precioOferta,
        porcentaje_descuento: porcentaje,
        fecha_inicio: oferta.fecha_creacion,
        fecha_fin: po.fecha_vigencia,
      };
    });

    const precioCalculado =
      ofertas.length > 0
        ? Math.min(...ofertas.map((o) => o.precio_oferta))
        : Number(productoConOfertas.valor_unitario);

    const productoRespuesta = {
      id: productoConOfertas.p_producto_Id,
      nombre: productoConOfertas.nombre_producto,
      codigo: productoConOfertas.codigo,
      precio_original: Number(productoConOfertas.valor_unitario),
      precio_calculado: precioCalculado,
      mostrarOfertas: false,
      ofertas,
    };

    return res.status(201).json({
      message: "Oferta asignada correctamente al producto",
      data: productoRespuesta,
    });
  } catch (error) {
    console.error("Error asignando oferta:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}
async function borrarProductoOferta(req, res) {
  const { id_producto_oferta } = req.params;
  const usuario = req.user;
  const id_usuario_modificacion = usuario.userId;
  try {
    const productoOferta = await prisma.pRODUCTO_OFERTA.update({
      where: {
        id_producto_oferta: Number(id_producto_oferta),
      },
      data: {
        id_estado_registro: "0",
        id_usuario_modificacion: id_usuario_modificacion,
        fecha_modificacion: new Date(),
      },
    });

    if (productoOferta !== null) {
      return res.status(200).json({ mensaje: "oferta eliminada" });
    }
    return res.status(300).json({ mensaje: "oferta no actualizada" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "error en el servidor" });
  }
}

module.exports = {
  borrarProductoOferta,
  agregarOfertaProducto,
  ofertasProducto,
  obtenerTiposOferta,
  crearTipoOferta,
  actualizarTipoOferta,
  eliminarTipoOferta,
  obtenerOfertas,
  crearOferta,
  actualizarOferta,
  eliminarOferta,
};
