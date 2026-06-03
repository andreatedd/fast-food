import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import schemaUtente from "../models/user.js";

const router = express.Router();

// POST registrazione
router.post("/signup", async (req, res) => {
	const {nome, cognome, email, password, ruolo, metodoPagamento, preferenze} = req.body;

	if (!nome || nome.length < 2) {
		return res.status(400).json({message: "Nome troppo corto"});
	}
	if (!cognome || cognome.length < 2) {
		return res.status(400).json({message: "Cognome troppo corto"});
	}
	if (!email || !password) {
		return res.status(400).json({message: "Email e password sono obbligatorie"});
	}
	if (password.length < 6) {
		return res.status(400).json({message: "La password deve contenere almeno 6 caratteri"});
	}

	try {
		const passwordCriptata = await bcrypt.hash(password, 10); // cifratura password
		await schemaUtente.create({
			nome,
			cognome,
			email,
			password: passwordCriptata,
			ruolo: ruolo,
			metodoPagamento: metodoPagamento || 'nessuno',
			preferenze: preferenze || []
		});
		res.status(201).json({message: "Registrazione completata con successo!"});

	} catch (error) {
		if (error.code === 11000) {
			res.status(409).json({message: "Email già in uso"});
		} else {
			res.status(500).json({message: "Errore interno del server durante la registrazione"});
		}
	}
});

// POST login
router.post("/login", async (req, res) => {
	const {email, password} = req.body;

	try {
		const utente = await schemaUtente.findOne({email: email});
		if (!utente) {
			return res.status(401).json({message: "Email non valida"});
		}

		const passwordCorretta = await bcrypt.compare(password, utente.password);
		if (!passwordCorretta) {
			return res.status(401).json({message: "Password errata"});
		}

		// Creiamo access token
		const token = jwt.sign(
			{idUtente: utente._id, ruolo: utente.ruolo},
			process.env.JWT_SECRET,
			{expiresIn: "1d"} // scade dopo 24 ore
		);

		res.json({
			message: "Login effettuato con successo",
			token: token,
			ruolo: utente.ruolo
		});

	} catch (error) {
		res.status(500).json({message: "Errore interno del server durante il login"});
	}
});

export default router;