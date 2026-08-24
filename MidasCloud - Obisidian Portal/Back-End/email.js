//connect over to the resend service so I can send emails
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendTempPasswordEmail(toEmail, username, tempPassword)
{
    return resend.emails.send({
        from: 'pleaseDoNotReply@mail.midascloud.net',
        to: toEmail,
        subject: "Your MidasCloud Obsidian Portal temporary password",
        text: `Hello ${username}, it is a pleasure to have you try and register for my service, \n\nI hope that you find use inside of your note taking,\n\n
        Your Temporary password is: ${tempPassword}\n\nLog in with your chosen username and password in the main login area of the portal, you will be prompted to change your password\n\n
        After entering in your own password, an admin will be notified and create your vault as soon as possible.\n\n Thank you!!`
    });
}

module.exports = {sendTempPasswordEmail};