const { MongoClient } = require('mongodb');

const cosmosConnectionString = process.env.COSMOS_DB_CONNECTION_STRING;
let mongoClient = null;

async function connectToDatabase() {
    if (!mongoClient) {
        mongoClient = new MongoClient(cosmosConnectionString);
        await mongoClient.connect();
        console.log('Connected to Cosmos DB');
    }
    return mongoClient;
}

async function getDatabase() {
    const client = await connectToDatabase();
    return client.db('orders');
}

async function closeDatabase() {
    if (mongoClient) {
        await mongoClient.close();
        mongoClient = null;
        console.log('Closed Cosmos DB connection');
    }
}

module.exports = {
    connectToDatabase,
    getDatabase,
    closeDatabase
}; 