import express from "express";
import mongoose from "mongoose";
import schemaRistorante from "../models/ristorante.js";
import { validaIdMongo } from "../middlewares/validations.js";

const router = express.Router();

// GET ristoranti
router.get("/", async (req, res, next) => {
	try {
		const {nome, luogo} = req.query;
		let query = {};

		if (nome) query.nome = {$regex: nome, $options: "i"};
		if (luogo) query.indirizzo = {$regex: luogo, $options: "i"};

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
router.get("/:id", validaIdMongo, async (req, res, next) => {
	try {
		const ristorante = await schemaRistorante.findById(req.params.id);
		if (!ristorante) {
			return res.status(404).json({message: "Ristorante non trovato"});
		}
		res.json(ristorante);
	} catch (error) {
		next(error);
	}
});

// GET piatti di un ristorante con filtri dinamici
router.get("/:id/piatti", validaIdMongo, async (req, res, next) => {
	try {
		const {tipo, testo} = req.query;

		let pipeline = [];
		pipeline.push({$match: {_id: new mongoose.Types.ObjectId(req.params.id)}});
		pipeline.push({$unwind: "$menu"});

		// Filtri
		if (tipo && testo) {
			let matchCondizione = {};

			const mappaCampiTestuali = {
				'nome': 'menu.strMeal',
				'tipologia': 'menu.strCategory',
				'ingrediente': 'menu.ingredients',
			};

			// Filtri
			if (mappaCampiTestuali[tipo]) {
				matchCondizione[mappaCampiTestuali[tipo]] = {$regex: testo, $options: "i"};
			}
			else if (tipo === 'prezzo') {
				const prezzoMax = parseFloat(testo);
				if (!isNaN(prezzoMax)) {
					matchCondizione["menu.prezzo"] = {$lte: prezzoMax};
				}
			}

			if (Object.keys(matchCondizione).length > 0) {
				pipeline.push({$match: matchCondizione});
			}
		}

		pipeline.push({
			$project: {
				_id: 0,
				idMeal: "$menu.idMeal",
				strMeal: "$menu.strMeal",
				strCategory: "$menu.strCategory",
				prezzo: "$menu.prezzo",
				ingredients: "$menu.ingredients",
				strMealThumb: "$menu.strMealThumb",
				strInstructions: "$menu.strInstructions"
			}
		});

		const piattiFiltrati = await schemaRistorante.aggregate(pipeline);
		res.json(piattiFiltrati);

	} catch (error) {
		next(error);
	}
});

export default router;