const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT;
const IP_ADDRESS = process.env.IP_ADDRESS;

/**
 * IMPORTAR RUTAS
 */

const authRoutes = require("./src/routes/auth.routes");
const adminRoutes = require("./src/routes/admin.routes");
const clasesRoutes = require("./src/routes/clases.routes");
const materiasRoutes = require("./src/routes/materias.routes");
const tareasRoutes = require("./src/routes/tareas.routes");
const entregasRoutes = require("./src/routes/entregas.routes");
const anunciosRoutes = require("./src/routes/anuncios.routes");
const dashboardRoutes = require("./src/routes/dashboard.routes");
const calificacionesRoutes = require("./src/routes/calificaciones.routes");
const perfilRoutes = require("./src/routes/perfil.routes");

/**
 * CORS
 */

app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
);

/**
 * MIDDLEWARES
 */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * RUTAS API
 */

app.use("/api", authRoutes);

app.use("/api/admin", adminRoutes);
app.use("/api/clases", clasesRoutes);
app.use("/api/materias", materiasRoutes);
app.use("/api/tareas", tareasRoutes);
app.use("/api/entregas", entregasRoutes);
app.use("/api/anuncios", anunciosRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/calificacion", calificacionesRoutes);
app.use("/api/perfil", perfilRoutes);

/**
 * HEALTH CHECK
 */

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "API funcionando correctamente 🚀",
    });
});

/**
 * SERVER
 */

app.listen(PORT, "0.0.0.0", () => {
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 SERVIDOR INICIADO
🌐 Local:
http://localhost:${PORT}

📱 Red:
http://[IP_ADDRESS]${PORT}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});