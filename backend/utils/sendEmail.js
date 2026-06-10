const nodemailer = require('nodemailer');

const sendVerificationEmail = async (toEmail, userName, code) => {

  console.log('Creating email transporter...');
  console.log('Email user from env:', process.env.EMAIL_USER);
  console.log('Email pass length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 'NOT SET');

  const transporter = nodemailer.createTransport({
    host:   'smtp.gmail.com',
    port:   587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  console.log('Verifying transporter connection...');
  await transporter.verify();
  console.log('Transporter verified successfully!');

  const mailOptions = {
    from:    '"FitTrack" <' + process.env.EMAIL_USER + '>',
    to:      toEmail,
    subject: 'FitTrack - Verify Your Email',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;background:#0a0a0f;color:#f0f0f5;padding:40px;border-radius:16px;">
        <h1 style="color:#e8ff47;font-size:36px;margin-bottom:8px;">FITTRACK</h1>
        <p style="color:#666680;margin-bottom:32px;">Your Fitness Performance Hub</p>
        <h2 style="font-size:22px;">Hey ${userName}!</h2>
        <p style="color:#aaa;line-height:1.6;">Use the code below to verify your account.</p>
        <div style="background:#1a1a24;border:2px solid #e8ff47;border-radius:12px;padding:24px;text-align:center;margin:32px 0;">
          <p style="color:#666680;font-size:13px;margin-bottom:8px;letter-spacing:2px;">VERIFICATION CODE</p>
          <h1 style="color:#e8ff47;font-size:48px;letter-spacing:8px;margin:0;">${code}</h1>
        </div>
        <p style="color:#666680;font-size:13px;">Expires in <strong style="color:#f0f0f5;">10 minutes</strong>.</p>
      </div>
    `
  };

  console.log('Sending email to:', toEmail);
  const info = await transporter.sendMail(mailOptions);
  console.log('Email sent successfully! Message ID:', info.messageId);
};

module.exports = sendVerificationEmail;