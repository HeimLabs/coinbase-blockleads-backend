import { NextFunction, Response, Request } from "express";
import AppError from "../utils/appError";
import { wallet } from "../services/coinbase.services";
import { SubmitRequest } from "types/api.types";
import { Coinbase } from "@coinbase/coinbase-sdk";
import { UserModel } from "../models/User.model";
import { Parser } from 'json2csv';

export async function submit(req: SubmitRequest, res: Response, next: NextFunction) {
    const session = await UserModel.startSession();
    try {
        session.startTransaction();

        const { name, email, address } = req.body;

        if (!name || !email || !address)
            throw new AppError(400, "error", "Invalid request");

        await UserModel.create([{ name, email, address }], { session });

        const asset = Coinbase.assets.Usdc;
        const amount = Number(process.env.REWARD_AMOUNT);
        const balance = await wallet().getBalance(asset);
        if (balance.lessThan(amount))
            throw new AppError(400, "error", "Insufficient balance");

        const transfer = await (await wallet().createTransfer({
            amount,
            assetId: asset,
            destination: address,
            gasless: true
        })).wait({ timeoutSeconds: 120 });

        await session.commitTransaction();
        res.status(200).json({ transactionLink: transfer.getTransactionLink() });
    } catch (error) {
        await session.abortTransaction();
        console.error("[controllers/form/submit] Failed to submit: ", error);
        next(error);
    } finally {
        await session.endSession();
    }
}

export async function get(req: Request, res: Response, next: NextFunction) {
    try {
        const users = await UserModel.find();

        const fields = ['_id', 'name', 'email', 'address'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(users);

        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', 'attachment; filename="users.csv"');

        return res.status(200).send(csv);
    } catch (error) {
        console.error("[controllers/form/get] Failed to get: ", error);
        next(error);
    }
}
