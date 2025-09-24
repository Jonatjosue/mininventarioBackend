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

const app = express();
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

module.exports = app;
