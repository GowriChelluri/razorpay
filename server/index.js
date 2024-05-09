const express = require("express");
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors'); // Import the cors package
const Razorpay = require('razorpay'); // Import Razorpay package

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: 'gowrichelluri08@gmail.com', // Update with your email address
    pass: 'zzkrztfzrbwsjdru' // Update with your email password
  },
});

// Enable CORS for all routes
app.use(cors());

// Initialize Razorpay with your API key ID and secret
const razorpay = new Razorpay({
  key_id: 'rzp_test_fS1cbWzLChQVyN',
  key_secret: 'sBfY94ltk5S1pnQJB47QtmSP',
});

app.post('/getData', async (req, res) => {
  try {
    const { email, name } = req.body;

    // Create Razorpay order
    const orderOptions = {
      amount: 1000, // Amount in paisa (Example: for ₹10, amount will be 1000)
      currency: 'INR',
      receipt: uuidv4(),
      payment_capture: 1 // Auto capture payment
    };

    const order = await razorpay.orders.create(orderOptions);

    // Construct payment link with order ID
    const paymentLink = `https://razorpay.com/payment-link/plink_${order.id}/test`;

    const mailOptions = {
      from: 'gowrichelluri08@gmail.com',
      to: email,
      subject: 'Payment Link for Homaid Services',
      html: `
        <div>
          <h1>Hi ${name},</h1>
          <p>Click the following link to proceed with your payment:</p>
          <a href="${paymentLink}">Proceed to Payment</a>
          <p>If you have any questions, feel free to contact us.</p>
          <p>Thank you for choosing Homaid Services!</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Payment link sent successfully.', paymentLink });
  } catch (error) {
    console.error('Error sending payment email:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
