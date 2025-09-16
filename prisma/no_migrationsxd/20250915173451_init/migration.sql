-- CreateTable
CREATE TABLE "public"."ACTIVO" (
    "id_activo" INTEGER NOT NULL,
    "activo" VARCHAR NOT NULL,
    "fecha_creacion" DATE NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "id_estado_registro" BIT(1) NOT NULL,
    "id_usuario" INTEGER,
    "id_producto" INTEGER,
    "id_tipo_activo" INTEGER NOT NULL,
    "ultima_fecha_mantenimiento" DATE NOT NULL,
    "id_usuario_aplica_mantenimiento" INTEGER NOT NULL,
    "id_tipo_riesgo" INTEGER NOT NULL,

    CONSTRAINT "ACTIVO_pkey" PRIMARY KEY ("id_activo")
);

-- CreateTable
CREATE TABLE "public"."BITACORA_BORRADO_INTERNO" (
    "id_bitacora" INTEGER NOT NULL,
    "entidad_modificada" VARCHAR NOT NULL,
    "fecha_modificacion" VARCHAR NOT NULL,
    "id_entidad_modificada" INTEGER NOT NULL,
    "usuario_modifica" VARCHAR NOT NULL,
    "valor_modificado_varchar" VARCHAR,
    "observacion" VARCHAR,
    "valor_modificado_int_decimal" DECIMAL,

    CONSTRAINT "BITACORA_BORRADO_INTERNO_pkey" PRIMARY KEY ("id_bitacora")
);

-- CreateTable
CREATE TABLE "public"."BITACORA_MODIFICACION_INTERNA" (
    "id_bitacora" INTEGER NOT NULL,
    "entidad_modificada" VARCHAR NOT NULL,
    "fecha_modificacion" VARCHAR NOT NULL,
    "id_entidad_modificada" INTEGER NOT NULL,
    "usuario_modifica" VARCHAR NOT NULL,
    "valor_modificado_varchar" VARCHAR,
    "observacion" VARCHAR,
    "valor_modificado_int_decimal" DECIMAL,

    CONSTRAINT "BITACORA_MODIFICACION_INTERNA_pkey" PRIMARY KEY ("id_bitacora")
);

-- CreateTable
CREATE TABLE "public"."CAT_ACCION_CORRECTIVA" (
    "id_accion_correctiva" INTEGER NOT NULL,
    "accion" VARCHAR NOT NULL,
    "id_estado_registro" BIT(1) NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "fecha_creacion" DATE NOT NULL,

    CONSTRAINT "CAT_ACCION_CORRECTIVA_pkey" PRIMARY KEY ("id_accion_correctiva")
);

-- CreateTable
CREATE TABLE "public"."CAT_DEPARTAMENTO" (
    "id_departamento" SERIAL NOT NULL,
    "nombre_departamento" VARCHAR NOT NULL,
    "fecha_creacion" DATE NOT NULL,
    "fecha_modificacion" DATE NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "id_usuario_modificacion" INTEGER NOT NULL,
    "id_estado_registro" BIT(1) NOT NULL,
    "id_pais" INTEGER NOT NULL,

    CONSTRAINT "CAT_DEPARTAMENTO_pkey" PRIMARY KEY ("id_departamento")
);

-- CreateTable
CREATE TABLE "public"."CAT_ESTADO_PEDIDO" (
    "id_estado_pedido" INTEGER NOT NULL,
    "estado_pedido" VARCHAR NOT NULL,
    "fecha_creacion" DATE NOT NULL,
    "id_estado_registro" BIT(1) NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "id_estado_pedido_padre" INTEGER,

    CONSTRAINT "CAT_ESTADO_PEDIDO_pkey" PRIMARY KEY ("id_estado_pedido")
);

-- CreateTable
CREATE TABLE "public"."CAT_ESTADO_PRODUCTO" (
    "id_estado_producto" SERIAL NOT NULL,
    "nombre_estado" VARCHAR NOT NULL,
    "fecha_creacion" DATE NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "id_estado_registro" BIT(1) NOT NULL,

    CONSTRAINT "CAT_ESTADO_PRODUCTO_pkey" PRIMARY KEY ("id_estado_producto")
);

-- CreateTable
CREATE TABLE "public"."CAT_ESTADO_SUCURSAL" (
    "id_estado_sucursal" SERIAL NOT NULL,
    "estado" VARCHAR NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "fecha_creacion" DATE NOT NULL,
    "id_estado_registro" BIT(1) NOT NULL,

    CONSTRAINT "CAT_ESTADO_SUCURSAL_pkey" PRIMARY KEY ("id_estado_sucursal")
);

-- CreateTable
CREATE TABLE "public"."CAT_ESTADO_TELEFONO" (
    "id_estado_telefono" SERIAL NOT NULL,
    "nombre_estado" VARCHAR,
    "fecha_creacion" DATE,
    "id_estado_registro" BIT(1),
    "id_usuario_creacion" INTEGER,

    CONSTRAINT "CAT_ESTADO_TELEFONO_pkey" PRIMARY KEY ("id_estado_telefono")
);

-- CreateTable
CREATE TABLE "public"."CAT_ESTADO_USUARIO" (
    "id_estado_usuario" SERIAL NOT NULL,
    "estado" VARCHAR NOT NULL,
    "id_estado_registro" BIT(1) NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "fecha_creacion" DATE NOT NULL,

    CONSTRAINT "CAT_ESTADO_USUARIO_pkey" PRIMARY KEY ("id_estado_usuario")
);

-- CreateTable
CREATE TABLE "public"."CAT_MUNICIPIO" (
    "id_municipio" SERIAL NOT NULL,
    "nombre_municipio" VARCHAR NOT NULL,
    "fecha_creacion" DATE NOT NULL,
    "fecha_modificacion" DATE NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "id_usuario_modificacion" INTEGER NOT NULL,
    "id_estado_registro" BIT(1) NOT NULL,
    "id_departamento" INTEGER NOT NULL,

    CONSTRAINT "CAT_MUNICIPIO_pkey" PRIMARY KEY ("id_municipio")
);

-- CreateTable
CREATE TABLE "public"."CAT_PAIS" (
    "id_pais" SERIAL NOT NULL,
    "nombre_pais" VARCHAR NOT NULL,
    "fecha_creacion" DATE NOT NULL,
    "fecha_modificacion" DATE NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "id_usuario_modificacion" INTEGER NOT NULL,
    "id_estado_registro" BIT(1) NOT NULL,

    CONSTRAINT "CAT_PAIS_pkey" PRIMARY KEY ("id_pais")
);

