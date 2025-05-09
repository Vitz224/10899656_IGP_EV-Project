const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendWelcomeEmail = async (email, name, verificationToken) => {
  try {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}?email=${encodeURIComponent(email)}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Welcome to Our Platform - Verify Your Email',
      html: `
        <h1>Welcome to Our Platform!</h1>
        <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email Address</a>
        <p>If you did not create an account, please ignore this email.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

const sendBookingConfirmation = async (email, booking) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Booking Confirmation - ChargeEV',
    html: `
      <h1>Booking Confirmation</h1>
      <p>Your charging session has been booked successfully!</p>
      <h2>Booking Details:</h2>
      <ul>
        <li>Start Time: ${new Date(booking.startTime).toLocaleString()}</li>
        <li>End Time: ${new Date(booking.endTime).toLocaleString()}</li>
        <li>Charger Type: ${booking.chargerType}</li>
        <li>Total Amount: $${booking.totalAmount}</li>
      </ul>
      <p>Thank you for choosing ChargeEV!</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendBookingConfirmation
}; 