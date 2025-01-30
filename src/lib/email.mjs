'use server'
import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, meetingTitle, meetingDate, meetingLink) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #000000;">🔔 Meeting Reminder: ${meetingTitle}</h2>
      <p>Hello,</p>
      <p>Your meeting <strong>${meetingTitle}</strong> is scheduled at <strong>${meetingDate}</strong>.</p>
      <p>Click the button below to join the meeting:</p>
      <a href="${meetingLink}" style="display: inline-block; padding: 10px 20px; background-color: #22c55e; color: white; text-decoration: none; border-radius: 5px;">Join Meeting</a>
      <p>If the button does not work, copy and paste this link into your browser:</p>
      <p><a href="${meetingLink}" style="color: #22c55e;">${meetingLink}</a></p>
      <hr>
      <p style="font-size: 12px; color: gray;">This is an automated email. Please do not reply.</p>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
