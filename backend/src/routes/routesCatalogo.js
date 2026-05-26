import express from "express";
import schemaCatalogo from "../models/catalogo.js";

const router = express.Router();

// Restituisce piatti del catalogo
router.get("/", async (req, res) => {
	try {
		const catalogo = await schemaCatalogo.find();
		res.json(catalogo);
	} catch (error) {
		res.status(500).json({status: "error", message: "Errore nel recupero del catalogo", error});
	}
});

export default router;