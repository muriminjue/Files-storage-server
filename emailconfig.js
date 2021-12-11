//module 
const dotenv = require("dotenv");
const nodemailer = require("nodemailer")

dotenv.config()

const transporter = nodemailer.createTransport({
  host: process.env.ehost,
  secureConnection: true,
  port: 465,
  auth: {
    user: process.env.euser,
    pass: process.env.epass,
  },
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false,
  },
});

module.exports= transporter;
