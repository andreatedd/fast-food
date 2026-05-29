import mongoose from "mongoose";

const {Schema} = mongoose;

const schemaUtente = new Schema({
	nome: {type: String, required: true, trim: true},
	cognome: {type: String, required: true, trim: true},
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		trim: true
	},
	password: {type: String, required: true},
	ruolo: {
		type: String,
		enum: ['ristoratore', 'cliente'],
		required: true
	},
	metodoPagamento: {
		type: String,
		enum: ['carta_di_credito', 'carta_prepagata', 'alla_consegna', 'nessuno'],
		default: 'nessuno'
	},
	preferenze: [{type: String}]
}, {timestamps: true});

export default mongoose.model("User", schemaUtente);