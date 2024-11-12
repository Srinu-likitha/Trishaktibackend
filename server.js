const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');  // Middleware to handle file uploads
const cors = require('cors');
require('dotenv').config();

// Initialize Express app
const app = express();
const port = 5000;

// Middleware
app.use(cors());

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
      
      Attachment: ${attachment ? 'Yes, see attached PDF.' : 'No attachment.'}
    `,
    attachments: attachment
      ? [{ path: attachment }]  // Attach the uploaded file if present
      : [],  // No attachment if file not uploaded
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.status(500).send('Error sending email.');
    }
    res.status(200).send('Booking request submitted successfully!');
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