-- CreateTable
CREATE TABLE "public"."CAT_PROVEEDOR" (
    "id_proveedor" SERIAL NOT NULL,
    "nombre_proveedor" VARCHAR NOT NULL,
    "fecha_creacion" DATE NOT NULL,
    "fecha_modificacion" DATE NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "id_usuario_modificacion" INTEGER NOT NULL,
    "id_estado_registro" BIT(1) NOT NULL,
    "direccion" VARCHAR(255),
    "telefono" VARCHAR(50),
    "telefono_secundario" VARCHAR(50),
    "correo_electronico" VARCHAR(155),
    "sitio_web" VARCHAR(255),
    "puesto_de_contacto" VARCHAR(155),
    "nombre_contacto" VARCHAR(155),
    "notas" VARCHAR(355),

    CONSTRAINT "CAT_PROVEEDOR_pkey" PRIMARY KEY ("id_proveedor")
);

-- CreateTable
CREATE TABLE "public"."CAT_RAZON_MOVIMIENTO" (
    "id_razon_movimiento" SERIAL NOT NULL,
    "razon_movimiento" VARCHAR NOT NULL,
    "fecha_creacion" DATE NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "id_estado_registro" BIT(1) NOT NULL,

    CONSTRAINT "CAT_RAZON_MOVIMIENTO_pkey" PRIMARY KEY ("id_razon_movimiento")
);

-- CreateTable
CREATE TABLE "public"."CAT_SEXO" (
    "sexo_id" SERIAL NOT NULL,
    "descripcion" VARCHAR NOT NULL,
    "fecha_creacion" DATE NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "id_estado_registro" BIT(1),

    CONSTRAINT "CAT_SEXO_pkey" PRIMARY KEY ("sexo_id")
);

-- CreateTable
CREATE TABLE "public"."CAT_TIPO_ACTIVO" (
    "id_tipo_activo" INTEGER NOT NULL,
    "tipo_activo" VARCHAR NOT NULL,
    "fecha_creacion" DATE NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "id_estado_registro" BIT(1) NOT NULL,

    CONSTRAINT "CAT_TIPO_ACTIVO_pkey" PRIMARY KEY ("id_tipo_activo")
);

-- CreateTable
CREATE TABLE "public"."CAT_TIPO_CONFIGURACION_GENERAL" (
    "id_tipo_configuracion_general" INTEGER NOT NULL,
    "tipo_configuracion" VARCHAR NOT NULL,
    "descripcion" VARCHAR,
    "id_estado_registro" BIT(1) NOT NULL,
    "fecha_creacion" DATE NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,

    CONSTRAINT "CAT_TIPO_CONFIGURACION_GENERAL_pkey" PRIMARY KEY ("id_tipo_configuracion_general")
);

-- CreateTable
CREATE TABLE "public"."CAT_TIPO_CONTACTO" (
    "id_tipo_parametro_general" INTEGER NOT NULL,
    "nombre_tipo_contacto" VARCHAR NOT NULL,
    "fecha_creacion" DATE NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "id_estado_registro" BIT(1) NOT NULL,
    "id_usuario_modificacion" INTEGER NOT NULL,
    "fecha_modificacion" DATE NOT NULL,

    CONSTRAINT "CAT_TIPO_CONTACTO_pkey" PRIMARY KEY ("id_tipo_parametro_general")
);

-- CreateTable
CREATE TABLE "public"."CAT_TIPO_DESCUENTO" (
    "id_tipo_descuento" INTEGER NOT NULL,
    "descuento" VARCHAR NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "fecha_creacion" DATE NOT NULL,

    CONSTRAINT "CAT_TIPO_DESCUENTO_pkey" PRIMARY KEY ("id_tipo_descuento")
);

-- CreateTable
CREATE TABLE "public"."CAT_TIPO_DOCUMENTO" (
    "id_tipo_documento" INTEGER NOT NULL,
    "descripcion" VARCHAR NOT NULL,
    "valor" VARCHAR NOT NULL,
    "id_estado_registro" BIT(1) NOT NULL,
    "fecha_creacion" DATE NOT NULL,
    "fecha_modificacion" DATE NOT NULL,
    "id_usuario_modifica" INTEGER NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,

    CONSTRAINT "CAT_TIPO_DOCUMENTO_pkey" PRIMARY KEY ("id_tipo_documento")
);

-- CreateTable
CREATE TABLE "public"."CAT_TIPO_INCIDENTE" (
    "id_tipo_incidente" INTEGER NOT NULL,
    "tipo_incidente" VARCHAR NOT NULL,
    "descripcion" VARCHAR,
    "fecha_creacion" DATE NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "id_estado_registro" BIT(1) NOT NULL,

    CONSTRAINT "CAT_TIPO_INCIDENTE_pkey" PRIMARY KEY ("id_tipo_incidente")
);

-- CreateTable
CREATE TABLE "public"."CAT_TIPO_MOVIMIENTO" (
    "id_tipo_movimiento" SERIAL NOT NULL,
    "tipo_movimiento" VARCHAR NOT NULL,
    "fecha_creacion" DATE NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "id_estado_registro" BIT(1) NOT NULL,

    CONSTRAINT "CAT_TIPO_MOVIMIENTO_pkey" PRIMARY KEY ("id_tipo_movimiento")
);

-- CreateTable
CREATE TABLE "public"."CAT_TIPO_OFERTA" (
    "id_tipo_oferta" SERIAL NOT NULL,
    "nombre_tipo_oferta" VARCHAR NOT NULL,
    "descripcion" VARCHAR,
    "id_estado_registro" BIT(1) NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,

    CONSTRAINT "CAT_TIPO_OFERTA_pkey" PRIMARY KEY ("id_tipo_oferta")
);

-- CreateTable
CREATE TABLE "public"."CAT_TIPO_POLITICA" (
    "id_tipo_politica" INTEGER NOT NULL,
    "tipo_politica" VARCHAR NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "fecha_creacion" DATE NOT NULL,
    "id_estado_registro" BIT(1) NOT NULL,

    CONSTRAINT "CAT_TIPO_POLITICA_pkey" PRIMARY KEY ("id_tipo_politica")
);

