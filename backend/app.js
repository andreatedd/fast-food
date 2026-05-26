import "dotenv/config";
import dns from "dns";

dns.setServers(["1.1.1.1", "1.0.0.1"]);
import express from "express";
import cors from "cors";
import {connectDB} from "./src/config/database.js";

import routesRistorante from "./src/routes/routesRistorante.js";
import routesCatalogo from "./src/routes/routesCatalogo.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

await connectDB();

app.use("/api/ristoranti", routesRistorante);

app.use("/api/catalogo", routesCatalogo);

app.listen(PORT, () => {
	console.log(`Server in esecuzione sulla porta ${PORT}`);
});