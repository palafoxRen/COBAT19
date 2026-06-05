import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/status', (req: Request, res: Response) => {
    res.json({ status: "online", message: "Servidor el COBAT 19 operando correctamente"});
});

app.listen(PORT, () => {
    console.log(` [server]: Servidor corriendo en http://localhost:${PORT}`);
});