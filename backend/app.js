import "dotenv/config";
import dns from "dns";
import swaggerUi from "swagger-ui-express";
import fs from "fs";

dns.setServers(["1.1.1.1", "1.0.0.1"]);
import express from "express";
import cors from "cors";
import {connectDB} from "./src/config/database.js";

import routesRistorante from "./src/routes/routesRistorante.js";
import routesCatalogo from "./src/routes/routesCatalogo.js";
import routesClienti from "./src/routes/routesClienti.js";
import routesAuth from "./src/routes/routesAuth.js";
import routesUtente from "./src/routes/routesUtente.js";
import routesOrdini from "./src/routes/routesOrdini.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

await connectDB();

const swaggerDocument = JSON.parse(fs.readFileSync('./swagger.json', 'utf-8'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/ristoranti", routesClienti);
app.use("/api/utenti", routesUtente);
app.use("/api/ristoratore", routesRistorante);
app.use("/api/catalogo", routesCatalogo);
app.use("/api/auth", routesAuth);
app.use("/api/ordini", routesOrdini);

// Middleware per gestione errori
app.use((error, req, res, next) => {
    console.error("Errore:", error.message);

    const statusCode = error.status || 500;

    return res.status(statusCode).json({
       status: "error",
       message: error.message || "Errore interno del server."
    });
});

app.listen(PORT, () => {
	console.log(`Server in esecuzione sulla porta ${PORT}`);
});