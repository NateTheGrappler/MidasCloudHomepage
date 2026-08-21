const express = require('express') //import express lib from node
const app = express(); //actually set up the `app` object for handling requests and stufff


//middleware to handle json data from incoming login data
app.use(express.json());

app.post('/api/login', (req, res) => {

    //set get the username and password from what was passed in,
    //the reason you can use it as the json data is because of the middleware
    const {username, password} = req.body;

    

    res.json({username : username, password : password});
})


app.listen(3000, () => {
    //first line whenever this bad boy runs
    console.log ("Midas Cloud Server.js is now running! \n");
});





//personal note: req = request, res = response