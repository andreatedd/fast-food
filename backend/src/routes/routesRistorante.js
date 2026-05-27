import express from "express";
import schemaRistorante from "../models/ristorante.js";

const router = express.Router();

// GET profilo e menù
router.get("/me", async (req, res, next) => {
	try {
		// Simuliamo l'utente loggato prendendo il primo ristorante nel DB
		let ristorante = await schemaRistorante.findOne();

		// Ristorante fittizio
		if (!ristorante) {
			ristorante = await schemaRistorante.create({
				nome: "Il Mio FastFood",
				partitaIva: "12345678901",
				telefono: "02 1234567",
				email: "admin@fastfood.it",
				indirizzo: "Via Roma 1, Milano",
				menu: []
			});
		}
		res.json(ristorante);
	} catch (error) {
		next(error);
	}
});

// PUT aggiorna informazioni ristorante (es. nome, indirizzo, telefono, email)
router.put("/me", async (req, res, next) => {
	try {
		const ristorante = await schemaRistorante.findOne();

		const updated = await schemaRistorante.findByIdAndUpdate(
			ristorante._id,
			{$set: req.body}, // aggiorna solo le info nel form html
			{new: true, runValidators: true} // true restituisce il nuovo oggetto (per mostrarlo), runValidators assicura che le validazioni vengano fatte anche in update
		);

		res.json(updated);
	} catch (error) {
		next(error);
	}
});

// PUT salva il menù
router.put("/me/menu", async (req, res, next) => {
	try {
		const ristorante = await schemaRistorante.findOne();

		ristorante.menu = req.body;

		await ristorante.save();
		res.json(ristorante.menu);
	} catch (error) {
		next(error);
	}
});

export default router;