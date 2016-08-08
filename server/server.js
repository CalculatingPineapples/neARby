var express = require('express');
var bodyParser = require('body-parser');
var router = require('./routes');

var app = express();
var port = 3000;

app.use('/', router);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(process.env.PORT || port);
console.log(`Listening on port ${port}`);
