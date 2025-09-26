require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const perfilRoutes = require("./routes/perfil.routes");
const cargaInicialRoutes = require("./routes/cargaInicial.routes");
const inventario = require("./routes/Inventario.routes");
const venta = require("./routes/venta.routes");
const Sentry = require("@sentry/node");

const app = express();

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    // send console.log, console.warn, and console.error calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],
  // Enable logs to be sent to Sentry
  enableLogs: true,
  tracesSampleRate: 1.0,
});

Sentry.logger.info("User triggered test log", { action: "test_log" });

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
  : [];

app.use(
  cors({
    origin: function (origin, callback) {
      // Permite peticiones sin origen (como Postman) o desde los orígenes permitidos
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin);
      } else {
        callback(new Error("No permitido por CORS"));
      }
    },
    credentials: true, // Permite cookies y credenciales
  })
);
app.use(express.json());
app.use(cookieParser());
app.set("trust proxy", 1);

const peticiones = process.env.INDEFINIDOPETICIONES;
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: peticiones, // máximo 20 peticiones por IP
  message: "Demasiadas peticiones, intenta más tarde.",
});

app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/perfil", perfilRoutes);
app.use("/api/v1/cargaInicial", cargaInicialRoutes);
app.use("/api/v1/inventario", inventario);
app.use("/api/v1/venta", venta);


app.get("/", (req, res) => {
  throw new Error("Error de prueba para Sentry");
  //
  // Ruta raíz para verificar que el servidor está funcionando
  //
  res.send("API de Inventario funcionando correctamente");
});

app.use((err, req, res, next) => {
  console.error("Error atrapado:", err);
  Sentry.captureException(err); // captura en Sentry
  res.status(500).json({ message: "Algo salió mal" });
});

module.exports = app;
