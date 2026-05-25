import mongoose from "mongoose";

export async function connectDB() {
	mongoose.set("strictQuery", true);

	mongoose.connection.on("connected", () => console.log("Mongoose connesso ad Atlas"));
	mongoose.connection.on("disconnected", () => console.log("Mongoose disconnesso da Atlas"));
	mongoose.connection.on("error", (err) => console.error("Mongoose errore:", err));

	try {
		await mongoose.connect(process.env.MONGODB_URI);
	} catch (error) {
		console.error("Errore di connessione iniziale:", error);
		process.exit(1);
	}

	// Chiusura pulita
	process.on("SIGINT", async () => {
		await mongoose.connection.close();
		process.exit(0);
	});
}