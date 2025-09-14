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

    await prisma.oFERTA.update({
      where: { id_oferta: parseInt(id_oferta) },
      data: { id_estado_registro: "0" },
    });

    return res.status(200).json({ mensaje: "Oferta Desactivada" });
  } catch (error) {
    console.error("Error al eliminar oferta", error);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

module.exports = {
  obtenerTiposOferta,
  crearTipoOferta,
  actualizarTipoOferta,
  eliminarTipoOferta,
  obtenerOfertas,
  crearOferta,
  actualizarOferta,
  eliminarOferta,
};
