import {DataSource} from "typeorm";
import {Transaction} from "../database/entities/transaction";
import paypal from '@paypal/checkout-server-sdk';

const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

if (!clientId || !clientSecret) {
    throw new Error('PayPal client ID and secret must be provided as environment variables.');
}

const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
const client = new paypal.core.PayPalHttpClient(environment);

export interface ListTransactionUseCase {
    limit: number;
    page: number;
}

export class TransactionUseCase {
    constructor(private readonly db: DataSource) {
    }

    async createOrder(amount: number, currency: string): Promise<any> {
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
        return order.result;
    }

    async captureOrder(orderId: string): Promise<any> {
        const request = new paypal.orders.OrdersCaptureRequest(orderId);
        const capture = await client.execute(request);

        // Enregistrer les détails de la transaction dans la base de données
        const transactionRepository = this.db.getRepository(Transaction);
        const transaction = new Transaction();
        transaction.orderId = capture.result.id;
        transaction.status = capture.result.status;
        transaction.amount = parseFloat(capture.result.purchase_units[0].payments.captures[0].amount.value);
        transaction.currency = capture.result.purchase_units[0].payments.captures[0].amount.currency_code;
        transaction.donorName = capture.result.payer.name.given_name + ' ' + capture.result.payer.name.surname;
        transaction.donorEmail = capture.result.payer.email_address;
        transaction.createdAt = new Date();

        await transactionRepository.save(transaction);

        return capture.result;
    }

    async getAllTransactions(listTransactions: ListTransactionUseCase): Promise<{
        transactions: Transaction[],
        total: number
    }> {
        const query = this.db.getRepository(Transaction).createQueryBuilder('transaction')
            .skip((listTransactions.page - 1) * listTransactions.limit)
            .take(listTransactions.limit);

        console.log('Executing query:', query.getQuery());

        try {
            const [transactions, total] = await query.getManyAndCount();
            console.log('Query result:', transactions, total);
            return {
                transactions,
                total
            };
        } catch (error) {
            console.error('Error executing query:', error);
            throw error;
        }
    }
}
