/*
  This version of the program maintains a database of
  the number of times Fuddin posts in the FuddinTestGroup and every time Fuddin
  posts, the bot makes a post of its own saying how many times Fuddin has posted
  and also all fields of the bot response (except text).
*/
var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var request = require('request');
var bodyParser = require('body-parser'); //used for getting body of posts.
var port = process.env.PORT || 8000;
const aki = require('aki-api');



var twentyQStartValues = ["20Q", "20q", "20 Questions", "20 questions"];
var inTwentyQ = false; //PUT IN DATABASE
var receivingEvaluation = false; //Waiting for results of asking how did.
var step = 0; //DATABASE
var session; //DATABASE
var signature; //DATABASE
var answers = ["0", "1", "2", "3", "4"];

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

function displayAnswers() {
  botPost("0: Yes, 1: No, 2: Don't know, 3: Probably, 4: Probably not");
}

function askHowDid() {
  botPost("So . . . how did I do?");
  setTimeout(evaluations, 3000);
}

function evaluations() {
  botPost("0: Right! Great Job!, 1: Wrong. I'm disappointed in you, computer.");
}

app.get('/', function(req, res) {
  console.log("Got request for main page");
  res.send("Hello World!");
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded()); //necesary to handle post requests

app.post('/', function(req, res, next) {

// if(req.body.name == "Fuddin") {
//   console.log("Has received message from Fuddin; is about to do first client.query()");
//   var fuddinMessages;
//   client.query("SELECT name, num_of_messages FROM messagenums WHERE name = 'Fuddin' ;", (err, res) => {
//         //if (err) throw err;
//         //res.rows is array of rows
//         fuddinMessages = res.rows[0]["num_of_messages"];
//         console.log("After performing query, the value of fuddinMessages is: ");
//         console.log(fuddinMessages);
//         console.log("res.rows is: ")
//         console.log(res.rows);
//         fuddinMessages += 1;
//         client.query("UPDATE messagenums SET num_of_messages = " + fuddinMessages + " WHERE name = 'Fuddin' ;", (err, res) => {
//           botPost("Fuddin has posted " + fuddinMessages + " messages");
//         });
//         //client.end();
//   });
// }

  if(req.body.name != "Mafia Detector") { //ignore own posts
    // botPost("created_at: " + req.body.created_at
    //           + "\nid: " + req.body.id
    //           + "\nname: " + req.body.name
    //           + "\nsender_id: " + req.body.sender_id
    //           + "\nsender_type: " + req.body.sender_type
    //           + "\nsource_guid: " + req.body.source_guid
    //           + "\nsystem: " + req.body.system
    //           + "\nuser_id: " + req.body.user_id);
    console.log("'" + req.body.name + "'" + " just posted!")
  }

  if((req.body.sender_id == sam_id) && (Math.random() < .2)) { //20% chance of accusing Sam.
    botPost("Disregard whatever " + req.body.name + " just said; it is obvious that he is a mafioso trying to deceive us all.");
    return;
  }

  if(twentyQStartValues.includes(req.body.text)) { //CHANGED -put req.body.text back in

    aki.start("en", (resolve, error) => {
      if (error) {
        console.log(error);
        botPost("20 Questions is broken. Sorry.");
        inTwentyQ = false; //DATABASE
        receivingEvaluation = false;
      } else {
        console.log(resolve);
        inTwentyQ = true; //DATABASE
        signature = resolve.signature; //DATABASE
        session = resolve.session; //DATABASE
        step = 0; //DATABASE
        botPost(resolve.question);
        setTimeout(displayAnswers, 1500);
        receivingEvaluation = false;
      }
    });
  }

  if(inTwentyQ && answers.includes(req.body.text)) { //DATABASE
    aki.step("en", session, signature, req.body.text, step, (resolve, error) => { //DATABASE
      if (error) {
        console.log(error);
        botPost("20 Questions is broken. Sorry.");
        inTwentyQ = false; //DATABASE
      }
      else {
        console.log(resolve);
        step += 1; //DATABASE
        if(resolve.progress >= 85) {
          //WIN CODE
          aki.win("en", session, signature, step, (resolve, error) => {
            if (error) {
              console.log(error);
              botPost("20 Questions is broken. Sorry.");
              inTwentyQ = false; //DATABASE
            }
            else {
              console.log(resolve);
              botPost("I guess it is: " + resolve.answers[0].name);
              inTwentyQ = false; //DATABASE
              step = 0; //DATABASE
              setTimeout(askHowDid, 3000); // ASK HOW I DID?
              receivingEvaluation = true;
            }
          });
        }
        else {
          botPost(resolve.nextQuestion);
          displayAnswers();
        }
      }
    });
  }

  if(receivingEvaluation) {
    if( (req.body.text != "0") && (req.body.text != "1")) {
      return;
    }
    receivingEvaluation = false;
    var replies;
    if(req.body.text == "0") {
      replies = [":)", "(^_^)"];
    }
    if(req.body.text == "1") {
      replies = ["I will try harder next time."];
    }
    var rand = replies[Math.floor(Math.random() * replies.length)];
    botPost(rand);
    botPost("Thanks for playing!");
  }

  next();
});

http.listen(port, function() {
    console.log('listening on *: ' + port);
    console.log("Remember that if you are running this on your local machine," +
       " you need to set the environment variable using export BOT_ID for it to work." +
       " The export keyword is important.");

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
