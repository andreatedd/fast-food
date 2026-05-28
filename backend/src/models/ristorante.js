import mongoose from "mongoose";
const { Schema } = mongoose;

// Schema piatto del menù
const schemaPiatto = new Schema({
    idMeal: { type: String }, // c'è solo se piatto è nel catalogo
    strMeal: { type: String, required: true, index: true },
    strCategory: { type: String, required: true, index: true },
    prezzo: { type: Number, required: true, min: 0 },
    ingredients: [{ type: String }],
    strMealThumb: { type: String },
    strInstructions: { type: String, required: false }
});

// Schema info ristorante
const schemaRistorante = new Schema({
    nome: { type: String, required: true, trim: true, index: true },
    partitaIva: { type: String, required: true, unique: true },
    telefono: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    indirizzo: { type: String, required: true, index: true },
    menu: [schemaPiatto]
}, { timestamps: true });

export default mongoose.model("Restaurant", schemaRistorante);