const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');  // Middleware to handle file uploads
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());  // To parse incoming JSON requests

// Set up multer for file upload (optional)
const upload = multer({ dest: 'uploads/' });  // Specify the destination for file uploads

// Nodemailer setup using environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Email from .env
    pass: process.env.EMAIL_PASS, // Password from .env
  },
});

// POST endpoint to receive booking details (with or without file)
app.post('/api/submit-booking', upload.single('attachment'), (req, res) => {
  const { name, email, phone, message, serviceType, pickupLocation, dropLocation, vehicleType, date, time } = req.body;

  // Optional: If a file is uploaded, handle it here
  const attachment = req.file ? req.file.path : null;

  // Respond immediately to the client to avoid waiting for email processing
  res.status(200).send('Booking request submitted successfully!');

  // Prepare the email content
  const mailOptions = {
    from: process.env.EMAIL_USER,  // Sender's email address
    to: 'patrisrinu526@gmail.com', // Replace with the owner's email address
    subject: 'New Booking Request',
    text: `
      You have a new booking request:

      Name: ${name}
      Email: ${email}
      Phone: ${phone}
      Service Type: ${serviceType}
      Vehicle Type: ${vehicleType}
      Pickup Location: ${pickupLocation}
      Drop Location: ${dropLocation}
      Date: ${date}
      Time: ${time}
      Message: ${message}

      Attachment: ${attachment ? 'Yes, see attached file.' : 'No attachment.'}
    `,
    attachments: attachment ? [{ path: attachment }] : [],
  };

  // Send email asynchronously (do not block the response)
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent successfully:', info.response);
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
