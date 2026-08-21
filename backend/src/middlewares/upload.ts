import multer from "multer";
import path from 'path';

// Usamos memoryStorage para que el archivo quede en buffer (req.file.buffer)
// y poder escribirlo manualmente con writeFileSync. Así controlamos el nombre
// y la ruta destino sin depender del comportamiento por defecto de multer.
const storage = multer.memoryStorage();

const pdfFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const ext = path.extname(file.originalname).toLocaleLowerCase();
    if (ext !== '.pdf') {
        return cb(new Error('Solo se permiten archivos PDF'));
    }
    cb(null, true);
};

export const uploadPDF = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: pdfFilter,
});

const imageFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLocaleLowerCase();
    if (!allowed.includes(ext)) {
        return cb(new Error('Solo se permiten imágenes (JPG, PNG, WebP)'));
    }
    cb(null, true);
};

export const uploadImage = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: imageFilter,
});
