// Load environment variables
require('dotenv').config();

// Import required packages
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache'); // Our new caching tool

// Initialize the Express app and Cache
const app = express();
const port = process.env.PORT || 3000;

// Initialize cache: stdTTL is "Time To Live" in seconds. 86400 seconds = 24 hours.
const apiCache = new NodeCache({ stdTTL: 86400 }); 

// Setup Middleware
app.use(cors()); 
app.use(express.json()); 
app.use(express.static('public')); 

// Define the API route
app.get('/api/find-doctors', async (req, res) => {
    
    const specialist = req.query.specialist;
    const location = req.query.location;

    // 1. Create a unique "Key" for this specific search (e.g., "cardiologist-thika")
    const searchKey = `${specialist}-${location}`.toLowerCase();

    // 2. CACHE CHECK: Does the server already have this data saved from a previous search?
    if (apiCache.has(searchKey)) {
        console.log(`⚡ CACHE HIT: Serving saved data for ${searchKey}`);
        
        // Send the saved data instantly without calling RapidAPI
        const savedData = apiCache.get(searchKey);
        return res.json(savedData); 
    }

    // 3. CACHE MISS: We don't have it. We must ask RapidAPI.
    console.log(`🌐 CACHE MISS: Fetching new data from RapidAPI for ${searchKey}`);
    try {
        const options = {
            method: 'GET',
            url: 'https://local-business-data.p.rapidapi.com/search',
            params: { 
                query: `${specialist} in ${location}`, 
                limit: '10' 
            },
            headers: {
                'X-RapidAPI-Key': process.env.API_KEY,
                'X-RapidAPI-Host': 'local-business-data.p.rapidapi.com'
            }
        };

        const response = await axios.request(options);
        
        // 4. Save the new data into our cache for next time
        apiCache.set(searchKey, response.data);
        
        // 5. Send the data to the frontend
        res.json(response.data); 

    } catch (error) {
        console.error("API Error encountered:", error.message);
        res.status(500).json({ error: "Failed to fetch doctors. Please try again later." });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`AfyaBora Tracker backend is running on http://localhost:${port}`);
});