import express from "express";
import schemaRistorante from "../models/ristorante.js";
import {
    verificaToken,
    soloRistoratori,
    validaDatiRistorante,
    validaMenuRistorante
} from "../middlewares/validations.js";
const router = express.Router();

router.use(verificaToken, soloRistoratori);

// GET profilo e menù
router.get("/me", async (req, res, next) => {
	try {
		let ristorante = await schemaRistorante.findOne({proprietario: req.utenteLoggato.idUtente});
		if (!ristorante) {
			return res.json({
				nuovo: true,
				message: "Devi ancora creare il profilo del tuo ristorante."
			});
		}
		res.json(ristorante);
	} catch (error) {
		next(error);
	}
});

// PUT aggiorna o salva informazioni ristorante
router.put("/me", validaDatiRistorante, async (req, res, next) => {
	try {
		const datiDaSalvare = {...req.body, proprietario: req.utenteLoggato.idUtente};

		const updated = await schemaRistorante.findOneAndUpdate(
			{proprietario: req.utenteLoggato.idUtente},
			{$set: datiDaSalvare},
			{
				returnDocument: 'after',
				runValidators: true,
				upsert: true
			}
		);

		res.json(updated);
	} catch (error) {
		next(error);
	}
});

// PUT salva il menù
router.put("/me/menu", validaMenuRistorante, async (req, res, next) => {
	try {
		const updated = await schemaRistorante.findOneAndUpdate(
			{proprietario: req.utenteLoggato.idUtente},
			{$set: {menu: req.body}},
			{returnDocument: 'after', runValidators: true}
		);
		if (!updated) {
			return res.status(404).json({message: "Crea prima il profilo generale del ristorante!"});
		}

		res.json(updated.menu);
	} catch (error) {
		next(error);
	}
});

export default router;