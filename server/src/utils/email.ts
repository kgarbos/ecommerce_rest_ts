import sgMail from "@sendgrid/mail";

const sendgridAPIKey = process.env.EMAIL_PASSWORD;
sgMail.setApiKey(sendgridAPIKey);

const sendEmail = async (to: string, subject: string, text: string) => {
  try {
    await sgMail.send({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
    });
  } catch (error) {
    console.log(error);
  }
};

const sendConfirmationEmail = async (to: string, confirmationUrl: string) => {
  const subject = 'Please confirm your email!';
  const text = `Please click the following link to confirm your email: ${confirmationUrl}`;
  await sendEmail(to, subject, text);
};

const sendCancellationEmail = async (to: string, username: string) => {
  const subject = 'Sorry to see you go!';
  const text = `Goodbye, ${username}. We hope to see you back soon.`;
  await sendEmail(to, subject, text);
};

const sendResetPasswordEmail = async (to: string, resetUrl: string) => {
  const subject = 'Password Reset Request';
  const text = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;
  await sendEmail(to, subject, text);
};

const sendPasswordChangeEmail = async (to: string) => {
  const subject = 'Password Changed Successfully';
  const text = `Your password has been changed successfully.`;
  await sendEmail(to, subject, text);
};

export { sendConfirmationEmail, sendCancellationEmail, sendResetPasswordEmail, sendPasswordChangeEmail };
