import express from "express";
import schemaCatalogo from "../models/catalogo.js";

const router = express.Router();

// GET Restituisce piatti del catalogo
router.get("/", async (req, res) => {
	try {
		const catalogo = await schemaCatalogo.find();
		res.json(catalogo);
	} catch (error) {
		res.status(500).json({status: "error", message: "Errore nel recupero del catalogo", error});
	}
});

// GET Restituisce le categorie di piatti
router.get("/categorie", async (req, res) => {
	try {
		const categorie = await schemaCatalogo.distinct("strCategory");

		const categoriePulite = categorie.filter(cat => cat && cat.trim() !== "");
		res.json(categoriePulite);
	} catch (error) {
		res.status(500).json({ status: "error", message: "Errore nel recupero delle categorie", error });
	}
});

export default router;