var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var request = require('request');
var bodyParser = require('body-parser'); //used for getting body of posts.
var port = process.env.PORT || 8000;

const { Client } = require('pg'); //database stuff

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

client.connect();

var bot_id = process.env.BOT_ID;
var sam_id = "48077875";

function botPost(text) {
  request.post(
  'https://api.groupme.com/v3/bots/post',
  { json: {
      "bot_id"  : bot_id,
      "text"    : text
    }
  }
  );
}

app.get('/', function(req, res) {
  console.log("Got request for main page");
  res.send("Hello World!");
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded()); //necesary to handle post requests

app.post('/', function(req, res, next) {

if(req.body.name == "Fuddin") {
  console.log("Has received message from Fuddin; is about to do first client.query()");
  var fuddinMessages;
  client.query("SELECT name, num_of_messages FROM messagenums WHERE name = 'Fuddin' ;", (err, res) => {
        //if (err) throw err;
        //res.rows is array of rows
        fuddinMessages = res.rows[0]["num_of_messages"];
        fuddinMessages += 1;
        //client.end();
  });
  client.query("UPDATE messagenums SET num_of_messages = " + fuddinMessages + " WHERE name = 'Fuddin ;'", (err, res) => {
        if (err) throw err;
        //res.rows is array of rows
        //client.end();
  });
  botPost("Fuddin has posted " + fuddinMessages + " messages");
}

  if(req.body.name != "Mafia Detector") { //ignore own posts
    botPost("created_at: " + req.body.created_at
              + "\nid: " + req.body.id
              + "\nname: " + req.body.name
              + "\nsender_id: " + req.body.sender_id
              + "\nsender_type: " + req.body.sender_type
              + "\nsource_guid: " + req.body.source_guid
              + "\nsystem: " + req.body.system
              + "\nuser_id: " + req.body.user_id);

  }
  if(req.body.sender_id == sam_id) {
    botPost("Disregard whatever " + req.body.name + " just said; it is obvious that he is a mafioso trying to deceive us all.");
  }
  else { //not Sam

  }
  next();
});

http.listen(port, function() {
    console.log('listening on *: ' + port);
    console.log("Remember that if you are running this on your local machine," +
       " you need to set the environment variable using export BOT_ID for it to work." +
       " The export keyword is important.");
    botPost("THE BOT IS NOW ONLINE!");
//     request.post(
//     'https://api.groupme.com/v3/bots/post',
//     { json: {
//         "bot_id"  : bot_id,
//         "text"    : "No need to fear the mafia any longer! My highly advanced analytics shall protect your feeble human minds from the mafia from now on!"
//       }
//     },
//     function (error, response, body) {
//         if (!error && response.statusCode == 200) {
//             console.log(body)
//         }
//     }
// );
});
