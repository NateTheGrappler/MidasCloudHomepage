//create actual app
const express = require('express')
const app = express();

//set up middleware
app.use(express.json);

//mount router


module.exports = app;