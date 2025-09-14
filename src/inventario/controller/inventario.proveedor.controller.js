const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function obtenerProveedores(req, res) {
  try {
    const proveedores = await prisma.cAT_PROVEEDOR.findMany({
      where: {
        id_estado_registro: "1",
      },
      select: {
        id_proveedor: true,
        nombre_proveedor: true,
        fecha_creacion: true,
        direccion: true,
        telefono: true,
        telefono_secundario: true,
        correo_electronico: true,
        sitio_web: true,
        puesto_de_contacto: true,
        nombre_contacto: true,
        notas: true,
      },
    });
    const proveedoresFormateados = proveedores.map((p) => ({
      id: p.id_proveedor,
      nombre_proveedor: p.nombre_proveedor || "",
      direccion: p.direccion || "",
      telefono: p.telefono || "",
      telefono_secundario: p.telefono_secundario || "",
      email: p.correo_electronico || "",
      sitio_web: p.sitio_web || "",
      contacto_principal: p.nombre_contacto || "",
      puesto_contacto: p.puesto_de_contacto || "",
      notas: p.notas || "",
    }));

    return res.status(200).json({ proveedores: proveedoresFormateados });
  } catch (error) {
    console.error('Error al obtener los proveedores', error);
    return res.status(500).json({ error: "Error Servidor Proveedores" });
  }
}
async function AgregarProveedor(req, res) {
  try {
    const {
      nombre_proveedor,
      direccion,
      telefono,
      telefono_secundario,
      email,
      sitio_web,
      contacto_principal,
      puesto_contacto,
      notas,
    } = req.body;

    if (!nombre_proveedor) {
      return res
        .status(400)
        .json({ error: "Nombre del proveedor es obligatorio" });
    }
    const usuario = req.user;
    const id_usuario_creacion = usuario.userId;

    const nuevoProveedor = await prisma.cAT_PROVEEDOR.create({
      data: {
        nombre_proveedor,
        fecha_creacion: new Date(),
        fecha_modificacion: new Date(),
        id_usuario_creacion,
        id_usuario_modificacion: id_usuario_creacion,
        id_estado_registro: "1",
        direccion: direccion || "",
        telefono: telefono || "",
        telefono_secundario: telefono_secundario || "",
        correo_electronico: email || "",
        sitio_web: sitio_web || "",
        puesto_de_contacto: puesto_contacto || "",
        nombre_contacto: contacto_principal || "",
        notas: notas || "",
      },
    });

    const proveedorFormateado = {
      id_proveedor: nuevoProveedor.id_proveedor,
      nombre_proveedor: nuevoProveedor.nombre_proveedor,
      direccion: nuevoProveedor.direccion,
      telefono: nuevoProveedor.telefono,
      telefono_secundario: nuevoProveedor.telefono_secundario,
      email: nuevoProveedor.correo_electronico,
      sitio_web: nuevoProveedor.sitio_web,
      contacto_principal: nuevoProveedor.nombre_contacto,
      puesto_contacto: nuevoProveedor.puesto_de_contacto,
      notas: nuevoProveedor.notas,
    };

    return res.status(201).json({ proveedor: proveedorFormateado });
  } catch (error) {
    console.error('Error al agregar proveedor',error);
    return res.status(500).json({ error: "Error al agregar proveedor" });
  }
}
async function eliminarProveedor(req, res) {
  try {
    const { id_proveedor } = req.params;
    const usuario = req.user;
    const id_usuario_modificacion = usuario.userId;
    if (!id_proveedor || !id_usuario_modificacion) {
      return res.status(400).json({
        error: "ID del proveedor y usuario de modificación son obligatorios",
      });
    }

    const proveedor = await prisma.cAT_PROVEEDOR.findFirst({
      where: { id_proveedor: Number(id_proveedor) },
    });

    if (!proveedor) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }

    const proveedorActualizado = await prisma.cAT_PROVEEDOR.update({
      where: { id_proveedor: Number(id_proveedor) },
      data: {
        id_estado_registro: "0",
        fecha_modificacion: new Date(),
        id_usuario_modificacion: id_usuario_modificacion,
      },
    });

    return res
      .status(200)
      .json({ mensaje: "Proveedor eliminado correctamente" });
  } catch (error) {
    console.error('Error al eliminar proveedor', error);
    return res.status(500).json({ error: "Error al eliminar proveedor" });
  }
}
async function ActualizarProveedor(req, res) {
  try {
    const {
      id_proveedor,
      nombre_proveedor,
      direccion,
      telefono,
      telefono_secundario,
      email,
      sitio_web,
      contacto_principal,
      puesto_contacto,
      notas,
    } = req.body;

    if (!id_proveedor) {
      return res
        .status(400)
        .json({ error: "El ID del proveedor es obligatorio" });
    }

    const usuario = req.user;
    const id_usuario_modificacion = usuario.userId;

    const proveedorExistente = await prisma.cAT_PROVEEDOR.findFirst({
      where: { id_proveedor: Number(id_proveedor) },
    });

    if (!proveedorExistente) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }

    const proveedorActualizado = await prisma.cAT_PROVEEDOR.update({
      where: { id_proveedor: Number(id_proveedor) },
      data: {
        nombre_proveedor:
          nombre_proveedor ?? proveedorExistente.nombre_proveedor,
        direccion: direccion ?? proveedorExistente.direccion,
        telefono: telefono ?? proveedorExistente.telefono,
        telefono_secundario:
          telefono_secundario ?? proveedorExistente.telefono_secundario,
        correo_electronico: email ?? proveedorExistente.correo_electronico,
        sitio_web: sitio_web ?? proveedorExistente.sitio_web,
        nombre_contacto:
          contacto_principal ?? proveedorExistente.nombre_contacto,
        puesto_de_contacto:
          puesto_contacto ?? proveedorExistente.puesto_de_contacto,
        notas: notas ?? proveedorExistente.notas,
        fecha_modificacion: new Date(),
        id_usuario_modificacion,
      },
    });

    const proveedorFormateado = {
      id_proveedor: proveedorActualizado.id_proveedor,
      nombre_proveedor: proveedorActualizado.nombre_proveedor,
      direccion: proveedorActualizado.direccion,
      telefono: proveedorActualizado.telefono,
      telefono_secundario: proveedorActualizado.telefono_secundario,
      email: proveedorActualizado.correo_electronico,
      sitio_web: proveedorActualizado.sitio_web,
      contacto_principal: proveedorActualizado.nombre_contacto,
      puesto_contacto: proveedorActualizado.puesto_de_contacto,
      notas: proveedorActualizado.notas,
    };

    return res.status(200).json({ proveedor: proveedorFormateado });
  } catch (error) {
    console.error('Erro al actualizar proveedor',error);
    return res.status(500).json({ error: "Error al actualizar proveedor" });
  }
}

module.exports = {
  obtenerProveedores,
  AgregarProveedor,
  eliminarProveedor,
  ActualizarProveedor,
};
