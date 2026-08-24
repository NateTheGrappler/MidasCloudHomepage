//handle both of the register routes, like the post for /login and /register
const router = require('express').Router();
const {sendTempPasswordEmail} = require(`../email`)
const users = require('../databases/users')
const bcrypt = require('bcryptjs')
const crypto = require('crypto');


//login routing
router.post('/login', (req, res) => {
    //get user data from db and the thing sent
    const {uname, pwd} = req.body;
    const userObject = users.getByUsername(uname);

    //see if user exists and password is correct
    if(!userObject || !bcrypt.compareSync(pwd, userObject.password_hash))
    {
        return res.status(403).json({message: "Invalid Username or Password", success: false});
    }

    //check to see if user is able to access information
    if(userObject.status !== `approved`)
    {
        return res.status(403).json({message: "User not authorized for access", success: false});
    }

    //set up the session ID stuff here
    req.session.userID = userObject.id;

    //see if user needs to change pwd
    if(userObject.hasDefaultPwd)
    {
        return res.status(200).json({message: "User must change Password", success: true, mustChangePwd: true});
    }

    //theyre all good to login, send em their redirect
    return res.status(200).json({message: "Successful login", success: true, mustChangePwd: false, vaultLink: userObject.vaultLink});

});

//-----------------------------Registration stuff-----------------------------------//


//register routing
router.post('/register', (req, res) => {

    const {username, email, optionalRequest} = req.body;
    const tempPassword = crypto.randomBytes(9).toString('base64'); //plaintext pwd
    const tempHashPassword = bcrypt.hashSync(tempPassword, 10);

    try 
    {
        //insert user data and their temp pwd into db
        users.insertRequestData(username, email, optionalRequest, tempHashPassword);
        res.status(200).json({message: "Registration Successful", success: true});

        //set up some system that flags this request for the admin to approve as well as some rate limiting

    }
    catch (err)
    {
        return res.status(409).json({message: "Username already exists", success: false});
    }

    //send the user an email of their temp password
    sendTempPasswordEmail(email, username, tempPassword).catch(error=>console.log(`failed to send email ${email}:`, error));
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

    //paste in the same password validation from the react front end
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