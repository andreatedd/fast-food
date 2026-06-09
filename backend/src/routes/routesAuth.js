import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import schemaUtente from "../models/user.js";
import { validaRegistrazione, validaLogin } from "../middlewares/validations.js";

const router = express.Router();

// POST registrazione
router.post("/signup", validaRegistrazione, async (req, res, next) => {
	const {nome, cognome, email, password, ruolo, metodoPagamento, preferenze} = req.body;

	try {
		const passwordCriptata = await bcrypt.hash(password, 10);
		await schemaUtente.create({
			nome,
			cognome,
			email,
			password: passwordCriptata,
			ruolo,
			metodoPagamento: metodoPagamento || 'nessuno',
			preferenze: preferenze || []
		});
		res.status(201).json({message: "Registrazione completata con successo!"});

	} catch (error) {
		next(error);
	}
});

// POST login
router.post("/login", validaLogin, async (req, res, next) => {
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
		next(error);
	}
});

export default router;