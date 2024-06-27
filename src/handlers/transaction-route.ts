import express, {Request, Response} from "express";
import {AppDataSource} from "../database/database";
import {TransactionUseCase} from "../domain/transaction-usecase";
import {listTransactionValidation} from "./validator/transaction-validator";


export const transactionRoute = (app: express.Express) => {

    app.post("/transactions/create-paypal-order", async (req: Request, res: Response) => {
        try {
            const transactionUseCase = new TransactionUseCase(AppDataSource);
            const {amount} = req.body;
            const order = await transactionUseCase.createOrder(amount, 'EUR');
            res.json(order);
        } catch (error: any) {
            res.status(500).send(error.message);
        }
    });

    app.post("/transactions/capture-paypal-order", async (req: Request, res: Response) => {
        try {
            const transactionUseCase = new TransactionUseCase(AppDataSource);
            const {orderID} = req.body;
            const captureData = await transactionUseCase.captureOrder(orderID);
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

            const listeventRequest = listTransactionValidate.value;
            const limit = listeventRequest.limit ?? 50;
            const page = listeventRequest.page ?? 1;

            const transactionUseCase = new TransactionUseCase(AppDataSource);
            const listEvent = await transactionUseCase.getAllTransactions({...transactionUseCase, page, limit});
            res.status(200).send(listEvent);
        } catch (error) {
            console.log('Error fetching events:', error);
            res.status(500).send({"error": "Internal error for list event, please retry later"});
        }
    });
}
