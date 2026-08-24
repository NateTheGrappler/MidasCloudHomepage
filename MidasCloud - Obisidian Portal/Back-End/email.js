//connect over to the resend service so I can send emails
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendTempPasswordEmail(toEmail, username, tempPassword)
{
    return resend.emails.send({
        from: 'do-not-reply@mail.midascloud.net',
        to: toEmail,
        subject: "Your MidasCloud Obsidian Portal temporary password",
        text: `Hello ${username}, it is a pleasure to have you try and register for my service.
        I hope that you find use inside of your note taking!
        Your Temporary password is: ${tempPassword}
        Log in with your chosen username and password in the main login area of the portal, and you will then be prompted to change your password :3
        After entering in your own password, an admin will be notified and create your vault as soon as possible. Thank you!!`,
        html: `
            <p>Hello ${username}, it is a pleasure to have you try and register for my service!!</p>
            <p>I hope that you find use inside of your note taking!</p>
            <p>Your temporary password is: <strong>${tempPassword}</strong></p>
            <p>Log in with your chosen username and password in the main login area of the portal, and you will then be prompted to change your password :3</p>
            <p>After entering in your own password, an admin will be notified and create your vault as soon as possible.</p>
            <p>Thank you!!</p>
        `
    });
}

module.exports = {sendTempPasswordEmail};