-- CreateTable
CREATE TABLE "public"."CAT_TIPO_PRODUCTO" (
    "id_tipo_producto" SERIAL NOT NULL,
    "nombre" VARCHAR NOT NULL,
    "fecha_creacion" DATE NOT NULL,
    "fecha_modificacion" DATE NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "id_usuario_modificacion" INTEGER NOT NULL,
    "observacion" VARCHAR(255),
    "id_estado_registro" BIT(1),

    CONSTRAINT "CAT_TIPO_PRODUCTO_pkey" PRIMARY KEY ("id_tipo_producto")
);

-- CreateTable
CREATE TABLE "public"."CAT_TIPO_RIESGO_ACTIVO" (
    "id_tipo_riesgo_activo" INTEGER NOT NULL,
    "tipo_riesgo" VARCHAR NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "id_estado_registro" INTEGER NOT NULL,
    "fecha_creacion" DATE NOT NULL,
    "nivel_riesgo" INTEGER NOT NULL,

    CONSTRAINT "CAT_TIPO_RIESGO_ACTIVO_pkey" PRIMARY KEY ("id_tipo_riesgo_activo")
);

-- CreateTable
CREATE TABLE "public"."CLIENTE" (
    "id_cliente" SERIAL NOT NULL,
    "p_nombre" VARCHAR NOT NULL,
    "s_nombre" VARCHAR,
    "p_apellido" VARCHAR NOT NULL,
    "s_apellido" VARCHAR,
    "fecha_creacion" DATE NOT NULL,
    "fecha_modificacion" DATE NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "id_usuario_modificacion" INTEGER NOT NULL,
    "contrasenia" VARCHAR NOT NULL,
    "fecha_ultimo_acceso" DATE NOT NULL,
    "id_sexo" INTEGER,
    "uui_d_cliente" UUID,
    "correo" VARCHAR(255),
    "token_version" INTEGER,

    CONSTRAINT "CLIENTE_pkey" PRIMARY KEY ("id_cliente")
);

-- CreateTable
CREATE TABLE "public"."CLIENTE_CONTACTO" (
    "id_cliente_contacto" INTEGER NOT NULL,
    "valor_contacto" VARCHAR NOT NULL,
    "id_tipo_contacto" INTEGER NOT NULL,
    "id_estado_registro" BIT(1) NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "fecha_creacion" DATE NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "fecha_modificacion" DATE NOT NULL,
    "id_usuario_modificacion" INTEGER NOT NULL,

    CONSTRAINT "CLIENTE_CONTACTO_pkey" PRIMARY KEY ("id_cliente_contacto")
);

-- CreateTable
CREATE TABLE "public"."CLIENTE_DESCUENTO" (
    "id_descuento" INTEGER NOT NULL,
    "id_tipo_descuento" INTEGER,
    "valor" DECIMAL NOT NULL,
    "observacion" VARCHAR,
    "id_usuario_creacion" INTEGER NOT NULL,
    "fecha_creacion" DATE NOT NULL,

    CONSTRAINT "CLIENTE_DESCUENTO_pkey" PRIMARY KEY ("id_descuento")
);

-- CreateTable
CREATE TABLE "public"."CLIENTE_IDENTIFICACION" (
    "id_cliente_identificacion" VARCHAR NOT NULL,
    "id_tipo_documento" INTEGER NOT NULL,
    "id_estado_registro" BIT(1) NOT NULL,
    "fecha_creacion" DATE NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "id_usuario_modificacion" INTEGER NOT NULL,
    "fecha_modificacion" DATE NOT NULL,

    CONSTRAINT "CLIENTE_IDENTIFICACION_pkey" PRIMARY KEY ("id_cliente_identificacion")
);

-- CreateTable
CREATE TABLE "public"."CLIENTE_PEDIDO" (
    "id_cliente_pedido" INTEGER NOT NULL,
    "cantidad_productos" DECIMAL NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "UID_PEDIDO" UUID NOT NULL,
    "id_estado_registro" BIT(1) NOT NULL,
    "id_estado_pedido" INTEGER NOT NULL,
    "valor_total" DECIMAL NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "fecha_creacion" DATE NOT NULL,
    "observacion" VARCHAR NOT NULL,

    CONSTRAINT "CLIENTE_PEDIDO_pkey" PRIMARY KEY ("id_cliente_pedido")
);

-- CreateTable
CREATE TABLE "public"."CLIENTE_PEDIDO_DETALLE" (
    "id_pedido_detalle" INTEGER NOT NULL,
    "p_producto_id" INTEGER NOT NULL,
    "id_descuento" INTEGER,
    "cantidad" DECIMAL NOT NULL,
    "cantidad_total_unidad" DECIMAL NOT NULL,
    "observacion" VARCHAR,
    "id_cliente_pedido" INTEGER NOT NULL,
    "fecha_creacion" DATE NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "id_estado_registro" BIT(1) NOT NULL,

    CONSTRAINT "CLIENTE_PEDIDO_DETALLE_pkey" PRIMARY KEY ("id_pedido_detalle")
);

-- CreateTable
CREATE TABLE "public"."CONFIGURACION_GENERAL" (
    "id_configuracion_general" INTEGER NOT NULL,
    "parametro_int_1" INTEGER,
    "parametro_int_2" INTEGER,
    "parametro_var_1" VARCHAR,
    "parametro_var_2" VARCHAR,
    "parametro_des_1" DECIMAL,
    "parametro_des_2" DECIMAL,
    "id_estado_registro" BIT(1) NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "fecha_creacion" DATE NOT NULL,
    "id_usuario_modificacion" INTEGER NOT NULL,
    "fecha_modificacion" INTEGER NOT NULL,
    "id_tipo_configuracion_general" INTEGER NOT NULL,
    "id_empresa" INTEGER NOT NULL,

    CONSTRAINT "CONFIGURACION_GENERAL_pkey" PRIMARY KEY ("id_configuracion_general")
);

-- CreateTable
CREATE TABLE "public"."DIRECCION" (
    "id_direccion" SERIAL NOT NULL,
    "id_municipio" INTEGER NOT NULL,
    "direccion_completa" VARCHAR NOT NULL,
    "no_casa" VARCHAR NOT NULL,
    "no_calle" VARCHAR NOT NULL,
    "id_estado_registro" BIT(1) NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "id_usuario_modificacion" INTEGER NOT NULL,
    "fecha_creacion" DATE NOT NULL,
    "fecha_modificacion" DATE NOT NULL,

    CONSTRAINT "DIRECCION_pkey" PRIMARY KEY ("id_direccion")
);

