import mongoose from "mongoose";
const { Schema } = mongoose;

// Schema piatto del menù
const schemaPiatto = new Schema({
    idMeal: { type: String }, // Opzionale, c'è solo se il piatto arriva dal catalogo
    strMeal: { type: String, required: true },
    strCategory: { type: String, required: true },
    prezzo: { type: Number, required: true, min: 0 }, // ECCO IL PREZZO OBBLIGATORIO!
    ingredients: [{ type: String }],
    strMealThumb: { type: String }
});

// Schema info ristorante
const schemaRistorante = new Schema({
    nome: { type: String, required: true, trim: true },
    partitaIva: { type: String, required: true, unique: true },
    telefono: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    indirizzo: { type: String, required: true },
    menu: [schemaPiatto]
}, { timestamps: true });

export default mongoose.model("Restaurant", schemaRistorante);