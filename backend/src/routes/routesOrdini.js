import express from "express";
import schemaOrdine from "../models/ordine.js";
import schemaRistorante from "../models/ristorante.js";
import {
	verificaToken,
	soloRistoratori,
	soloClienti,
	validaNuovoOrdine,
	validaIdMongo,
	validaStatoOrdine
} from "../middlewares/validations.js";
const router = express.Router();

router.use(verificaToken);

// API CLIENTE

// POST nuovo ordine
router.post("/", soloClienti, validaNuovoOrdine, async (req, res, next) => {
	try {
		const { ristoranteId, piatti } = req.body;

		const ristoranteDb = await schemaRistorante.findById(ristoranteId);
		if (!ristoranteDb) {
			return res.status(404).json({ message: "Ristorante non trovato" });
		}

		let totale = 0;
		const piattiVerificati = [];

		for (let item of piatti) {
			// leggiamo prezzi dal db
			const piatto = ristoranteDb.menu.find(p => p.strMeal === item.nome);

			if (!piatto) {
				return res.status(400).json({ message: `Il piatto ${item.nome} non è disponibile.` });
			}

			totale += (piatto.prezzo * item.quantita);

			piattiVerificati.push({
				nome: piatto.strMeal,
				prezzo: piatto.prezzo,
				quantita: item.quantita
			});
		}

		// calcolo tempo attesa
		const ordiniInCoda = await schemaOrdine.countDocuments({
			ristorante: ristoranteId,
			stato: { $in: ['ordinato', 'in preparazione'] }
		});

		const tempoBase = 10;
		const tempoPerOrdineExtra = 2;
		const tempoAttesaStimato = tempoBase + (ordiniInCoda * tempoPerOrdineExtra);

		const nuovoOrdine = await schemaOrdine.create({
			cliente: req.utenteLoggato.idUtente,
			ristorante: ristoranteId,
			piatti: piattiVerificati,
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
			.populate('ristorante', 'nome indirizzo telefono')	// join + select
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

		let filter = { ristorante: mioRistorante._id };

		// filtri se richiesti dal frontend
		if (req.query.filtro === 'attivi') {
			filter.stato = { $in: ['ordinato', 'in preparazione'] };
		} else if (req.query.filtro === 'storico') {
			filter.stato = 'consegnato';
		}

		const ordini = await schemaOrdine.find(filter)
			.populate('cliente', 'nome cognome email')
			.sort({ createdAt: -1 });

		res.json(ordini);
	} catch (error) {
		next(error);
	}
});

// GET statistiche ordini
router.get("/ristorante/statistiche", soloRistoratori, async (req, res, next) => {
	try {
		const mioRistorante = await schemaRistorante.findOne({ proprietario: req.utenteLoggato.idUtente });
		if (!mioRistorante) {
			return res.status(404).json({ message: "Devi prima configurare il tuo locale!" });
		}

		const statistiche = await schemaOrdine.aggregate([
			{ $match: { ristorante: mioRistorante._id, stato: 'consegnato' } },
			{
				$group: {
					_id: null,
					incassoTotale: { $sum: "$totale" },
					ordiniCompletati: { $sum: 1 }	// contatore
				}
			}
		]);
		const risultato = statistiche.length > 0 ? statistiche[0] : { incassoTotale: 0, ordiniCompletati: 0 };
		delete risultato._id;

		res.json(risultato);
	} catch (error) {
		next(error);
	}
});

// PUT aggiorna stato ordine
router.put("/:id/stato", soloRistoratori, validaIdMongo, validaStatoOrdine, async (req, res, next) => {
	try {
		const { stato } = req.body;

		const mioRistorante = await schemaRistorante.findOne({ proprietario: req.utenteLoggato.idUtente });
		if (!mioRistorante) {
			return res.status(404).json({ message: "Devi prima configurare il tuo locale!" });
		}

		const ordineAggiornato = await schemaOrdine.findOneAndUpdate(
			{ _id: req.params.id, ristorante: mioRistorante._id },
			{ $set: {stato}},
			{ returnDocument: 'after', runValidators: true }
		);

		if (!ordineAggiornato) {
			return res.status(404).json({ message: "Ordine non trovato in questo ristorante." });
		}

		res.json({ message: `Ordine passato a: ${stato}`, ordine: ordineAggiornato });
	} catch (error) {
		next(error);
	}
});

export default router;