-- CreateTable
CREATE TABLE "public"."EMPRESA" (
    "id_empresa" SERIAL NOT NULL,
    "empresa" VARCHAR NOT NULL,
    "id_direccion" INTEGER NOT NULL,
    "telefono" INTEGER NOT NULL,
    "tamanio_contrasenia" INTEGER NOT NULL,
    "letras_mayus_contrasenia" INTEGER NOT NULL,
    "letras_especiales_contrasenia" INTEGER NOT NULL,
    "numeros_contrasenia" INTEGER NOT NULL,
    "id_empresa_activa" BIT(1) NOT NULL,

    CONSTRAINT "EMPRESA_pkey" PRIMARY KEY ("id_empresa")
);

-- CreateTable
CREATE TABLE "public"."HISTORIAL_INCIDENTES" (
    "id_historial_incidentes" INTEGER NOT NULL,
    "observación" VARCHAR,
    "id_tipo_incidiente" INTEGER NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "fecha_creacion" DATE NOT NULL,
    "id_estado_registro" BIT(1) NOT NULL,
    "id_activo" INTEGER NOT NULL,
    "id_usuario_incidencia" INTEGER,
    "id_politica_afectada" INTEGER,
    "id_accion_correctiva" INTEGER NOT NULL,
    "accion_correctiva" VARCHAR NOT NULL,

    CONSTRAINT "HISTORIAL_INCIDENTES_pkey" PRIMARY KEY ("id_historial_incidentes")
);

-- CreateTable
CREATE TABLE "public"."LOG_INGRESO_CLIENTE" (
    "id_log_ingreso_cliente" SERIAL NOT NULL,
    "huella_digital" VARCHAR NOT NULL,
    "ip" VARCHAR NOT NULL,
    "fecha" DATE NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "recuperar_contrasena" BIT(1) NOT NULL,
    "captcha" VARCHAR NOT NULL,
    "exitoso" BOOLEAN,
    "codigorespuesta" INTEGER,

    CONSTRAINT "LOG_INGRESO_CLIENTE_pkey" PRIMARY KEY ("id_log_ingreso_cliente")
);

-- CreateTable
CREATE TABLE "public"."LOG_INGRESO_USUARIO" (
    "id_log_ingreso_usuario" SERIAL NOT NULL,
    "huella_digital" VARCHAR NOT NULL,
    "ip" INET NOT NULL,
    "fecha" TIMESTAMPTZ(6) NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "recuperar_contrasena" BIT(1) NOT NULL,
    "captcha" VARCHAR NOT NULL,
    "exitoso" BOOLEAN,
    "codigorespuesta" INTEGER,
    "user_agent" TEXT,
    "motivo_fallo" TEXT,
    "ciudad" TEXT,
    "pais" TEXT,
    "huella_hash" TEXT,
    "id_refresh_token" BIGINT,

    CONSTRAINT "LOG_INGRESO_USUARIO_pkey" PRIMARY KEY ("id_log_ingreso_usuario")
);

-- CreateTable
CREATE TABLE "public"."MANTENIMIENTO" (
    "id_mantenimiento" INTEGER NOT NULL,
    "id_activo" INTEGER NOT NULL,
    "id_estado_registro" BIT(1) NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "fecha_creacion" DATE NOT NULL,
    "observacion" VARCHAR NOT NULL,
    "id_accion_correctiva" INTEGER NOT NULL,

    CONSTRAINT "MANTENIMIENTO_pkey" PRIMARY KEY ("id_mantenimiento")
);

-- CreateTable
CREATE TABLE "public"."MENU" (
    "id_menu" SERIAL NOT NULL,
    "menu" VARCHAR NOT NULL,
    "descripcion" VARCHAR,
    "id_usuario_creacion" INTEGER NOT NULL,
    "fecha_creacion" DATE NOT NULL,
    "id_estado_registro" BIT(1) NOT NULL,
    "id_modulo" INTEGER NOT NULL,
    "menu_protegido" BIT(1),
    "menu_visible_usuario" BIT(1),

    CONSTRAINT "MENU_pkey" PRIMARY KEY ("id_menu")
);

-- CreateTable
CREATE TABLE "public"."MODULO" (
    "id_modulo" SERIAL NOT NULL,
    "modulo" VARCHAR NOT NULL,
    "descripcion" VARCHAR,
    "id_usuario_creacion" INTEGER NOT NULL,
    "fecha_creacion" DATE NOT NULL,
    "id_estado_registro" BIT(1) NOT NULL,

    CONSTRAINT "MODULO_pkey" PRIMARY KEY ("id_modulo")
);

-- CreateTable
CREATE TABLE "public"."MOVIMIENTO_INVENTARIO" (
    "movimiento_inventario_Id" SERIAL NOT NULL,
    "p_producto_id" INTEGER NOT NULL,
    "id_estado_registro" BIT(1) NOT NULL,
    "cantidad_disponible" INTEGER NOT NULL,
    "fecha_creacion" DATE NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "valor_total_unitario" DECIMAL NOT NULL,
    "cantidad_sale" INTEGER NOT NULL,
    "cantidad_entra" INTEGER NOT NULL,
    "id_tipo_movimiento" INTEGER NOT NULL,
    "id_razon_movimiento" INTEGER NOT NULL,
    "observacion" VARCHAR,

    CONSTRAINT "MOVIMIENTO_INVENTARIO_pkey" PRIMARY KEY ("movimiento_inventario_Id")
);

-- CreateTable
CREATE TABLE "public"."OFERTA" (
    "id_oferta" SERIAL NOT NULL,
    "valor_oferta_numerico" DECIMAL NOT NULL,
    "valor_oferta_porcentaje" DECIMAL,
    "fecha_creacion" DATE NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "id_estado_registro" BIT(1) NOT NULL,
    "id_tipo_oferta" INTEGER NOT NULL,
    "observacion" VARCHAR,
    "oferta" VARCHAR(250),

    CONSTRAINT "OFERTA_pkey" PRIMARY KEY ("id_oferta")
);

-- CreateTable
CREATE TABLE "public"."OPCION" (
    "id_opcion" SERIAL NOT NULL,
    "opcion" VARCHAR NOT NULL,
    "descripcion" VARCHAR,
    "id_usuario_creacion" INTEGER NOT NULL,
    "fecha_creacion" DATE NOT NULL,
    "id_estado_registro" BIT(1) NOT NULL,
    "id_menu" INTEGER NOT NULL,
    "endpoint" VARCHAR NOT NULL,

    CONSTRAINT "OPCION_pkey" PRIMARY KEY ("id_opcion")
);

