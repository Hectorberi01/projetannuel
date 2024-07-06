import {DataSource} from "typeorm";
import {Transaction} from "../database/entities/transaction";
import paypal from '@paypal/checkout-server-sdk';
import {TransactionType} from "../Enumerators/TransactionType";
import {CotisationUseCase} from "./cotisation-usecase";
import {CotisationStatus} from "../Enumerators/CotisationStatus";

const clientId = "AZM-xhZvk9RPx-koGNixiPRRv_BdF3aTvmrw9hxorpC7ewPymOgJJel1hwh4bDTujpCRT__lro3P6KtD";
const clientSecret = "EFYmFHEEHacgKj3O0QGMrWZOAJO_9Qauww5rOKNlXzRYT4Px4TDfyVy5ZBJYN7osqzY7cFqxKqXWVE6C";

if (!clientId || !clientSecret) {
    throw new Error('PayPal client ID and secret must be provided as environment variables.');
}

const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
const client = new paypal.core.PayPalHttpClient(environment);

export interface ListTransactionsRequest {
    page: number;
    limit: number;
    status?: string;
    donorEmail?: string;
    dateFrom?: string;
    dateTo?: string;
}

export class TransactionUseCase {
    constructor(private readonly db: DataSource) {
    }

    async createOrder(amount: number, currency: string, type: TransactionType, ipAddress?: string): Promise<any> {
        const request = new paypal.orders.OrdersCreateRequest();
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: currency,
                    value: amount.toString()
                }
            }]
        });

        const order = await client.execute(request);
        await this.createTransaction(amount, currency, type, order.result.id, ipAddress);
        return order.result;
    }

    async captureOrder(orderId: string, cotisationId?: number): Promise<any> {
        const request = new paypal.orders.OrdersCaptureRequest(orderId);
        const capture = await client.execute(request);
        const transactionRepository = this.db.getRepository(Transaction);

        const transaction = await this.getTransactionByOrderId(orderId);

        if (!transaction) {
            throw new Error("Transaction not found");
        }

        transaction.status = capture.result.status;
        transaction.donorName = capture.result.payer.name.given_name + ' ' + capture.result.payer.name.surname;
        transaction.donorEmail = capture.result.payer.email_address;
        await transactionRepository.save(transaction);

        if (transaction.type === TransactionType.COTISATION && cotisationId) {
            const cotisationUseCase = new CotisationUseCase(this.db);
            await cotisationUseCase.updateCotisationStatus(cotisationId, CotisationStatus.PAID);
        }

        return capture.result;
    }

    async getAllTransactions(listTransactions: ListTransactionsRequest): Promise<{ transactions: Transaction[], total: number }> {
        const query = this.db.getRepository(Transaction).createQueryBuilder('transaction')
            .skip((listTransactions.page - 1) * listTransactions.limit)
            .take(listTransactions.limit);

        if (listTransactions.status) {
            query.andWhere('transaction.status = :status', { status: listTransactions.status });
        }

        if (listTransactions.donorEmail) {
            query.andWhere('transaction.donorEmail = :donorEmail', { donorEmail: listTransactions.donorEmail });
        }

        if (listTransactions.dateFrom) {
            query.andWhere('transaction.createdAt >= :dateFrom', { dateFrom: listTransactions.dateFrom });
        }

        if (listTransactions.dateTo) {
            query.andWhere('transaction.createdAt <= :dateTo', { dateTo: listTransactions.dateTo });
        }

        try {
            const [transactions, total] = await query.getManyAndCount();
            return {
                transactions,
                total
            };
        } catch (error) {
            console.error('Error executing query:', error);
            throw error;
        }
    }

    async createTransaction(amount: number, currency: string, type: TransactionType, orderId: string, ipAddress?: string): Promise<Transaction> {
        try {
            const transactionRepository = this.db.getRepository(Transaction);

            const transaction = new Transaction();
            transaction.orderId = orderId;
            transaction.status = "CREATED";
            transaction.amount = amount;
            transaction.currency = currency;
            transaction.type = type;
            transaction.donorName = "Pending";
            transaction.donorEmail = "Pending";
            transaction.createdAt = new Date();
            if (ipAddress) transaction.ipAddress = ipAddress;

            return await transactionRepository.save(transaction);
        } catch (error: any) {
            throw new Error("failed to create transaction");
        }
    }

    async getTransactionByOrderId(orderId: string): Promise<Transaction> {
        try {
            const repo = this.db.getRepository(Transaction);
            const result = await repo.findOne({
                where: {orderId: orderId}
            })

            if (!result) {
                throw new Error(`Transaction with order id : ${orderId} not found`);
            }
            return result;
        } catch (error: any) {
            throw new Error("failed to get transaction by orderId : " + orderId);
        }
    }
}
