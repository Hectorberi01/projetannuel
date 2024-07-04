import express, {Request, Response} from "express";
import {AppDataSource} from "../database/database";
import {TransactionUseCase} from "../domain/transaction-usecase";
import {listTransactionValidation} from "./validator/transaction-validator";


export const transactionRoute = (app: express.Express) => {

    app.post("/transactions/create-paypal-order", async (req: Request, res: Response) => {
        try {

            const transactionUseCase = new TransactionUseCase(AppDataSource);
            const { amount, type } = req.body;
            const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            // @ts-ignore
            const order = await transactionUseCase.createOrder(amount, 'EUR', type, ipAddress);
            res.json(order);
        } catch (error: any) {
            res.status(500).send(error.message);
        }
    });

    app.post("/transactions/capture-paypal-order", async (req: Request, res: Response) => {
        try {
            const transactionUseCase = new TransactionUseCase(AppDataSource);
            const { orderID, cotisationId } = req.body;
            const captureData = await transactionUseCase.captureOrder(orderID, cotisationId);
            res.json(captureData);
        } catch (error: any) {
            res.status(500).send(error.message);
        }
    });

    app.get("/transactions", async (req: Request, res: Response) => {
        try {
            const listTransactionValidate = listTransactionValidation.validate(req.query);
            if (listTransactionValidate.error) {
                res.status(400).send({
                    error: "Invalid query parameters",
                    details: listTransactionValidate.error.details
                });
                return;
            }

            const listTransactionsRequest = listTransactionValidate.value;
            const limit = listTransactionsRequest.limit ?? 5;
            const page = listTransactionsRequest.page ?? 1;

            const transactionUseCase = new TransactionUseCase(AppDataSource);
            const listEvent = await transactionUseCase.getAllTransactions({...listTransactionsRequest, page, limit});
            res.status(200).send(listEvent);
        } catch (error) {
            console.log('Error fetching events:', error);
            res.status(500).send({"error": "Internal error for list event, please retry later"});
        }
    });
}
