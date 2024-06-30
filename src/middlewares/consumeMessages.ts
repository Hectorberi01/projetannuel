import amqp from 'amqplib';
import {MessageUseCase} from "../domain/message-usecase";
import {AppDataSource} from "../database/database";
import {NewsletterUsecase} from "../domain/newsletter-usecase";

async function consumeMessages() {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();
        const newsletterUseCase = new NewsletterUsecase(AppDataSource);

        const queue = 'email_queue';

        await channel.assertQueue(queue, {
            durable: true
        });

        console.log(`Waiting for messages in ${queue}. To exit press CTRL+C`);

        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                const content = msg.content.toString();
                console.log(`Received message: ${content}`);

                const mailOptions = JSON.parse(content);
                const messageUseCase = new MessageUseCase(AppDataSource);

                try {
                    await messageUseCase.sendEmail(mailOptions);
                    channel.ack(msg);
                    await newsletterUseCase.sleep(1500);
                } catch (error) {
                    console.error('Error processing message:', error);
                    channel.nack(msg);
                }
            }
        });

    } catch (error) {
        console.error('Error consuming messages:', error);
    }
}

consumeMessages();

