import "dotenv/config";
import dns from "dns";

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

app.use("/api/ristoranti", routesClienti);
app.use("/api/utenti", routesUtente);
app.use("/api/ristoratore", routesRistorante);
app.use("/api/catalogo", routesCatalogo);
app.use("/api/auth", routesAuth);
app.use("/api/ordini", routesOrdini);

// Middleware per gestione errori
app.use((error, req, res, next) => {
	console.error("Errore:", error.message);

	// Errore validazione dati
	if (error.name === 'ValidationError') {
		return res.status(400).json({
			status: "fail",
			message: "I dati inseriti non sono validi o sono incompleti.",
			dettagli: error.message
		});
	}

	// Dati duplicati
	if (error.code === 11000) {
		return res.status(409).json({
			status: "fail",
			message: "Dati duplicati"
		});
	}

	// Altri errori
	return res.status(500).json({
		status: "error",
		message: "Errore interno del server. Riprovare più tardi."
	});
});

app.listen(PORT, () => {
	console.log(`Server in esecuzione sulla porta ${PORT}`);
});