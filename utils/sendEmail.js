const transporter = require("../config/mail");


const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"My App" <${process.env.EMAIL}>`,
      to,
      subject,
      html
    });

    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.log("Email error:", error);
  }
};

module.exports = sendEmail;