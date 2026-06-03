import mongoose from "mongoose";

const {Schema} = mongoose;

const schemaOrdine = new Schema({
	cliente: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true
	},
	ristorante: {
		type: Schema.Types.ObjectId,
		ref: "Restaurant",
		required: true
	},
	piatti: [{
		nome: {type: String, required: true},
		prezzo: {type: Number, required: true},
		quantita: {type: Number, required: true, min: 1, default: 1}
	}],
	totale: {
		type: Number,
		required: true,
		min: 0
	},
	stato: {
		type: String,
		enum: ['ordinato', 'in preparazione', 'consegnato'],
		default: 'ordinato'
	},
	tempoAttesaStimato: {
		type: Number,
		required: true
	}
}, {timestamps: true});

export default mongoose.model("Ordine", schemaOrdine);