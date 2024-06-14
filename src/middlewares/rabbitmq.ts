import amqp from 'amqplib';

export async function sendDelayedMessage(queue: string, msg: string, delay: number) {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();

        await channel.assertExchange('delayed_exchange', 'x-delayed-message', {
            arguments: {'x-delayed-type': 'direct'}
        });

        await channel.assertQueue(queue, {
            durable: true
        });

        await channel.bindQueue(queue, 'delayed_exchange', queue);

        const options = {
            headers: {
                'x-delay': delay
            }
        };

        channel.publish('delayed_exchange', queue, Buffer.from(msg), options);

        console.log(`Sent message: "${msg}" with delay of ${delay}ms`);

        setTimeout(() => {
            connection.close();
        }, 500);
    } catch (error) {
        console.error('Error sending delayed message:', error);
    }
}