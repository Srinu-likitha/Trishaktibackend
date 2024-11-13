require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

// Initialize express app
const app = express();
app.use(cors());  // Allow CORS for all domains
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
}).fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'drivingLicense', maxCount: 1 },
]);

// Set up nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// POST route for handling the form submission
app.post('/register', upload, (req, res) => {
  const { name, email, phone, vehicleType, licenseNumber, address, experience, dob } = req.body;
  
  // File paths from multer
  const profilePicturePath = req.files['profilePicture'] ? req.files['profilePicture'][0].path : null;
  const drivingLicensePath = req.files['drivingLicense'] ? req.files['drivingLicense'][0].path : null;

  // Simple validation
  if (!name || !email || !phone || !vehicleType || !licenseNumber || !address || !experience || !dob || !drivingLicensePath) {
    return res.status(400).json({ message: 'Please fill out all required fields and upload the necessary documents.' });
  }

  // Respond immediately to the client with a success message
  res.status(200).json({ message: 'Registration successful. Thank you for registering!' });

  // Construct the email body
  const emailContent = `
    <h3>New Driver Registration</h3>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Vehicle Type:</strong> ${vehicleType}</p>
    <p><strong>License Number:</strong> ${licenseNumber}</p>
    <p><strong>Address:</strong> ${address}</p>
    <p><strong>Experience:</strong> ${experience} years</p>
    <p><strong>Date of Birth:</strong> ${dob}</p>
    <p><strong>Profile Picture:</strong> ${profilePicturePath ? 'Uploaded' : 'Not Uploaded'}</p>
    <p><strong>Driving License Document:</strong> ${drivingLicensePath ? 'Uploaded' : 'Not Uploaded'}</p>
  `;

  // Set up email options
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'patrisrinu526@gmail.com', // Replace with your admin email
    subject: 'New Driver Registration',
    html: emailContent,
    attachments: [
      profilePicturePath ? { path: profilePicturePath } : null,
      drivingLicensePath ? { path: drivingLicensePath } : null,
    ].filter(Boolean),  // Remove null values
  };

  // Send email asynchronously (do not block the response to the client)
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error:', error);  // Log error details for debugging
    } else {
      console.log('Email Sent:', info);  // Log success details for debugging
    }
  });
});

// Serve static files (for profile picture or other files)
app.use('/uploads', express.static('uploads'));

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
