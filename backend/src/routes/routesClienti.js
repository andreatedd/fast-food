import express from "express";
import schemaRistorante from "../models/ristorante.js";

const router = express.Router();

// GET tutti i ristoranti
router.get("/", async (req, res, next) => {
	try {
		const ristoranti = await schemaRistorante.find();
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