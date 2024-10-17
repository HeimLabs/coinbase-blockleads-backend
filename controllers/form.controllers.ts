import { NextFunction, Response, Request } from "express";
import AppError from "../utils/appError";
import { wallet } from "../services/coinbase.services";
import { SubmitRequest } from "types/api.types";
import { Coinbase } from "@coinbase/coinbase-sdk";
import { isAddress } from "viem";
import { UserModel } from "../models/User.model";
import { Parser } from 'json2csv'; 

export async function submit(req: SubmitRequest, res: Response, next: NextFunction) {
    try {
        const { name, email, address } = req.body;

        if (!name || !email || !address || !isAddress(address))
            throw new AppError(400, "error", "Invalid request");

        await UserModel.create({ name, email, address });

        const asset = Coinbase.assets.Usdc;
        const amount = Number(process.env.REWARD_AMOUNT);
        const balance = await wallet().getBalance(asset);
        if (balance.lessThan(amount))
            throw new AppError(400, "error", "Insufficient balance");

        await wallet().createTransfer({
            amount,
            assetId: asset,
            destination: address,
            gasless: true
        });

        return res.status(200).json("Success");
    } catch (error) {
        console.error("[controllers/form/submit] Failed to submit: ", error);
        next(error);
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
