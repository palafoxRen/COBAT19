import { Request, Response } from "express";

export const uploadDigital = async (_req: Request, res: Response): Promise<Response> => {
    return res.status(501).json({ success: false, message: 'No implementado' });
};

export const getDigitales = async (_req: Request, res:Response): Promise<Response> => {
    return res.status(501).json({ success: false, message: 'No implementado' });
};

export const descargarDigital = async (_req: Request, res: Response): Promise<Response> => {
    return res.status(501).json({ success: false, message: 'No implementado' });
};