-- CreateTable
CREATE TABLE "public"."POLITICA" (
    "id_politica" INTEGER NOT NULL,
    "politica" VARCHAR NOT NULL,
    "descripcion" VARCHAR NOT NULL,
    "id_tipo_politica" INTEGER NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "fecha_creacion" INTEGER NOT NULL,
    "id_estado_registro" BIT(1) NOT NULL,

    CONSTRAINT "POLITICA_pkey" PRIMARY KEY ("id_politica")
);

-- CreateTable
CREATE TABLE "public"."PRODUCTO" (
    "p_producto_Id" SERIAL NOT NULL,
    "nombre_producto" VARCHAR NOT NULL,
    "descripcion" VARCHAR,
    "fecha_creacion" DATE NOT NULL,
    "fecha_modificacion" DATE NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "id_usuario_modificacion" INTEGER NOT NULL,
    "id_estado_registro" BIT(1) NOT NULL,
    "id_estado_producto" INTEGER NOT NULL,
    "valor_unitario" DECIMAL NOT NULL,
    "valor_compra" DECIMAL NOT NULL,
    "id_proveedor" INTEGER NOT NULL,
    "id_tipo_producto" INTEGER,
    "codigo" VARCHAR(150),

    CONSTRAINT "PRODUCTO_pkey" PRIMARY KEY ("p_producto_Id")
);

-- CreateTable
CREATE TABLE "public"."ROLE" (
    "id_role" SERIAL NOT NULL,
    "role" VARCHAR NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "fecha_creacion" DATE NOT NULL,
    "id_estado_registro" BIT(1) NOT NULL,
    "descripcion" VARCHAR NOT NULL,

    CONSTRAINT "ROLE_pkey" PRIMARY KEY ("id_role")
);

-- CreateTable
CREATE TABLE "public"."ROLE_OPCION" (
    "id_role_opcion" SERIAL NOT NULL,
    "id_role" INTEGER NOT NULL,
    "id_opcion" INTEGER NOT NULL,
    "id_estado_registro" BIT(1) NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "fecha_creacion" DATE NOT NULL,
    "actualizar" BIT(1) NOT NULL,
    "insertar" BIT(1) NOT NULL,
    "eliminar" BIT(1) NOT NULL,
    "leer" BIT(1) NOT NULL,

    CONSTRAINT "ROLE_OPCION_pkey" PRIMARY KEY ("id_role_opcion")
);

-- CreateTable
CREATE TABLE "public"."ROLE_USUARIO" (
    "id_role_usuario" INTEGER NOT NULL,
    "id_role" INTEGER NOT NULL,
    "fecha_creacion" DATE NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "id_estado_registro" BIT(1) NOT NULL,
    "id_usuario" INTEGER,

    CONSTRAINT "ROLE_USUARIO_pkey" PRIMARY KEY ("id_role_usuario")
);

-- CreateTable
CREATE TABLE "public"."SUCURSAL" (
    "id_sucursal" SERIAL NOT NULL,
    "sucursal" VARCHAR NOT NULL,
    "id_direccion" INTEGER NOT NULL,
    "telefono" INTEGER NOT NULL,
    "id_usuario_encargado" INTEGER,
    "id_estado_sucursal" INTEGER NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "fecha_creacion" DATE NOT NULL,
    "id_empresa" INTEGER NOT NULL,

    CONSTRAINT "SUCURSAL_pkey" PRIMARY KEY ("id_sucursal")
);

-- CreateTable
CREATE TABLE "public"."TELEFONO_CLIENTE" (
    "telefono" INTEGER NOT NULL,
    "id_empresa" INTEGER,
    "fecha_creacion" DATE NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "id_estado_registro" BIT(1) NOT NULL,
    "id_estado_telefono" INTEGER NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "id_telefono_cliente" SERIAL NOT NULL,

    CONSTRAINT "pk_telefono_cliente" PRIMARY KEY ("id_telefono_cliente")
);

-- CreateTable
CREATE TABLE "public"."TELEFONO_USUARIO" (
    "telefono" INTEGER NOT NULL,
    "fecha_creacion" DATE NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "id_estado_registro" BIT(1) NOT NULL,
    "id_estado_telefono" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,

    CONSTRAINT "pk_telefono_usuario" PRIMARY KEY ("telefono")
);

