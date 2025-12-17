const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

// IMPORTANT: REPLACE WITH YOUR ACTUAL PAYSTACK SECRET KEY
const PAYSTACK_SECRET_KEY = 'sk_test_yyyyyyyyyyyyyyyyyyyyyy'; 
const PAYSTACK_VERIFY_URL = 'https://api.paystack.co/transaction/verify/';

app.use(express.json()); // To parse JSON bodies
app.use(express.static('public')); // Assuming index.html is in a 'public' folder

// 1. Endpoint to verify the payment
app.post('/verify-payment', async (req, res) => {
    const { reference } = req.body;

    if (!reference) {
        return res.status(400).json({ error: 'Missing transaction reference' });
    }

    try {
        // 2. Make a secure API call to Paystack using the SECRET KEY
        const response = await axios.get(
            `${PAYSTACK_VERIFY_URL}${reference}`,
            {
                headers: {
                    'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`
                }
            }
        );

        const verificationData = response.data;
        
        // 3. Check the status and respond to the frontend
        if (verificationData.data.status === 'success') {
            console.log('--- Payment SUCCESS ---');
            console.log('Product:', verificationData.data.metadata.custom_fields[0].value);
            console.log('Amount (Kobo/Pesewas):', verificationData.data.amount);

            // TODO: **CRITICAL STEP:** // - Update your database (e.g., mark user as 'subscribed' or 'book_purchased').
            // - Send confirmation emails.
            
            return res.json({ 
                success: true, 
                message: 'Payment verified successfully. Item fulfilled!',
                details: verificationData.data
            });
        } else {
            // Payment was started but did not complete successfully
            return res.status(400).json({ 
                success: false, 
                message: 'Payment verification failed. Status is not "success".' 
            });
        }
    } catch (error) {
        console.error('Paystack Verification Error:', error.message);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error during verification.' 
        });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});