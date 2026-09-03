//handle both of the register routes, like the post for /login and /register
const router = require('express').Router();
const {sendTempPasswordEmail} = require(`../email`)
const users = require('../databases/users')
const bcrypt = require('bcryptjs')
const crypto = require('crypto');
const { error } = require('console');
const rateLimit = require('express-rate-limit')


//login routing
router.post('/login', (req, res) => {
    //get user data from db and the thing sent
    const {uname, pwd} = req.body;
    const userObject = users.getByUsername(uname) || users.getByEmail(uname.toLowerCase());
    
    if(!userObject || !bcrypt.compareSync(pwd, userObject.password_hash))
    {
        return res.status(403).json({message: "Invalid Username or Password", success: false});
    }

    //set up the session ID stuff here (BEFORE STATUS IS CHECKED bc u need it for when someone still needs to have their portal set up by admin/me)
    req.session.userID = userObject.id;

    //see if user needs to change pwd
    if(userObject.hasDefaultPwd)
    {
        return res.status(200).json({message: "User must change Password", success: true, mustChangePwd: true});
    }

    //check to see if user is able to access information
    if(userObject.status !== `approved`)
    {
        return res.status(200).json({message: "Account pending approval", success: true, pending: true});
    }

    //theyre all good to login, send em their redirect
    return res.status(200).json({message: "Successful login", success: true, mustChangePwd: false, vaultLink: userObject.vaultLink});

});

//-----------------------------Registration stuff-----------------------------------//

//in production test this because it might work differently when hooked up to cloudflare with only recognizing cloudflare's IP
const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, //a 15 minute time out window if my math is right
    max: 5,
    message: {message: 'Too many registration attempts, please try again later', success: false },
    standardHeaders: true,
    legacyHeaders: false
})

//register routing
router.post('/register', rateLimiter, (req, res) => {

    const {username, email, optionalRequest} = req.body;
    const tempPassword = crypto.randomBytes(9).toString('base64'); //plaintext pwd
    const tempHashPassword = bcrypt.hashSync(tempPassword, 10); //hash the password so you can toss it in db

    //use lowercase email so people cannot reuse the same email
    var lowerEmail = email.toLowerCase();

    try 
    {

        //make sure that given username or email is not already in the database
        const userObject = users.getByUsername(username);
        const emailObject = users.getByEmail(lowerEmail);

        console.log(userObject);
        console.log(emailObject);

        if(userObject)
        {
            throw new Error("Username Already Exists!");
        }
        if(emailObject)
        {
            throw new Error("An Account with that email already exists!");
        }
        
        //set up some system that flags this request for the admin to approve, like an admin dashboard


        //insert user data and their temp pwd into db
        users.insertRequestData(username, lowerEmail, optionalRequest, tempHashPassword);
        res.status(200).json({message: "Registration Successful", success: true});

    }
    catch (err)
    {
        return res.status(409).json({message: `${err}`, success: false});
    }

    //send the user an email of their temp password
    sendTempPasswordEmail(lowerEmail, username, tempPassword).catch(error=>console.log(`failed to send email ${email}:`, error));
});

//-----------------------------New password stuff-----------------------------------//

function checkPassword(password)
{
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (password.length > 20) return 'Password must be less than 20 characters';
    if (!/\d/.test(password)) return 'Password must include at least one number';
    if (!/[!@#$%^&*(),.?":{}_|<>]/.test(password)) return 'Password must include at least one special character'; //some real JS fuckshit here ngl, the jumbled mess a character class
    return null; //valid pswd
}

//routing for when someone is prompted to change their password or wants to change it on their own (in the future maybe)
router.post('/change-pwd', (req, res) => {

    console.log(req.userID)

    //check to see if user logged in to get to this page
    if(!req.session.userID)
    {
        return res.status(401).json({message: "User not authenticated", success: false});
    }

    //get inputted data and user object from database
    const {oldPwd, newPwd, confirmNewPwd} = req.body;
    const userObject = users.getByID(req.session.userID);

    //check old password is good
    if(!userObject || !bcrypt.compareSync(oldPwd, userObject.password_hash))
    {
        return res.status(403).json({message: "Incorrect Old Password", success: false});
    }

    //check new password is typed correctly
    if(newPwd !== confirmNewPwd)
    {
        return res.status(403).json({message: "New password differs from Confirm New Password", success: false});
    }

    //paste in the same password validation from the react front end for redundency
    const validPwd = checkPassword(newPwd); 
    if(validPwd)
    {
        return res.status(403).json({message: validPwd, success: false});
    }

    //otherwise actually change the password of the user
    const newHash = bcrypt.hashSync(newPwd, 10);
    users.setPassword(userObject.username, newHash, 0);

    res.status(200).json({message: "Successfully changes user password", success: true});
});



module.exports = router;