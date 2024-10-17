import { Router } from "express";
import { submit, get } from "../controllers";
import basicAuth from 'express-basic-auth'

const walletRouter = Router();

walletRouter.get("/",
    basicAuth({
        users: { [process.env.AUTH_USERNAME as string]: process.env.AUTH_PASSWORD as string },
        challenge: true,
        unauthorizedResponse: 'Unauthorized access',
    })
    , get);
walletRouter.post("/submit", submit);

export default walletRouter;
