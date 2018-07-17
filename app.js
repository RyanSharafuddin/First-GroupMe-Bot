var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var request = require('request');
var bodyParser = require('body-parser'); //used for getting body of posts. I think.
var port = process.env.PORT || 8000;

app.get('/', function(req, res) {
  console.log("Got request for main page");
  res.send("Hello World!");
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded()); //necesary to handle post requests

app.post('/', function(req, res, next) {
  console.log("Someone posted something.");
  console.log(req.body);
  next();
});

http.listen(port, function() {
    console.log('listening on *: ' + port);
    request.post(
    'https://api.groupme.com/v3/bots/post',
    { json: {
        "bot_id"  : "ceba1b427e02f186aa357b9103",
        "text"    : "Bot restarted."
      }
    },
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body)
        }
    }
);
});
