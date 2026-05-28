const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./src/config/db");

const app = express();

const PORT = process.env.PORT || 3000;

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
const reportesRoutes = require("./src/routes/reportes.routes");

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
app.use("/api/reportes", reportesRoutes);

/**
 * AULAS LISTING
 */
app.get("/api/aulas", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM Aula ORDER BY edificio, numero");
        res.json(result.rows);
    } catch (err) {
        console.error("Error al obtener aulas:", err);
        res.status(500).json({ error: "Error interno al obtener aulas" });
    }
});

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

  `);
});