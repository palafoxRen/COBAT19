import multer from "multer";
import path from 'path';

const storage = multer.memoryStorage();

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const ext = path.extname(file.originalname).toLocaleLowerCase();
    if (ext !== '.pdf') {
        return cb(new Error('Solo se permiten archivos PDF'));
    }
    cb(null, true);
};

export const uploadPDF = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter,
});
