import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Autenticazione e sicurezza

export const verificaToken = (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({message: "Token mancante."});
	}
	// toglie "Bearer" per ottenere solo il token
	const token = authHeader.split(" ")[1];

	try {
		// verifica token
		req.utenteLoggato = jwt.verify(token, process.env.JWT_SECRET);
		next();
	} catch (error) {
		return res.status(401).json({message: "Token non valido o scaduto. Effettua di nuovo il login."});
	}
};

// protezione rotte ristoratori e clienti
export const soloRistoratori = (req, res, next) => {
	if (req.utenteLoggato.ruolo !== 'ristoratore') {
		return res.status(403).json({message: "Accesso negato. Area riservata ai ristoratori."});
	}
	next();
};

export const soloClienti = (req, res, next) => {
	if (req.utenteLoggato.ruolo !== 'cliente') {
		return res.status(403).json({ message: "Accesso negato. Accedi prima al tuo account Cliente." });
	}
	next();
};

export const validaRegistrazione = (req, res, next) => {
	const {nome, cognome, email, password} = req.body;

	if (!nome || nome.trim().length < 2) {
		return res.status(400).json({message: "Il nome deve contenere almeno 2 caratteri."});
	}
	if (!cognome || cognome.trim().length < 2) {
		return res.status(400).json({message: "Il cognome deve contenere almeno 2 caratteri."});
	}

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!email || !emailRegex.test(email)) {
		return res.status(400).json({message: "Inserisci un indirizzo email valido."});
	}

	if (!password || password.length < 6) {
		return res.status(400).json({message: "La password deve contenere almeno 6 caratteri."});
	}

	next();
};

export const validaLogin = (req, res, next) => {
	const {email, password} = req.body;
	if (!email || !password) {
		return res.status(400).json({message: "Email e password sono obbligatorie."});
	}
	next();
};


// Controllo input dati e aggiornamenti

export const validaAggiornamentoUtente = (req, res, next) => {
	const {nome, cognome, email, password} = req.body;

	if (nome !== undefined && nome.trim().length < 2) {
		return res.status(400).json({message: "Il nome deve contenere almeno 2 caratteri."});
	}

	if (cognome !== undefined && cognome.trim().length < 2) {
		return res.status(400).json({message: "Il cognome deve contenere almeno 2 caratteri."});
	}

	if (email !== undefined) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({message: "Inserisci un indirizzo email valido."});
		}
	}

	if (password !== undefined && password.length < 6) {
		return res.status(400).json({message: "La nuova password deve contenere almeno 6 caratteri."});
	}

	next();
};

export const validaIdMongo = (req, res, next) => {
	if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
		return res.status(400).json({message: "L'ID fornito non è in un formato valido."});
	}
	next();
};

export const validaDatiRistorante = (req, res, next) => {
	const {nome, partitaIva, email} = req.body;

	if (!nome || nome.trim() === "") {
		return res.status(400).json({message: "Il nome del ristorante è obbligatorio."});
	}
	if (!partitaIva || !/^[0-9]{11}$/.test(partitaIva)) {
		return res.status(400).json({message: "La Partita IVA deve contenere esattamente 11 numeri."});
	}
	if (email) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({message: "Formato email del ristorante non valido."});
		}
	}
	next();
};

export const validaMenuRistorante = (req, res, next) => {
	if (!Array.isArray(req.body)) {
		return res.status(400).json({message: "Il menù deve essere una lista (array) di piatti."});
	}
	next();
};

export const validaNuovoOrdine = (req, res, next) => {
	const {ristoranteId, piatti} = req.body;
	if (!mongoose.Types.ObjectId.isValid(ristoranteId)) {
		return res.status(400).json({message: "ID Ristorante non valido."});
	}
	if (!Array.isArray(piatti) || piatti.length === 0) {
		return res.status(400).json({message: "Il carrello è vuoto o non valido."});
	}
	next();
};

export const validaStatoOrdine = (req, res, next) => {
	const {stato} = req.body;
	const statiValidi = ['ordinato', 'in preparazione', 'consegnato'];
	if (!stato || !statiValidi.includes(stato)) {
		return res.status(400).json({message: "Stato ordine non consentito."});
	}
	next();
};