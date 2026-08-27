//create actual app
const express = require('express');
const app = express();
require('dotenv').config();
const router = require('./routes/auth');
const session = require('express-session')
const cors = require('cors'); //stands for Cross Origin Resource Sharing

//set up middleware
app.use(express.json());

//you need to have cors for cookie usage or something like, otherwise terminal errors
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

//technically mostly for admin login and safety, but can me used for some /api/me login stuff for the user later
app.set('trust proxy', 1); //check cookie note below
app.use(session({

    secret: process.env.SESSION_SECRET_KEY,
    resave: false,            //do not save session data if there were no modifications
    saveUninitialized: false,  //dont save new but not modified sessions
    rolling: true,             //reset time limit every interaction
    cookie: {                 //Cloudflare handles TLS so technically the program only handles HTTP
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 2 //two hours max time
    }
}));

//mount router for api specifically, eventually maybe add in admin router
app.use('/api', router);


module.exports = app;