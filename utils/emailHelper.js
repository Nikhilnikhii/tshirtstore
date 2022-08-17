const nodemailer = require('nodemailer');

const mailHelper=async (options)=>{
  const transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "2bf07856f0fde6",
    pass: "a075b6988971af"
  },
  });

  const message={
    from: 'nikhilkumarpasumarthi143@gmail.com', // sender address
    to: options.toEmail, // list of receivers
    subject:options.subject, // Subject line
    text: options.message, // plain text body
    //html: "<b>Hello world?</b>", // html body
  }

  // send mail with defined transport object
await transporter.sendMail(message);

     

}

module.exports=mailHelper;