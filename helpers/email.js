const sgMail = require('@sendgrid/mail')
const dotenv = require('dotenv')
dotenv.config()
const PORT = process.env.PORT || 3000
const { HOST } = process.env

const sendEmail = async (verifyToken, email) => {
  const { SENDGRID_API_KEY } = process.env

  sgMail.setApiKey(SENDGRID_API_KEY)

  const msg = {
    from: 'di.vi.ivanov@gmail.com',
    to: email,
    subject: 'Verify your email',
    text: 'Click to link',
    html: `<a href=${HOST}:${PORT}/users/verify/${verifyToken}>Верифицируйте свой email</a>`,
  }

  await sgMail.send(msg)
}

module.exports = {
  sendEmail
}
