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
      subject: 'Thank You For Signing Up With ChargeEV  - Please Verify Your Email',
      html: `
        <h1>Welcome to Our EV Platform!</h1>
        <p>Thank you for connecting with us. Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Your Email Address</a>
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
  const options = { timeZone: 'Asia/Colombo', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  const startTime = new Date(booking.startTime).toLocaleString('en-US', options);
  const endTime = new Date(booking.endTime).toLocaleString('en-US', options);
  const code = booking.chargingCode || '';
  const stationName = booking.stationName || '';
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Booking Confirmation - ChargeEV',
    html: `
      <h1>Booking Confirmation</h1>
      <p>Your charging session has been booked successfully!</p>
      <h2>Booking Details:</h2>
      <ul>
        <li><b>Station:</b> ${stationName}</li>
        <li><b>Vehicle Number:</b> ${booking.vehicleNumber}</li>
        <li><b>Start Time:</b> ${startTime}</li>
        <li><b>End Time:</b> ${endTime}</li>
        <li><b>Charger Type:</b> ${booking.chargerType}</li>
        <li><b>Total Amount:</b> Rs.${booking.totalAmount}</li>
        <li><b>Charging Code:</b> <span style='color:#00c853;font-size:1.2em;'>${booking.chargingCode}</span></li>
      </ul>
      <p>Please use this <b>code</b> at the charging station to start your session. Make sure that you <b>safely</b> store your <b>charging code</b>, as it is essential for activating the charging session. This <b>unique code</b> must be presented at the station to begin charging your vehicle. For your convenience and security, we recommend you to keep a <b>digital or a physical copy of the code</b> until your charging session is completed.</p>
      <p>Thank you for choosing ChargeEV!</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Booking confirmation email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
    throw error;
  }
};

module.exports = {
  sendWelcomeEmail,
  sendBookingConfirmation
}; 