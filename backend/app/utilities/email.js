const nodemailer = require("nodemailer");
const config = require("../config/config.js");
const ical = require("ical-generator").default;

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.EMAIL,
    pass: config.EMAIL_PASSWORD,
  },
});

const send_email = (to, subject, html_text,calendarObj = null) => 
{
  let mailOptions = {
    from: config.EMAIL,
    to: to,
    subject: subject,
    html: html_text
  };

  if (calendarObj) 
  {
    mailOptions['icalEvent'] =  {
      filename: "invite.ics",
      method: 'REQUEST',
      content: calendarObj.toString(),
    }
  }

  transporter.sendMail(mailOptions, (error, info) => { 
    if (error) {
      console.log("Error sending email:", error);
      reject(error);
    } else {
      console.log("Email sent:", info.response);
      resolve(info);
    }
  });
};

const getIcalObjectInstance = (starttime, endtime, summary, description, location , name ,email) =>
{
    const cal = ical({name: 'My test calendar event',domain:`http://${config.S3_BUCKET}.s3-website-ap-southeast-2.amazonaws.com/`});
    cal.createEvent({
      start: starttime,
      end: endtime,
      summary: summary,
      sequence: 0,
      description: description,
      location: location,
      organizer: {
                    name: name,
                    email: email
                },
      method: 'request'
    });
    return cal;
}

module.exports = { send_email, getIcalObjectInstance };
