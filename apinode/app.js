const express = require('express');
const helmet = require('helmet'); 
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');


const app = express();


// To parse the incoming requests with JSON payloads
// request body limit is 5kb
app.use(express.json({ limit: '5kb' })) 
app.use(express.urlencoded({extended: true}));


// limit requests to 100 requests per hour
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 6000
});
// apply rate limiting to all requests
app.use(limiter);


// npm i --save xss-clean
// Data Sanitization against XSS
app.use(xss());


// npm install --save helmet
app.use(helmet());



// Configuration des headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });


// serve assets files
app.use('/static', express.static(__dirname + '/assets'));


// routers
const metaRoutes = require('./routes/metadata');
app.use('/api/v1', metaRoutes);



module.exports = app;