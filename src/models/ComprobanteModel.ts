import readSQL from "../helpers/readSQL";
import sql from "mssql";
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import sanitizeFilename from "../helpers/sanitizeFilename";
import RecepcionModel from "./RecepcionModel";
import { poolAK } from "../pool";

class ComprobanteModel {
    static async create(recepcion: number, file: Express.Multer.File): Promise<boolean> {
        
        try {
            const recepcionExists = await RecepcionModel.exists(recepcion);
            if (!recepcionExists) {
                throw new Error(`No existe la recepcion con id ${recepcion}`);
            }
            
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            const BILLS_FOLDER = path.join(__dirname, '../../facturas-recepcion');
    
            if (!fs.existsSync(BILLS_FOLDER)) fs.mkdirSync(BILLS_FOLDER, { recursive: true });
    
            const originalFileName = file.originalname;
            const sanitizedFileName = sanitizeFilename(originalFileName);
            const filePath = path.join(BILLS_FOLDER, sanitizedFileName);
            const fileURL = '/static/' + sanitizedFileName;

            fs.writeFileSync(filePath, new Uint8Array(file.buffer));

            const transaction = new sql.Transaction(poolAK);
            await transaction.begin()
            await transaction
                .request()
                .input("url", sql.VarChar, fileURL)
                .input("recepcion", sql.Int, recepcion)
                .query(readSQL("comprobante/create"));

            await transaction.commit();
            return true;


        } catch (error) {
            throw new Error(`Error al crear el comprobante: ${error}`);  
        }
    }
}

export default ComprobanteModel;