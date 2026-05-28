import mongoose from "mongoose";
const { Schema } = mongoose;

const schemaCatalogo = new Schema({
    idMeal: { type: String, required: true, unique: true },
    strMeal: { type: String, required: true },
    strCategory: { type: String },
    strMealThumb: { type: String },
    ingredients: [{ type: String }],
    strInstructions: { type: String, required: false }
});

export default mongoose.model("Catalogo", schemaCatalogo);