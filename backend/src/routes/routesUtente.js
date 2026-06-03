import express from "express";
import bcrypt from "bcrypt";
import schemaUtente from "../models/user.js";
import schemaRistorante from "../models/ristorante.js";
import { verificaToken } from "../middlewares/auth.js";

const router = express.Router();

router.use(verificaToken);

// GET legge dati profilo
router.get("/me", async (req, res, next) => {
	try {
		// esclude password
		const utente = await schemaUtente.findById(req.utenteLoggato.idUtente).select("-password");

		if (!utente) {
			return res.status(404).json({ message: "Utente non trovato." });
		}

		res.json(utente);
	} catch (error) {
		next(error);
	}
});

// PUT aggiorna dati
router.put("/me", async (req, res, next) => {
	try {
		const { nome, cognome, email, password, metodoPagamento, preferenze } = req.body;

		let datiDaAggiornare = {};

		if (nome) datiDaAggiornare.nome = nome;
		if (cognome) datiDaAggiornare.cognome = cognome;
		if (email) datiDaAggiornare.email = email;

		if (req.utenteLoggato.ruolo === 'cliente') {
			if (metodoPagamento) datiDaAggiornare.metodoPagamento = metodoPagamento;
			if (preferenze) datiDaAggiornare.preferenze = preferenze;
		}

		if (password) {
			if (password.length < 6) {
				return res.status(400).json({ message: "La password deve contenere almeno 6 caratteri" });
			}
			datiDaAggiornare.password = await bcrypt.hash(password, 10);
		}

		const utenteAggiornato = await schemaUtente.findByIdAndUpdate(
			req.utenteLoggato.idUtente,
			{ $set: datiDaAggiornare },
			{ returnDocument: 'after', runValidators: true }
		).select("-password");

		res.json({ message: "Profilo aggiornato con successo", utente: utenteAggiornato });

	} catch (error) {
		if (error.code === 11000) {
			return res.status(409).json({ message: "Questa email è già in uso da un altro account." });
		}
		next(error);
	}
});

// DELETE cancella accccount
router.delete("/me", async (req, res, next) => {
	try {
		const idUtente = req.utenteLoggato.idUtente;

		// Se ristoratore, cancella anche ristorante
		if (req.utenteLoggato.ruolo === 'ristoratore') {
			await schemaRistorante.findOneAndDelete({ proprietario: idUtente });
		}

		await schemaUtente.findByIdAndDelete(idUtente);

		res.json({ message: "Account eliminato con successo." });
	} catch (error) {
		next(error);
	}
});

export default router;