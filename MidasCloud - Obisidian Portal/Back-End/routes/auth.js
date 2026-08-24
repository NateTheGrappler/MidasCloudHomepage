//handle both of the register routes, like the post for /login and /register
const router = require('express').Router();
const users = require('../databases/users')
const bcrypt = require('bcryptjs')


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


//register routing
router.post('/register', (req, res) => {
    const {username, email, optionalRequest} = req.body;

    try 
    {
        users.insertRequestData(username, email, optionalRequest);
        res.status(200),json({message: "Registration Successful", success: true});

        //set up some system that flags this request for the admin to approve as well as some rate limiting
    }
    catch (err)
    {
        return res.status(409).json({message: "Username already exists", success: false});
    }

});



module.exports = router;