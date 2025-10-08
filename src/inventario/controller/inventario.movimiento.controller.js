const { PrismaClient } = require("@prisma/client");
const {
  obtenerPorcentajeIvaMetodo,
} = require("../../opcionesGenerales/general.controller");
const prisma = new PrismaClient();

async function obtenerTiposPago(req, res) {
  try {
    const tiposPago = await prisma.cAT_TIPO_PAGO.findMany({
      select: {
        id_tipo_pago: true,
        descripcion_pago: true,
      },
    });
    return res.status(200).json({ tiposPago });
  } catch (error) {
    console.error("Error al obtener tipos de pago:", error);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function obtenerEstadosFactura(req, res) {
  try {
    const filtro = req.query.filtro || "";
    let estadosFiltro = [];
    if (filtro === "FacturaCliente") {
      estadosFiltro = ["pagado", "pendiente"];
    }
    if (filtro === "FacturaProveedor") {
      estadosFiltro = ["pagado", "pendiente", "borrador"];
    }
    const estados = await prisma.cAT_ESTADO_FACTURA.findMany({
      where: {
        estado: {
          in: estadosFiltro.length > 0 ? estadosFiltro : undefined,
          mode: "insensitive",
        },
      },
      select: {
        id_estado_factura: true,
        estado: true,
      },
    });
    return res.status(200).json({ estadosFactura: estados });
  } catch (error) {
    console.error("Error al obtener estados de factura:", error);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function obtenerProductosPorProveedor(req, res) {
  try {
    const { proveedor } = req.query;
    if (proveedor === null || proveedor === undefined)
      return res.status(400).json({ mensaje: "error debe indicar proveedor" });
    const productos = await prisma.pRODUCTO.findMany({
      where: {
        id_estado_registro: "1",
        id_proveedor: Number(proveedor),
        CAT_ESTADO_PRODUCTO: {
          is: { id_estado_registro: "1", nombre_estado: "ACTIVO" },
        },
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

    const formtateadoProductos = productos.map((a) => ({
      p_producto_Id: a.p_producto_Id,
      nombre: a.nombre_producto,
      precioCompra: a.valor_compra,
      precioVenta: a.valor_unitario,
      id_estado_producto: a.id_estado_producto,
      id_tipo_producto: a.id_tipo_producto,
      id_proveedor: a.id_proveedor,
      nombre_estado: a.CAT_ESTADO_PRODUCTO.nombre_estado,
      stock: a.MOVIMIENTO_INVENTARIO?.cantidad_disponible || 0,
      codigo: a.codigo ?? "",
      proveedor: a.CAT_PROVEEDOR?.nombre_proveedor || "Sin proveedor",
      categoria: a.CAT_TIPO_PRODUCTO?.nombre || "Sin tipo",
      descripcion: a.descripcion,
    }));

    return res.status(200).json({ productos: formtateadoProductos });
  } catch (error) {
    console.error("Error productos", error);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function obtenerMovimientosInventario(req, res) {
  try {
    const facturas = await prisma.fACTURA.findMany({
      include: {
        DETALLE_FACTURA: {
          include: {
            PRODUCTO: {
              select: {
                codigo: true,
                nombre_producto: true,
              },
            },
          },
        },
      },
    });

    const resultado = await Promise.all(
      facturas.map(async (factura) => {
        const estadoFactura = await prisma.cAT_ESTADO_FACTURA.findFirst({
          where: { id_estado_factura: factura.id_estado_factura },
          select: { estado: true },
        });

        const tipoFactura = await prisma.cAT_TIPO_PAGO.findFirst({
          where: { id_tipo_pago: factura.id_tipo_pago },
          select: { descripcion_pago: true },
        });
        const proveedorN = await await prisma.cAT_PROVEEDOR.findFirst({
          where: { id_proveedor: factura.id_proveedor },
          select: {
            nombre_proveedor: true,
          },
        });

        return {
          id_factura: factura.id_factura,
          id_estado_factura: factura.id_estado_factura,
          estado_factura: estadoFactura.estado,
          tipo_pago: tipoFactura.descripcion_pago,
          proveedor: factura.id_proveedor,
          proveedorNombre: proveedorN.nombre_proveedor,
          numero: factura.numero_factura,
          serie: factura.serie_factura,
          fecha: factura.fecha_emision,
          fechaVencimiento: factura.fecha_vencimiento,
          id_tipo_pago: factura.id_tipo_pago,
          detalle:
            factura.DETALLE_FACTURA?.map((det) => ({
              id_detalle_factura: det.id_detalle_factura,
              p_producto_Id: det.p_producto_id,
              codigo: det.PRODUCTO?.codigo ?? "",
              nombre: det.PRODUCTO?.nombre_producto ?? "",
              cantidad: det.cantidad,
              precio: det.precio_unitario,
              descuento: det.descuento,
              total: det.total,
            })) || [],
        };
      })
    );

    return res.json({
      ok: true,
      data: resultado,
    });
  } catch (error) {
    console.error("Error en obtenerMovimientosInventario:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al obtener las facturas con sus movimientos",
      error: error.message,
    });
  }
}

async function borrarFacturayDetalle(req, res) {
  try {
    const usuario = req.user;
    const id_usuario_modificacion = usuario.userId;
    const { id_factura } = req.params;

    if (!id_factura || isNaN(Number(id_factura))) {
      return res.status(400).json({ mensaje: "ID de factura inválido" });
    }

    const usuarioBorra = await prisma.uSUARIO.findFirst({
      where: { usuario_id: id_usuario_modificacion },
    });

    await prisma.$transaction(async (tx) => {
      const factura = await tx.fACTURA.findFirst({
        where: { id_factura: Number(id_factura) },
        include: {
          DETALLE_FACTURA: true,
        },
      });
      if (!factura) {
        return res.status(404).json({ mensaje: "Factura no encontrada" });
      }

      const guardarBitacota = await tx.bITACORA_BORRADO_INTERNO.create({
        data: {
          usuario_modifica: usuarioBorra.correo_principal,
          entidad_modificada: "FACTURA Y DETALLE FACTURA",
          fecha_modificacion: new Date().toString(),
          id_entidad_modificada: factura.id_factura,
          valor_modificado_int_decimal: factura.id_factura,
          valor_modificado_varchar: JSON.stringify(factura),
          observacion: `Factura No. ${factura.numero_factura} Serie. ${
            factura.serie_factura
          } Borrada por el usuario ${
            usuarioBorra.p_nombre + " " + usuarioBorra.p_apellido
          } `,
        },
      });

      await tx.dETALLE_FACTURA.deleteMany({
        where: { id_factura: Number(id_factura) },
      });
      await tx.fACTURA.delete({
        where: { id_factura: Number(id_factura) },
      });
      return guardarBitacota;
    });
    return res.json({ mensaje: "Factura y detalles eliminados correctamente" });
  } catch (error) {
    console.error("Error en borrar factura", error);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function agregarMovimientoProducto(req, res) {
  try {
    let factura;
    const usuario = req.user;
    const id_usuario_creacion = usuario.userId;
    const {
      id_factura,
      id_estado_factura,
      proveedor,
      numero,
      serie,
      fecha,
      total,
      fechaVencimiento,
      id_tipo_pago,
      detalle,
    } = req.body;

    const esFacturaValida =
      id_factura !== undefined &&
      id_factura !== null &&
      id_factura !== "" &&
      !isNaN(Number(id_factura));
    let porcentajeIva = await obtenerPorcentajeIvaMetodo();
    console.log(porcentajeIva);
    porcentajeIva = Number(porcentajeIva.iva) || 0;

    const result = await prisma.$transaction(async (tx) => {
      const tipoMovimiento = await tx.cAT_TIPO_MOVIMIENTO.findFirst({
        where: { tipo_movimiento: "ENTRADA" },
        select: { id_tipo_movimiento: true },
      });

      const razonMovimiento = await tx.cAT_RAZON_MOVIMIENTO.findFirst({
        where: { razon_movimiento: "Compra" },
        select: { id_razon_movimiento: true },
      });

      if (!tipoMovimiento || !razonMovimiento) {
        throw new Error("Catálogo de movimiento o razón no encontrado");
      }
      const estadoFacturaBorrador = await tx.cAT_ESTADO_FACTURA.findFirst({
        where: {
          id_estado_factura: id_estado_factura,
        },
        select: {
          estado: true,
        },
      });
      if (esFacturaValida) {
        factura = await tx.fACTURA.update({
          where: { id_factura: Number(id_factura) },
          data: {
            id_proveedor: proveedor,
            numero_factura: numero,
            serie_factura: serie,
            fecha_emision: new Date(fecha),
            fecha_vencimiento: new Date(fechaVencimiento),
            id_usuario_creacion,
            fecha_modificacion: new Date(),
            id_tipo_pago,
            id_estado_factura,
            subtotal: total,
            impuestos: (porcentajeIva / 100) * total,
            total: (porcentajeIva / 100) * total + total,
          },
        });

        await tx.dETALLE_FACTURA.deleteMany({
          where: { id_factura: Number(id_factura) },
        });
      } else {
        factura = await tx.fACTURA.create({
          data: {
            id_proveedor: proveedor,
            numero_factura: numero,
            serie_factura: serie,
            fecha_emision: new Date(fecha),
            fecha_vencimiento: new Date(fechaVencimiento),
            id_usuario_creacion,
            fecha_modificacion: new Date(),
            id_tipo_pago,
            id_estado_factura,
            subtotal: total,
            impuestos: (porcentajeIva / 100) * total,
            total: (porcentajeIva / 100) * total + total,
          },
        });
      }

      await tx.dETALLE_FACTURA.createMany({
        data: detalle.map((item) => ({
          id_factura: factura.id_factura,
          p_producto_id: item.p_producto_Id,
          id_usuario_creacion,
          fecha_creacion: new Date(),
          cantidad: item.cantidad,
          precio_unitario: item.precio,
          descuento: item.descuento ?? 0,
          subtotal: item.cantidad * item.precio,
          impuestos: (porcentajeIva / 100) * item.total,
          total: (porcentajeIva / 100) * item.total + item.total,
          es_lote: item.es_lote ?? false,
          precio_lote: item.precio_lote ?? 0,
        })),
      });

      if (estadoFacturaBorrador.estado.toLowerCase() === "borrador")
        return factura;

      for (const item of detalle) {
        const ultimoMovimiento = await tx.mOVIMIENTO_INVENTARIO.findFirst({
          where: { p_producto_id: item.p_producto_Id },
          orderBy: { movimiento_inventario_Id: "desc" },
        });

        const productoCambio = await tx.pRODUCTO.findFirst({
          where: {
            p_producto_Id: item.p_producto_Id,
          },
        });

        if (Number(productoCambio.valor_compra) !== Number(item.precio)) {
          await tx.pRODUCTO.update({
            where: {
              p_producto_Id: item.p_producto_Id,
            },
            data: {
              valor_compra: Number(item.precio),
            },
          });
        }

        const stockAnterior = ultimoMovimiento?.cantidad_disponible ?? 0;
        const nuevoStock = stockAnterior + item.cantidad;

        await tx.mOVIMIENTO_INVENTARIO.create({
          data: {
            p_producto_id: item.p_producto_Id,
            id_estado_registro: "1",
            cantidad_disponible: Number(nuevoStock),
            fecha_creacion: new Date(),
            id_usuario_creacion,
            valor_total_unitario: Number(item.precio),
            cantidad_sale: 0,
            cantidad_entra: Number(item.cantidad),
            id_tipo_movimiento: tipoMovimiento.id_tipo_movimiento,
            id_razon_movimiento: razonMovimiento.id_razon_movimiento,
            observacion: `Entrada por factura ${numero}-${serie}`,
          },
        });
      }

      return factura;
    });

    return res.json({
      ok: true,
      mensaje: "Factura, detalles y movimientos registrados correctamente",
    });
  } catch (error) {
    console.error("Error en agregarMovimientoProducto:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al registrar la factura",
      error: error.message,
    });
  }
}

module.exports = {
  borrarFacturayDetalle,
  obtenerMovimientosInventario,
  agregarMovimientoProducto,
  obtenerTiposPago,
  obtenerEstadosFactura,
  obtenerProductosPorProveedor,
};
