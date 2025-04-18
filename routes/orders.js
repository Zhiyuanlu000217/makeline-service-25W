const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { getDatabase } = require('../db');

// Get all orders
router.get('/', async (req, res) => {
    try {
        const database = await getDatabase();
        const collection = database.collection('orderHistory');
        
        const orders = await collection.find({}).toArray();
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Edit an order
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const database = await getDatabase();
        const collection = database.collection('orderHistory');
        
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ message: 'Order updated successfully' });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ error: 'Failed to update order' });
    }
});

// Delete an order
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const database = await getDatabase();
        const collection = database.collection('orderHistory');
        
        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ error: 'Failed to delete order' });
    }
});

module.exports = router; 