import { Request } from "express"

export type NODE_ENV = "development" | "production";

export type Status = "idle" | "loading" | "success" | "fail" | "error";

export type SubmitBody = {
    name: string,
    email: string,
    chainId: number,
    address: string
};

export type SubmitRequest = Request<{}, {}, SubmitBody>;