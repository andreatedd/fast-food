import mongoose from "mongoose";

const {Schema} = mongoose;

const schemaOrdine = new Schema({
	cliente: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
		index: true
	},
	ristorante: {
		type: Schema.Types.ObjectId,
		ref: "Restaurant",
		required: true,
		index: true
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

// index per calcolo tempistiche ordini
schemaOrdine.index({ ristorante: 1, stato: 1 });

// index per calcolo storico ordini (ordinamento)
schemaOrdine.index({ ristorante: 1, createdAt: -1 });
schemaOrdine.index({ cliente: 1, createdAt: -1 });

export default mongoose.model("Ordine", schemaOrdine);