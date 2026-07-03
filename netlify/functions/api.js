const express = require('express');
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const apiRoutes = require('../../routes/api');

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB Atlas Connected (Serverless)'))
.catch(err => console.log('MongoDB Connection Error: ', err));

// Route API endpoints
app.use('/api', apiRoutes);

module.exports.handler = serverless(app);
