import jwt from "jsonwebtoken";

export const verificaToken = (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({ message: "Token mancante." });
	}
	// togliamo "Bearer" per ottenere solo il token
	const token = authHeader.split(" ")[1];

	try {
		// Verifichiamo il token
		req.utenteLoggato = jwt.verify(token, process.env.JWT_SECRET);
		next();
	} catch (error) {
		return res.status(401).json({ message: "Token non valido o scaduto. Effettua di nuovo il login." });
	}
};

// Middleware per proteggere rotte riservate ai ristoratori
export const soloRistoratori = (req, res, next) => {
	if (req.utenteLoggato.ruolo !== 'ristoratore') {
		return res.status(403).json({ message: "Accesso negato. Area riservata ai ristoratori." });
	}
	next();
};