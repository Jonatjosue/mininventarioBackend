-- AlterTable
CREATE SEQUENCE "public".role_usuario_id_role_usuario_seq;
ALTER TABLE "public"."ROLE_USUARIO" ALTER COLUMN "id_role_usuario" SET DEFAULT nextval('"public".role_usuario_id_role_usuario_seq');
ALTER SEQUENCE "public".role_usuario_id_role_usuario_seq OWNED BY "public"."ROLE_USUARIO"."id_role_usuario";
