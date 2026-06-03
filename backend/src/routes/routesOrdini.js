import express from "express";
import schemaOrdine from "../models/ordine.js";
import schemaRistorante from "../models/ristorante.js";
import { verificaToken, soloRistoratori } from "../middlewares/auth.js";

const router = express.Router();

router.use(verificaToken);

// API CLIENTE

// POST nuovo ordine
router.post("/", async (req, res, next) => {
	try {
		if (req.utenteLoggato.ruolo !== 'cliente') {
			return res.status(403).json({ message: "Solo i clienti possono effettuare ordini." });
		}

		const { ristoranteId, piatti } = req.body;

		if (!piatti || piatti.length === 0) {
			return res.status(400).json({ message: "Il carrello è vuoto." });
		}

		// calcolo prezzo tot
		let totale = 0;
		piatti.forEach(piatto => {
			totale += (piatto.prezzo * piatto.quantita);
		});

		// calcolo tempo attesa
		const ordiniInCoda = await schemaOrdine.countDocuments({
			ristorante: ristoranteId,
			stato: { $in: ['ordinato', 'in preparazione'] }
		});

		const tempoBase = 10;
		const tempoPerOrdineExtra = 5;
		const tempoAttesaStimato = tempoBase + (ordiniInCoda * tempoPerOrdineExtra);

		// creazione ordine
		const nuovoOrdine = await schemaOrdine.create({
			cliente: req.utenteLoggato.idUtente,
			ristorante: ristoranteId,
			piatti: piatti,
			totale: totale,
			tempoAttesaStimato: tempoAttesaStimato
		});

		res.status(201).json({
			message: "Ordine inviato con successo!",
			ordine: nuovoOrdine
		});

	} catch (error) {
		next(error);
	}
});

// GET informazioni ordini
router.get("/cliente", async (req, res, next) => {
	try {
		const ordini = await schemaOrdine.find({ cliente: req.utenteLoggato.idUtente })
			.populate('ristorante', 'nome indirizzo telefono')
			.sort({ createdAt: -1 }); // Dal più recente al più vecchio

		res.json(ordini);
	} catch (error) {
		next(error);
	}
});


// API RISTORATORE

// GET ordini ricevuti
router.get("/ristorante", soloRistoratori, async (req, res, next) => {
	try {
		const mioRistorante = await schemaRistorante.findOne({ proprietario: req.utenteLoggato.idUtente });
		if (!mioRistorante) {
			return res.status(404).json({ message: "Devi prima configurare il tuo locale!" });
		}

		// trova ordini in corso
		const ordini = await schemaOrdine.find({ ristorante: mioRistorante._id })
			.populate('cliente', 'nome cognome email')
			.sort({ createdAt: -1 });

		res.json(ordini);
	} catch (error) {
		next(error);
	}
});

// PUT aggiorna stato ordine
router.put("/:id/stato", soloRistoratori, async (req, res, next) => {
	try {
		const { stato } = req.body;

		const statiValidi = ['ordinato', 'in preparazione', 'consegnato'];
		if (!statiValidi.includes(stato)) {
			return res.status(400).json({ message: "Stato ordine non valido." });
		}

		const ordineAggiornato = await schemaOrdine.findByIdAndUpdate(
			req.params.id,
			{ $set: { stato: stato } },
			{ returnDocument: 'after', runValidators: true }
		);

		if (!ordineAggiornato) {
			return res.status(404).json({ message: "Ordine non trovato." });
		}

		res.json({ message: `Ordine passato a: ${stato}`, ordine: ordineAggiornato });
	} catch (error) {
		next(error);
	}
});

export default router;