//modules
require("dotenv").config()
const express = require('express');
const path = require('path');
const fileUpload = require('express-fileupload')
const cors = require('cors')
const PORT = process.env.PORT || 9505
const checkuser = require("./security")
const myroutes = require("./router")

//init app
const app = express()

//setup public folder
/* Protect this route */ 
app.use(express.static(path.join(__dirname, 'public')));

//read json
app.use(express.json());

//file upload
app.use(fileUpload());

//cross origin
app.use(cors())

//uploading route
app.use("/:userauth", checkuser, myroutes )

app.listen(PORT, () => {
    console.log('server starteed on port ' + PORT);

})