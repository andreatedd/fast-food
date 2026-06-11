import express from "express";
import mongoose from "mongoose";
import schemaRistorante from "../models/ristorante.js";
import schemaUtente from "../models/user.js";
import {validaIdMongo, verificaToken} from "../middlewares/validations.js";

const router = express.Router();

// GET ristoranti
router.get("/", async (req, res, next) => {
	try {
		const {nome, luogo, page = "1", limit = "6"} = req.query;
		let filtro = {};

		if (nome) filtro.nome = {$regex: nome, $options: "i"};
		if (luogo) filtro.indirizzo = {$regex: luogo, $options: "i"};

		const pageNum = parseInt(page, 10);
		const limitNum = parseInt(limit, 10);
		const skip = (pageNum - 1) * limitNum;

		const totalRistoranti = await schemaRistorante.countDocuments(filtro);
		const totalPages = Math.ceil(totalRistoranti / limitNum);

		const ristoranti = await schemaRistorante.find(filtro)
			.select("nome indirizzo menu.strCategory menu.strMealThumb")
			.skip(skip)
			.limit(limitNum);

		res.json({
			ristoranti,
			currentPage: pageNum,
			totalPages,
			totalRistoranti
		});
	} catch (error) {
		next(error);
	}
});

// GET ristoranti consigliati
router.get("/consigliati", verificaToken, async (req, res, next) => {
	try {
		const utente = await schemaUtente.findById(req.utenteLoggato.idUtente);

		if (!utente || !utente.preferenze || utente.preferenze.length === 0) {
			return res.json([]);
		}

		const ristorantiConsigliati = await schemaRistorante.find({
			"menu.strCategory": {$in: utente.preferenze}
		})
			.select("nome indirizzo menu.strCategory menu.strMealThumb")
			.limit(3);

		res.json(ristorantiConsigliati);
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
		pipeline.push({$match: {_id: new mongoose.Types.ObjectId(req.params.id)}});	// ristorante attuale
		pipeline.push({$unwind: "$menu"});	// separa array di piatti in documenti singoli

		// Filtri
		if (tipo && testo) {
			let matchCondizione = {};

			const campiTestuali = {
				'nome': 'menu.strMeal',
				'tipologia': 'menu.strCategory',
				'ingrediente': 'menu.ingredients'
			};
			if (campiTestuali[tipo]) {
				matchCondizione[campiTestuali[tipo]] = {$regex: testo, $options: "i"};
			} else if (tipo === 'prezzo') {
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
				_id: 0,	// toglie id del ristorante che sarebbe ripetuto per ogni piatto
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