import "dotenv/config";
import fs from "fs";
import { EJSON } from "bson";
import schemaCatalogo from "./src/models/catalogo.js";
import { connectDB } from "./src/config/database.js";

const fileCaricato = fs.readFileSync('./data/meals.json', 'utf-8');

const piattiCatalogo = EJSON.parse(fileCaricato);

async function popolaDatabase() {
    try {
        console.log("Connessione...");
        await connectDB();

        console.log("Eliminazione dati vecchi...");
        await schemaCatalogo.deleteMany({});

        console.log("Inserimento dati...");
        await schemaCatalogo.insertMany(piattiCatalogo);

        console.log(`Successo! Inseriti ${piattiCatalogo.length} piatti nel catalogo.`);
        process.exit(0);
    } catch (error) {
        console.error("Errore:", error);
        process.exit(1);
    }
}

await popolaDatabase();