-- CreateTable
CREATE TABLE "public"."USUARIO" (
    "usuario_id" SERIAL NOT NULL,
    "p_nombre" VARCHAR NOT NULL,
    "s_nombre" VARCHAR NOT NULL,
    "p_apellido" VARCHAR NOT NULL,
    "s_apellido" VARCHAR NOT NULL,
    "fecha_creacion" DATE NOT NULL,
    "fecha_modificacion" DATE NOT NULL,
    "usuario_creacion" VARCHAR NOT NULL,
    "usuario_modificacion" VARCHAR NOT NULL,
    "id_sexo" INTEGER NOT NULL,
    "id_estado_registro" BIT(1) NOT NULL,
    "id_direccion" INTEGER NOT NULL,
    "fecha_nacimiento" DATE NOT NULL,
    "contrasenia" VARCHAR NOT NULL,
    "intentos_ingreso" INTEGER NOT NULL,
    "id_estado_usuario" INTEGER NOT NULL,
    "id_sucursal" INTEGER NOT NULL,
    "fecha_ultimo_acceso" DATE NOT NULL,
    "uuid_usuario" UUID DEFAULT gen_random_uuid(),
    "correo_principal" CITEXT,
    "codigo_usuario" VARCHAR(155),
    "token_version" INTEGER NOT NULL DEFAULT 0,
    "bloqueado_hasta" TIMESTAMPTZ(6),

    CONSTRAINT "USUARIO_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateTable
CREATE TABLE "public"."USUARIO_CONTACTO" (
    "id_usuario_contacto" INTEGER NOT NULL,
    "valor_contacto" VARCHAR NOT NULL,
    "id_tipo_contacto" INTEGER NOT NULL,
    "id_estado_registro" BIT(1) NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "fecha_creacion" DATE NOT NULL,
    "id_usuario" INTEGER NOT NULL,

    CONSTRAINT "USUARIO_CONTACTO_pkey" PRIMARY KEY ("id_usuario_contacto")
);

-- CreateTable
CREATE TABLE "public"."USUARIO_IDENTIFICACION" (
    "id_usuario_identificacion" VARCHAR NOT NULL,
    "id_tipo_documento" INTEGER NOT NULL,
    "id_estado_registro" BIT(1) NOT NULL,
    "fecha_creacion" DATE NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_usuario_modificacion" INTEGER NOT NULL,
    "fecha_modificacion" DATE NOT NULL,

    CONSTRAINT "USUARIO_IDENTIFICACION_pkey" PRIMARY KEY ("id_usuario_identificacion")
);

-- CreateTable
CREATE TABLE "public"."USUARIO_PREGUNTA_SEGURIDAD" (
    "id_pregunta_seguridad" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "fecha_creacion" DATE NOT NULL,
    "id_estado_registro" INTEGER NOT NULL,
    "pregunta" VARCHAR NOT NULL,
    "respuesta" VARCHAR NOT NULL,

    CONSTRAINT "USUARIO_PREGUNTA_SEGURIDAD_pkey" PRIMARY KEY ("id_pregunta_seguridad")
);

-- CreateTable
CREATE TABLE "public"."USUARIO_OPCION" (
    "id_usuario_role" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_opcion" INTEGER NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "fecha_creacion" DATE NOT NULL,
    "id_estado_registro" BIT(1) NOT NULL,
    "actualizar" BIT(1) NOT NULL,
    "insertar" BIT(1) NOT NULL,
    "eliminar" BIT(1) NOT NULL,
    "leer" BIT(1) NOT NULL,

    CONSTRAINT "USUARIO_ROLE_pkey" PRIMARY KEY ("id_usuario_role")
);

-- CreateTable
CREATE TABLE "public"."REFRESH_TOKEN" (
    "id_refresh_token" BIGSERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "token_hash" TEXT NOT NULL,
    "family_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "session_label" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used_at" TIMESTAMPTZ(6),
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "revoked_at" TIMESTAMPTZ(6),
    "revoked_reason" TEXT,
    "replaced_by" BIGINT,
    "ip" INET,
    "user_agent" TEXT,
    "device_fingerprint_hash" TEXT,

    CONSTRAINT "REFRESH_TOKEN_pkey" PRIMARY KEY ("id_refresh_token")
);

-- CreateTable
CREATE TABLE "public"."REFRESH_TOKEN_CLIENTE" (
    "id_refresh_token" BIGSERIAL NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "token_hash" TEXT NOT NULL,
    "family_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "session_label" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used_at" TIMESTAMPTZ(6),
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "revoked_at" TIMESTAMPTZ(6),
    "revoked_reason" TEXT,
    "replaced_by" BIGINT,
    "ip" INET,
    "user_agent" TEXT,
    "device_fingerprint_hash" TEXT,

    CONSTRAINT "REFRESH_TOKEN_CLIENTE_pkey" PRIMARY KEY ("id_refresh_token")
);

-- CreateTable
CREATE TABLE "public"."LOG_PRODUCTO" (
    "id_log_producto" SERIAL NOT NULL,
    "p_producto_id" INTEGER NOT NULL,
    "id_estado_producto" INTEGER NOT NULL,
    "id_proveedor" INTEGER NOT NULL,
    "nombre_producto" VARCHAR(150) NOT NULL,
    "valor_compra" DECIMAL(12,2) NOT NULL,
    "valor_unitario" DECIMAL(12,2) NOT NULL,
    "fecha_creacion" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "id_usuario_creacion" INTEGER,
    "tipo_accion" VARCHAR(10) NOT NULL,

    CONSTRAINT "LOG_PRODUCTO_pkey" PRIMARY KEY ("id_log_producto")
);

-- CreateTable
CREATE TABLE "public"."PRODUCTO_OFERTA" (
    "id_producto_oferta" SERIAL NOT NULL,
    "p_producto_id" INTEGER NOT NULL,
    "id_estado_registro" BIT(1) NOT NULL,
    "fecha_creacion" DATE NOT NULL,
    "id_usuario_creacion" INTEGER NOT NULL,
    "id_oferta" INTEGER,

    CONSTRAINT "PRODUCTO_VALOR_FINAL_pkey" PRIMARY KEY ("id_producto_oferta")
);

-- CreateIndex
CREATE INDEX "TELEFONO_CLIENTE_index_0" ON "public"."TELEFONO_CLIENTE"("telefono", "id_empresa");

-- CreateIndex
CREATE UNIQUE INDEX "uq_usuario_uuid" ON "public"."USUARIO"("uuid_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "uq_usuario_correo" ON "public"."USUARIO"("correo_principal");

-- CreateIndex
CREATE UNIQUE INDEX "uq_usuario_codigo" ON "public"."USUARIO"("codigo_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "uq_refresh_token_hash" ON "public"."REFRESH_TOKEN"("token_hash");

-- CreateIndex
CREATE INDEX "idx_refresh_expires" ON "public"."REFRESH_TOKEN"("expires_at");

-- CreateIndex
CREATE INDEX "idx_refresh_family" ON "public"."REFRESH_TOKEN"("family_id");

-- CreateIndex
CREATE INDEX "idx_refresh_user" ON "public"."REFRESH_TOKEN"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "uq_refresh_token_hash_cliente" ON "public"."REFRESH_TOKEN_CLIENTE"("token_hash");

-- AddForeignKey
ALTER TABLE "public"."ACTIVO" ADD CONSTRAINT "ACTIVO_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."USUARIO"("usuario_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."ACTIVO" ADD CONSTRAINT "fk_activo_cat_tipo_activo" FOREIGN KEY ("id_tipo_activo") REFERENCES "public"."CAT_TIPO_ACTIVO"("id_tipo_activo") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."ACTIVO" ADD CONSTRAINT "fk_activo_producto" FOREIGN KEY ("id_producto") REFERENCES "public"."PRODUCTO"("p_producto_Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."ACTIVO" ADD CONSTRAINT "fk_activo_usuario_mantenimiento" FOREIGN KEY ("id_usuario_aplica_mantenimiento") REFERENCES "public"."USUARIO"("usuario_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."ACTIVO" ADD CONSTRAINT "fk_contraint_riesto_activo_activo" FOREIGN KEY ("id_tipo_riesgo") REFERENCES "public"."CAT_TIPO_RIESGO_ACTIVO"("id_tipo_riesgo_activo") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."CAT_DEPARTAMENTO" ADD CONSTRAINT "fk_departamento_pais" FOREIGN KEY ("id_pais") REFERENCES "public"."CAT_PAIS"("id_pais") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."CAT_MUNICIPIO" ADD CONSTRAINT "fk_contraint_cat_municipio_departamento" FOREIGN KEY ("id_departamento") REFERENCES "public"."CAT_DEPARTAMENTO"("id_departamento") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."CLIENTE" ADD CONSTRAINT "fk_cliente_sexo" FOREIGN KEY ("id_sexo") REFERENCES "public"."CAT_SEXO"("sexo_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."CLIENTE_CONTACTO" ADD CONSTRAINT "CLIENTE_CONTACTO_id_usuario_creacion_fkey" FOREIGN KEY ("id_usuario_creacion") REFERENCES "public"."USUARIO"("usuario_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."CLIENTE_IDENTIFICACION" ADD CONSTRAINT "CLIENTE_IDENTIFICACION_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "public"."CLIENTE"("id_cliente") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."CLIENTE_IDENTIFICACION" ADD CONSTRAINT "CLIENTE_IDENTIFICACION_id_tipo_documento_fkey" FOREIGN KEY ("id_tipo_documento") REFERENCES "public"."CAT_TIPO_DOCUMENTO"("id_tipo_documento") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."CLIENTE_PEDIDO" ADD CONSTRAINT "CLIENTE_PEDIDO_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "public"."CLIENTE"("id_cliente") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."CLIENTE_PEDIDO" ADD CONSTRAINT "CLIENTE_PEDIDO_id_estado_pedido_fkey" FOREIGN KEY ("id_estado_pedido") REFERENCES "public"."CAT_ESTADO_PEDIDO"("id_estado_pedido") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."CLIENTE_PEDIDO" ADD CONSTRAINT "fk_cliente_pedido_usuario" FOREIGN KEY ("id_usuario_creacion") REFERENCES "public"."USUARIO"("usuario_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."CLIENTE_PEDIDO_DETALLE" ADD CONSTRAINT "fk_pedido_detalle_cliente_pedido" FOREIGN KEY ("id_cliente_pedido") REFERENCES "public"."CLIENTE_PEDIDO"("id_cliente_pedido") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."CLIENTE_PEDIDO_DETALLE" ADD CONSTRAINT "fk_producto_cliente_pedido_detalle" FOREIGN KEY ("p_producto_id") REFERENCES "public"."PRODUCTO"("p_producto_Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."CONFIGURACION_GENERAL" ADD CONSTRAINT "CONFIGURACION_GENERAL_id_empresa_fkey" FOREIGN KEY ("id_empresa") REFERENCES "public"."EMPRESA"("id_empresa") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."CONFIGURACION_GENERAL" ADD CONSTRAINT "fk_configura_general_tipo_configuracion_general" FOREIGN KEY ("id_tipo_configuracion_general") REFERENCES "public"."CAT_TIPO_CONFIGURACION_GENERAL"("id_tipo_configuracion_general") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."DIRECCION" ADD CONSTRAINT "fk_direccion_municipio" FOREIGN KEY ("id_municipio") REFERENCES "public"."CAT_MUNICIPIO"("id_municipio") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."EMPRESA" ADD CONSTRAINT "fk_empresa_direccion" FOREIGN KEY ("id_direccion") REFERENCES "public"."DIRECCION"("id_direccion") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."HISTORIAL_INCIDENTES" ADD CONSTRAINT "HISTORIAL_INCIDENTES_id_usuario_incidencia_fkey" FOREIGN KEY ("id_usuario_incidencia") REFERENCES "public"."USUARIO"("usuario_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."LOG_INGRESO_CLIENTE" ADD CONSTRAINT "LOG_INGRESO_CLIENTE_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "public"."CLIENTE"("id_cliente") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."LOG_INGRESO_USUARIO" ADD CONSTRAINT "LOG_INGRESO_USUARIO_id_refresh_token_fkey" FOREIGN KEY ("id_refresh_token") REFERENCES "public"."REFRESH_TOKEN"("id_refresh_token") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."LOG_INGRESO_USUARIO" ADD CONSTRAINT "fk_log_ingreso_usuario_usuario" FOREIGN KEY ("id_usuario") REFERENCES "public"."USUARIO"("usuario_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."MANTENIMIENTO" ADD CONSTRAINT "MANTENIMIENTO_id_accion_correctiva_fkey" FOREIGN KEY ("id_accion_correctiva") REFERENCES "public"."CAT_ACCION_CORRECTIVA"("id_accion_correctiva") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."MANTENIMIENTO" ADD CONSTRAINT "MANTENIMIENTO_id_activo_fkey" FOREIGN KEY ("id_activo") REFERENCES "public"."ACTIVO"("id_activo") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."MENU" ADD CONSTRAINT "fk_menu_modulo" FOREIGN KEY ("id_modulo") REFERENCES "public"."MODULO"("id_modulo") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."MOVIMIENTO_INVENTARIO" ADD CONSTRAINT "MOVIMIENTO_INVENTARIO_id_usuario_creacion_fkey" FOREIGN KEY ("id_usuario_creacion") REFERENCES "public"."USUARIO"("usuario_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."MOVIMIENTO_INVENTARIO" ADD CONSTRAINT "fk_movimiento_inventario_razon_movimiento" FOREIGN KEY ("id_razon_movimiento") REFERENCES "public"."CAT_RAZON_MOVIMIENTO"("id_razon_movimiento") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."MOVIMIENTO_INVENTARIO" ADD CONSTRAINT "fk_movimiento_inventario_tipo_movimiento" FOREIGN KEY ("id_tipo_movimiento") REFERENCES "public"."CAT_TIPO_MOVIMIENTO"("id_tipo_movimiento") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."MOVIMIENTO_INVENTARIO" ADD CONSTRAINT "fk_producto_movimiento_inventario" FOREIGN KEY ("p_producto_id") REFERENCES "public"."PRODUCTO"("p_producto_Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."OFERTA" ADD CONSTRAINT "OFERTA_id_tipo_oferta_fkey" FOREIGN KEY ("id_tipo_oferta") REFERENCES "public"."CAT_TIPO_OFERTA"("id_tipo_oferta") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."OPCION" ADD CONSTRAINT "fk_opcion_menu" FOREIGN KEY ("id_menu") REFERENCES "public"."MENU"("id_menu") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."PRODUCTO" ADD CONSTRAINT "PRODUCTO_id_estado_producto_fkey" FOREIGN KEY ("id_estado_producto") REFERENCES "public"."CAT_ESTADO_PRODUCTO"("id_estado_producto") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."PRODUCTO" ADD CONSTRAINT "fk_producto_cat_proveedor" FOREIGN KEY ("id_proveedor") REFERENCES "public"."CAT_PROVEEDOR"("id_proveedor") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."PRODUCTO" ADD CONSTRAINT "fk_producto_tipo_producto" FOREIGN KEY ("id_tipo_producto") REFERENCES "public"."CAT_TIPO_PRODUCTO"("id_tipo_producto") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."ROLE_OPCION" ADD CONSTRAINT "ROLE_OPCION_id_opcion_fkey" FOREIGN KEY ("id_opcion") REFERENCES "public"."OPCION"("id_opcion") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."ROLE_OPCION" ADD CONSTRAINT "fk_contraint_role_opcion_role" FOREIGN KEY ("id_role") REFERENCES "public"."ROLE"("id_role") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."ROLE_USUARIO" ADD CONSTRAINT "fk_contraint_role_usuario_role" FOREIGN KEY ("id_role") REFERENCES "public"."ROLE"("id_role") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."ROLE_USUARIO" ADD CONSTRAINT "fk_role_usuario_usuario" FOREIGN KEY ("id_usuario") REFERENCES "public"."USUARIO"("usuario_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."SUCURSAL" ADD CONSTRAINT "fk_sucursal_cat_estado_sucursal" FOREIGN KEY ("id_estado_sucursal") REFERENCES "public"."CAT_ESTADO_SUCURSAL"("id_estado_sucursal") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."SUCURSAL" ADD CONSTRAINT "fk_sucursal_direccion" FOREIGN KEY ("id_direccion") REFERENCES "public"."DIRECCION"("id_direccion") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."SUCURSAL" ADD CONSTRAINT "fk_sucursal_empresa" FOREIGN KEY ("id_empresa") REFERENCES "public"."EMPRESA"("id_empresa") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."TELEFONO_CLIENTE" ADD CONSTRAINT "TELEFONO_CLIENTE_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "public"."CLIENTE"("id_cliente") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."TELEFONO_CLIENTE" ADD CONSTRAINT "TELEFONO_CLIENTE_id_estado_telefono_fkey" FOREIGN KEY ("id_estado_telefono") REFERENCES "public"."CAT_ESTADO_TELEFONO"("id_estado_telefono") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."TELEFONO_USUARIO" ADD CONSTRAINT "TELEFONO_USUARIO_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."USUARIO"("usuario_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."TELEFONO_USUARIO" ADD CONSTRAINT "fk_telefono_usuario_cat_estado_telefono" FOREIGN KEY ("id_estado_telefono") REFERENCES "public"."CAT_ESTADO_TELEFONO"("id_estado_telefono") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."USUARIO" ADD CONSTRAINT "USUARIO_id_estado_usuario_fkey" FOREIGN KEY ("id_estado_usuario") REFERENCES "public"."CAT_ESTADO_USUARIO"("id_estado_usuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."USUARIO" ADD CONSTRAINT "USUARIO_id_sucursal_fkey" FOREIGN KEY ("id_sucursal") REFERENCES "public"."SUCURSAL"("id_sucursal") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."USUARIO" ADD CONSTRAINT "fk_usuario_cat_sexo" FOREIGN KEY ("id_sexo") REFERENCES "public"."CAT_SEXO"("sexo_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."USUARIO_CONTACTO" ADD CONSTRAINT "USUARIO_CONTACTO_id_tipo_contacto_fkey" FOREIGN KEY ("id_tipo_contacto") REFERENCES "public"."CAT_TIPO_CONTACTO"("id_tipo_parametro_general") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."USUARIO_CONTACTO" ADD CONSTRAINT "USUARIO_CONTACTO_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."USUARIO"("usuario_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."USUARIO_IDENTIFICACION" ADD CONSTRAINT "USUARIO_IDENTIFICACION_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."USUARIO"("usuario_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."USUARIO_IDENTIFICACION" ADD CONSTRAINT "fk_usuario_identificacion_tipo_documento" FOREIGN KEY ("id_tipo_documento") REFERENCES "public"."CAT_TIPO_DOCUMENTO"("id_tipo_documento") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."USUARIO_PREGUNTA_SEGURIDAD" ADD CONSTRAINT "fk_usuario_pregunta_seguridad_usuario" FOREIGN KEY ("id_usuario") REFERENCES "public"."USUARIO"("usuario_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."USUARIO_OPCION" ADD CONSTRAINT "USUARIO_ROLE_id_opcion_fkey" FOREIGN KEY ("id_opcion") REFERENCES "public"."OPCION"("id_opcion") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."USUARIO_OPCION" ADD CONSTRAINT "fk_usuario_opcion_usuario" FOREIGN KEY ("id_usuario") REFERENCES "public"."USUARIO"("usuario_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."REFRESH_TOKEN" ADD CONSTRAINT "REFRESH_TOKEN_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."USUARIO"("usuario_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."REFRESH_TOKEN" ADD CONSTRAINT "REFRESH_TOKEN_replaced_by_fkey" FOREIGN KEY ("replaced_by") REFERENCES "public"."REFRESH_TOKEN"("id_refresh_token") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."REFRESH_TOKEN_CLIENTE" ADD CONSTRAINT "REFRESH_TOKEN_CLIENTE_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "public"."CLIENTE"("id_cliente") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."REFRESH_TOKEN_CLIENTE" ADD CONSTRAINT "REFRESH_TOKEN_CLIENTE_replaced_by_fkey" FOREIGN KEY ("replaced_by") REFERENCES "public"."REFRESH_TOKEN_CLIENTE"("id_refresh_token") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."LOG_PRODUCTO" ADD CONSTRAINT "fk_producto" FOREIGN KEY ("p_producto_id") REFERENCES "public"."PRODUCTO"("p_producto_Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."PRODUCTO_OFERTA" ADD CONSTRAINT "PRODUCTO_VALOR_FINAL_id_usuario_creacion_fkey" FOREIGN KEY ("id_usuario_creacion") REFERENCES "public"."USUARIO"("usuario_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."PRODUCTO_OFERTA" ADD CONSTRAINT "fk_producto_oferta_oferta" FOREIGN KEY ("id_oferta") REFERENCES "public"."OFERTA"("id_oferta") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."PRODUCTO_OFERTA" ADD CONSTRAINT "fk_producto_oferta_producto" FOREIGN KEY ("p_producto_id") REFERENCES "public"."PRODUCTO"("p_producto_Id") ON DELETE NO ACTION ON UPDATE NO ACTION;
