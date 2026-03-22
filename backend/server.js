require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Service = require('./models/Service');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('✅ Connected to MongoDB');
}).catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('⚠️ Running in fallback mode (Database not connected)');
});

// Routes
// 1. Get all services
app.get('/api/services', async (req, res) => {
    try {
        const services = await Service.find().sort({ createdAt: -1 });
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching services', error: error.message });
    }
});

// 2. Get single service
app.get('/api/services/:id', async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) return res.status(404).json({ message: 'Service not found' });
        res.status(200).json(service);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching service', error: error.message });
    }
});

// 3. Add new service
app.post('/api/services', async (req, res) => {
    try {
        const newService = new Service(req.body);
        const savedService = await newService.save();
        res.status(201).json(savedService);
    } catch (error) {
        res.status(400).json({ message: 'Error adding service', error: error.message });
    }
});

// 4. Update service
app.put('/api/services/:id', async (req, res) => {
    try {
        const updatedService = await Service.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedService) return res.status(404).json({ message: 'Service not found' });
        res.status(200).json(updatedService);
    } catch (error) {
        res.status(400).json({ message: 'Error updating service', error: error.message });
    }
});

// 5. Delete service
app.delete('/api/services/:id', async (req, res) => {
    try {
        const deletedService = await Service.findByIdAndDelete(req.params.id);
        if (!deletedService) return res.status(404).json({ message: 'Service not found' });
        res.status(200).json({ message: 'Service deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting service', error: error.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('Endpoints ready for Frontend connection.');
});
