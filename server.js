// Load environment variables from our .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

// Setup Middleware
app.use(cors()); 
app.use(express.json()); 
app.use(express.static('public')); 

// This define the API route that our frontend will call
app.get('/api/find-doctors', async (req, res) => {
    
    // Grab the 'specialist' and 'location' from the URL the user searched for
    const specialist = req.query.specialist;
    const location = req.query.location;

    try {
        // Prepare the exact request configuration needed by the RapidAPI server
        const options = {
            method: 'GET',
            url: 'https://local-business-data.p.rapidapi.com/search',
            params: { 
                query: specialist + ' in ' + location, 
                limit: '10' 
            },
            headers: {
                'X-RapidAPI-Key': process.env.API_KEY,
                'X-RapidAPI-Host': 'local-business-data.p.rapidapi.com'
            }
        };

        // Make the actual request to the external RapidAPI server using Axios
        const response = await axios.request(options);
        
        // If successful, send the data straight back to our frontend application
        res.json(response.data); 

    } catch (error) {
        console.error("API Error encountered:", error.message);
        
        // Error message pops up on the user's screen 
        res.status(500).json({ error: "Failed to fetch doctors. Please try again later." });
    }
});

// Start the server to listen for requests
app.listen(port, () => {
    console.log(`AfyaBora Tracker backend is running on http://localhost:${port}`);
});