import express from "express";
import schemaRistorante from "../models/ristorante.js";

const router = express.Router();

// GET profilo e menù
router.get("/me", async (req, res) => {
    try {
        // Simuliamo l'utente loggato prendendo il primo ristorante nel DB
        let ristorante = await schemaRistorante.findOne();

        // Ristorante fittizio
        if (!ristorante) {
            ristorante = await schemaRistorante.create({
                nome: "Il Mio FastFood",
                partitaIva: "12345678901",
                telefono: "02 1234567",
                email: "admin@fastfood.it",
                indirizzo: "Via Roma 1, Milano",
                menu: []
            });
        }
		res.json(ristorante);
    } catch (error) {
        res.status(500).json({ status: "error", message: "Errore del server", error });
    }
});

// PUT aggiorna informazioni ristorante (es. nome, indirizzo, telefono, email)
router.put("/me", async (req, res) => {
    try {
        const ristorante = await schemaRistorante.findOne();

        const updated = await schemaRistorante.findByIdAndUpdate(
            ristorante._id,
            { $set: req.body }, // req.body conterrà i dati inviati dal form HTML
            { new: true, runValidators: true } // runValidators assicura che le regole dello Schema vengano rispettate
        );

        res.json(updated);
    } catch (error) {
        res.status(400).json({ status: "fail", message: "Errore nell'aggiornamento", error });
    }
});

// 3. PUT /api/ristoranti/me/menu -> Salva l'intero menù
router.put("/me/menu", async (req, res) => {
    try {
        const ristorante = await schemaRistorante.findOne();

        // req.body conterrà l'array completo dei piatti (menuRistorante) inviato dal frontend
        ristorante.menu = req.body;

        await ristorante.save();
        res.json(ristorante.menu);
    } catch (error) {
        res.status(400).json({ status: "fail", message: "Errore nel salvataggio del menù", error });
    }
});

export default router;