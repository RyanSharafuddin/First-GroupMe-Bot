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

// aki.start("en", (resolve, error) => {
//   if (error) {
//     console.log(error);
//   } else {
//     console.log(resolve);
//   }
// });


var twentyQStartValues = ["20Q", "20q", "20 Questions", "20 questions"];
var inTwentyQ = false; //PUT IN DATABASE
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
  botPost("0 - Yes");
  botPost("1 - No");
  botPost("2 - Don't know");
  botPost("3 - Probably");
  botPost("4 - Probably not");
}

// app.get('/', function(req, res) {
//   console.log("Got request for main page");
//   res.send("Hello World!");
// });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded()); //necesary to handle post requests

app.get('/', function(req, res, next) { //CHANGED back to post

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
  }

  if((req.body.sender_id == sam_id) && (Math.random() < .2)) { //20% chance of accusing Sam.
    botPost("Disregard whatever " + req.body.name + " just said; it is obvious that he is a mafioso trying to deceive us all.");
  }

  if(twentyQStartValues.includes("20Q")) { //CHANGED -put req.body.text back in
    // inTwentyQ = true; //DATABASE
    // aki.start("en", (resolve, error) => {
    //   if (error) {
    //     botPost("20 Questions is broken. Sorry.");
    //     inTwentyQ = false; //DATABASE
    //   }
    //   else {
    //     signature = resolve.signature; //DATABASE
    //     session = resolve.session; //DATABASE
    //     step = 0; //DATABASE
    //     botPost(resolve.question);
    //     displayAnswers();
    //   }
    // });

    aki.start("en", (resolve, error) => {
      if (error) {
        console.log(error);
      } else {
        console.log(resolve);
      }
    });

    // const data = await akinator.start("en");
    // signature = data.signature; //DATABASE
    // session = data.session; //DATABASE
    // step = 0; //DATABASE
    // botPost(data.question);
    // displayAnswers();

  }

  if(inTwentyQ && answers.includes(req.body.text)) { //DATABASE
    akinator.step("en", session, signature, req.body.text, step, (resolve, error) => { //DATABASE
      if (error) {
        botPost("20 Questions is broken. Sorry.");
        inTwentyQ = false; //DATABASE
      }
      else {
        step += 1; //DATABASE
        if(resolve.progress >= 85) {
          //WIN CODE
          akinator.win("en", session, signature, step, (resolve, error) => {
            if (error) {
              botPost("20 Questions is broken. Sorry.");
              inTwentyQ = false; //DATABASE
            }
            else {
              botPost("I guess it is: " + resolve.answers[0].name);
              inTwentyQ = false; //DATABASE
              step = 0; //DATABASE
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
