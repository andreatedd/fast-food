import express from "express";
import schemaRistorante from "../models/ristorante.js";

const router = express.Router();

// GET ristoranti
router.get("/", async (req, res, next) => {
	try {
		const { nome, luogo } = req.query;
		let query = {};

		if (nome) query.nome = { $regex: nome, $options: "i" };
		if (luogo) query.indirizzo = { $regex: luogo, $options: "i" };

		let operazioneDb = schemaRistorante.find(query);

		// all'inizio limitiamo i risultati a 6
		if (!nome && !luogo) {
			operazioneDb = operazioneDb.limit(6);
		}

		// Eseguiamo la query finale
		const ristoranti = await operazioneDb;

		res.json(ristoranti);
	} catch (error) {
		next(error);
	}
});

// GET ristorante
router.get("/:id", async (req, res, next) => {
	try {
		const ristorante = await schemaRistorante.findById(req.params.id);
		if (!ristorante) {
			return res.status(404).json({ message: "Ristorante non trovato" });
		}
		res.json(ristorante);
	} catch (error) {
		if (error.name === 'CastError') {
			return res.status(400).json({ message: "ID Ristorante non valido" });
		}
		next(error);
	}
});

export default router;