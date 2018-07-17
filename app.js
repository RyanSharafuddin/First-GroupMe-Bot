var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var request = require('request');
var bodyParser = require('body-parser'); //used for getting body of posts.
var port = process.env.PORT || 8000;

var bot_id = process.env.BOT_ID;
var sam_id = "48077875";

app.get('/', function(req, res) {
  console.log("Got request for main page");
  res.send("Hello World!");
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded()); //necesary to handle post requests

app.post('/', function(req, res, next) {
  if(req.body.sender_id == sam_id) {
    request.post(
    'https://api.groupme.com/v3/bots/post',
    { json: {
        "bot_id"  : bot_id,
        "text"    : "Disregard whatever " + req.body.name + " just said; it is obvious that he is a mafioso trying to deceive us all."
      }
    }
    );
  }
  else {

  }
  next();
});

http.listen(port, function() {
    console.log('listening on *: ' + port);
    request.post(
    'https://api.groupme.com/v3/bots/post',
    { json: {
        "bot_id"  : bot_id,
        "text"    : "No need to fear the mafia any longer! My highly advanced analytics shall protect your feeble human minds from the mafia from now on!"
      }
    },
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body)
        }
    }
);
});
