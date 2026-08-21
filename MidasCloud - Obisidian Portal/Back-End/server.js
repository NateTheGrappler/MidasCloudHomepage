const express = require('express') //import express lib from node
const app = express(); //actually set up the `app` object for handling requests and stufff


//personal note: req = request, res = response
app.get('/', (req, res) => {
    res.send('HELLO WORLD!');
});


app.listen(3000, () => {
    //first line whenever this bad boy runs
    console.log ("Midas Cloud Server.js is now running! \n");
});
