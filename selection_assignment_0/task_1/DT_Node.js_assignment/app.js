const express = require('express');
const app = express();
const morgan = require('morgan');
const colors = require('colors');
const fileUpload = require('express-fileupload');
require('dotenv').config({ path: './config/config.env' });

//dev logging middle ware
app.use(morgan('dev'));

///connectDB
const {DB,connectDB} = require('./config/db_connect');
connectDB();
DB.on('error', console.error.bind(console, 'MangoDB Connection Error!!! '));

//file upload ang body parser
app.use(fileUpload());
app.use(express.json());
app.use(express.raw());
app.use(express.urlencoded({extended: false}));


//routes
const events = require('./routes/events');


//control routes
app.use('/api/v3/app', events);
//route wrong paths
app.use('*', function (req, res) {
    res.status(302)/*.send("wrong route")*/.redirect('/api/v3/app/events');
})

//app listening
app.listen(process.env.PORT,(err)=>{
    if(err)console.log(err);
    console.log(`server running on port ${process.env.PORT}`.yellow.bold);
})

//////////////////app exceptions
app.use((err, req, res, next) => {
    if (err)
        res.status(400).json(err);
    else res.redirect('/');
})