require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const { PrismaClient } = require("@prisma/client");

const authRoutes = require("./routes/auth.routes");
const perfilRoutes = require("./routes/perfil.routes");
const cargaInicialRoutes = require("./routes/cargaInicial.routes");
const inventarioRoutes = require("./routes/Inventario.routes");

const app = express();

const prisma = new PrismaClient();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
  : [];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin);
      } else {
        callback(new Error("No permitido por CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.set("trust proxy", 1);

const maxPeticiones = process.env.INDEFINIDOPETICIONES
  ? parseInt(process.env.INDEFINIDOPETICIONES)
  : 25;

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: maxPeticiones,
  message: "Demasiadas peticiones, intenta más tarde.",
});

app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/perfil", perfilRoutes);
app.use("/api/v1/cargaInicial", cargaInicialRoutes);
app.use("/api/v1/inventario", inventarioRoutes);

app.get("/", async (req, res) => {
  try {
    const usuarios = await prisma.uSUARIO.findMany({ take: 5 });
    res.json({ status: "OK", sample: usuarios });
  } catch (err) {
    res
      .status(500)
      .json({
        error: "Error al conectarse a la base de datos",
        details: err.message,
      });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(
    `Render URL: ${
      process.env.RENDER_EXTERNAL_URL || "http://localhost:" + PORT
    }`
  );
});
