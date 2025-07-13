import { pool } from "../src/03-infrastructure/db/database";
import fs from "fs";
import path from "path";

(async () => {
    try {
        const sqlPath = path.resolve(__dirname, "init.sql");
        const sql = fs.readFileSync(sqlPath, "utf-8");

        console.log("🔧 Ejecutando script SQL desde:", sqlPath);

        await pool.query(sql);

        console.log("✅ Base de datos inicializada correctamente.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error inicializando la base de datos:", error);
        process.exit(1);
    }
})();