var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var port = process.env.PORT || 8000;

app.get('/', function(req, res) {
  console.log("Got request for main page");
  res.send("Hello World!");
});

http.listen(port, function() {
    console.log('listening on *: ' + port);
});
