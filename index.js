require('dotenv').config();
const { ServiceBusClient } = require('@azure/service-bus');
const { MongoClient } = require('mongodb');

// Connection strings from environment variables
const serviceBusConnectionString = process.env.AZURE_SERVICE_BUS_CONNECTION_STRING;
const queueName = process.env.AZURE_SERVICE_BUS_QUEUE_NAME;
const cosmosConnectionString = process.env.COSMOS_DB_CONNECTION_STRING;

// Initialize MongoDB client
const mongoClient = new MongoClient(cosmosConnectionString);

async function storeOrder(orderData) {
    try {
        const database = mongoClient.db('orders');
        const collection = database.collection('orderHistory');
        
        // Add timestamp to the order data
        const orderWithTimestamp = {
            ...orderData,
            processedAt: new Date(),
            status: 'processed'
        };
        
        const result = await collection.insertOne(orderWithTimestamp);
        console.log('Order stored in database with ID:', result.insertedId);
    } catch (error) {
        console.error('Error storing order in database:', error);
        throw error;
    }
}

async function main() {
    try {
        // Connect to Cosmos DB
        await mongoClient.connect();
        console.log('Connected to Cosmos DB');

        // Create a Service Bus client
        const sbClient = new ServiceBusClient(serviceBusConnectionString);
        const receiver = sbClient.createReceiver(queueName);

        console.log('Starting to receive messages...');

        // Start receiving messages
        receiver.subscribe({
            processMessage: async (message) => {
                try {
                    console.log('Received message:', message.body);
                    await storeOrder(message.body);
                    // Complete the message after successful processing
                    await receiver.completeMessage(message);
                } catch (error) {
                    console.error('Error processing message:', error);
                    // Abandon the message if processing fails
                    await receiver.abandonMessage(message);
                }
            },
            processError: async (err) => {
                console.error('Error occurred:', err);
            }
        });

        // Keep the process running
        process.on('SIGINT', async () => {
            await receiver.close();
            await sbClient.close();
            await mongoClient.close();
            process.exit(0);
        });
    } catch (err) {
        console.error('Error in main process:', err);
        await mongoClient.close();
        process.exit(1);
    }
}

main().catch((err) => {
    console.error('Error occurred:', err);
    process.exit(1);
}); 