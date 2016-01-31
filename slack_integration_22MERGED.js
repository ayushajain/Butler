"use strict";

var Slack = require('slack-client');
var Firebase = require('firebase');
var wit = require('node-wit');
var nodemailer = require('nodemailer');

var ORGANIZATION_NAME;
var ref = new Firebase('https://the-butler.firebaseio.com/organizations');
var userRef;

var butlerName = "butler";
var IGNORE_USERS = ["slackbot", butlerName];
var SLACK_TOKEN = 'xoxb-19889215429-MJPNMqleXI7RI8Dn24nEdrzd'; //change
var SLACK_AUTORECONNECT = true;
var SLACK_AUTOMARK = true;
var WIT_TOKEN = 'FMRINOOR6JOXN5W3LWPGBKOPUQG5CILD'; //change
var transporter = nodemailer.createTransport('smtps://butlerlahacks%40gmail.com:testpass@smtp.gmail.com'); //allow customization
var slack = new Slack(SLACK_TOKEN, SLACK_AUTORECONNECT, SLACK_AUTOMARK);

slack.on('open', function() {
     var channels = ["general"];
     console.log("Connected to " + slack.team.name + " as @ " + slack.self.name);
     console.log('You are in: ' + channels.join(', '));
     ORGANIZATION_NAME = slack.team.name;

     ref.once('value', function(snapshot) {
          if (!snapshot.hasChild(ORGANIZATION_NAME)) {
               ref.child(ORGANIZATION_NAME).set({
                    members: "temp",
                    teams: "temp",
                    tasks: "temp"
               });
          }
     });

     userRef = ref.child(ORGANIZATION_NAME);

     userRef.child('members').once('value', function(snapshot) {

          userRef.child('members').child("temp").set({
               "temp": "temp"
          });

          for (var user in slack.users) {
               var name = slack.users[user].name;
               if (!snapshot.hasChild(user) && !IGNORE_USERS.includes(slack.users[user].name) && user.substring(0, 4) != "undi" && user != null && name != null) {
                    console.log(name + user);
                    var data = {
                         email: "temp",
                         tasks: "temp",
                         teams: "temp",
                         name: name
                    };

                    console.log(data);

                    userRef.child('members').child(user).set(data);
               }
          }
     });
});

slack.on('message', function(message) {
     var channel, channelName, text, ts, type, user, userName;
     channel = slack.getChannelGroupOrDMByID(message.channel);
     user = slack.getUserByID(message.user);
     type = message.type, ts = message.ts, text = message.text;
     channelName = (channel != null ? channel.is_channel : void 0) ? '#' : '';
     channelName = channelName + (channel ? channel.name : 'UNKNOWN_CHANNEL');
     userName = (user != null ? user.name : void 0) != null ? "@" + user.name : "UNKNOWN_USER";
     console.log("Received: " + type + " " + channelName + " " + userName + " " + ts + " \"" + text + "\"");

     obeyCommand(text, channel, message);
});

slack.on('error', function(err) {
     console.log(error);
});

slack.login();


function getIntent(text, callback) {
     wit.captureTextIntent(WIT_TOKEN, text, function(err, res) {
          console.log("Response from Wit for text input: ");
          if (err) console.log("Error: ", err);
          console.log(JSON.stringify(res, null, " "));
          var theIntent = JSON.stringify(res["outcomes"][0]["intent"]);
          var args = {};
          try {
               for (var entitity in res["outcomes"][0]["entities"]) {
                    args[entitity] = res["outcomes"][0]["entities"][entitity][0]['value'];
               }
               console.log(JSON.stringify(args));
          } catch (e) {}

          callback([theIntent.substring(1, theIntent.length - 1), args]);
     });
}

function obeyCommand(text, channel, message) {
     var rawIntent = getIntent(text, function(rawIntent) {
          var value = rawIntent[1];
          console.log("Intent: " + rawIntent[0]);
          try {
               switch (rawIntent[0]) {
                    case "Print_Text":
                         console.log("Printing! " + value["argument_text"]);
                         channel.send(value["argument_text"]);
                         break;
                    case "Send_Email":
                         sendTheEmail(value["argument_text"].replaceAll("<|>", ""), "test subject");
                         break;
                    case "Date":
                         channel.send("Todays date is " + getDate() + ".");
                         break;
                    case "Set_Task":
                         userRef.child('members').once('value', function(snapshot) {
                              var team = value["team"];
                              try {
                                   team = value["team"] == "me" ? message.user : slack.getUserByName(value["team"]).id;
                              } catch (e) {}
                              var task = {
                                   task: value["task"]
                              };

                              if (snapshot.hasChild(team)) {
                                   task["creator"] = message.user;
                                   try {
                                        task["deadline"] = value["datetime"];
                                   } catch (e) {
                                        delete task["deadline"];
                                   }
                                   task["type"] = "user";
                                   task["user"] = slack.getUserByID(team).name;
                                   task["key"] = userRef.child('members').child(team).child('tasks').push(task);

                                   addTaskToGlobal(task);
                              } else {
                                   channel.send("Sorry that user does not exist.") // TODO: add suggestions for other people
                              }
                         });
                         break;
                    case "Get_Issues":
                         console.log(value["argument_text"]);


                         // case "Cancel_Task":
                         //
                         // case "Get_Issues":
                         //
                         // case "Get_Status":
                         //
                         // case "Get_Pull_Requests":
               }
          } catch (e) {}

     });
}


function addTaskToGlobal(task) {

}

String.prototype.replaceAll = function(search, replacement) {
     var target = this;
     return target.replace(new RegExp(search, 'g'), replacement);
};

function sendTheEmail(recipient, subject) {
     var mailOptions = {
          from: 'The Butler <butlerlahacks@gmail.com>', // sender address
          to: recipient, // list of receivers
          subject: 'Hello ✔', // Subject line
          text: 'Hello world', // plaintext body
     };

     transporter.sendMail(mailOptions, function(error, info) {
          if (error) {
               return console.log(error);
          }
          console.log('Message sent: ' + info.response);
     });
}

function getDate() {
     var today = new Date();
     var dd = today.getDate();
     var mm = today.getMonth() + 1; //January is 0!
     var yyyy = today.getFullYear();

     if (dd < 10)
          dd = '0' + dd
     if (mm < 10)
          mm = '0' + mm

     return mm + '/' + dd + '/' + yyyy;
}

if (!Array.prototype.includes) {
     Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
          'use strict';
          var O = Object(this);
          var len = parseInt(O.length) || 0;
          if (len === 0) {
               return false;
          }
          var n = parseInt(arguments[1]) || 0;
          var k;
          if (n >= 0) {
               k = n;
          } else {
               k = len + n;
               if (k < 0) {
                    k = 0;
               }
          }
          var currentElement;
          while (k < len) {
               currentElement = O[k];
               if (searchElement === currentElement ||
                    (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
                    return true;
               }
               k++;
          }
          return false;
     };
}








var GitHubApi = require("github");

var fs = require("fs");

var the_token;

function setupGitID(callback){
    fs.readFile("id.txt", function(err, data){
        if(err){
            console.error(err);
        }
        the_token = data.toString();

        callback();
    })
}


var github = new GitHubApi({
    // required 
    version: "3.0.0",
    // optional 
    debug: true,
    protocol: "https",
    host: "api.github.com", // should be api.github.com for GitHub 
    pathPrefix: "", // for some GHEs; none for GitHub 
    timeout: 5000,
    headers: {
        "user-agent": "nejosephliu" // GitHub is happy with a unique user agent 
    }
});

setupGitID(function(){
    github.authenticate({
        type: "oauth",
        token: the_token
        //token: "0e17a29b72a33ea4c99a8f9a5ae7f8e5c0b50425"
    });
})



//printPullRequests("ayushajain", "Butler");

function printPullRequests(user, repo){
    github.pullRequests.getAll({user: user, repo: repo}, function(err, result){
        //console.log(result);
        var counter = 0;

        console.log("---------------------");

        while(true){
            var pull_object = result[counter];
            if(pull_object == undefined){
                break;
            }else{
                console.log("PULL REQUEST #: " + counter);
                console.log("PULL TITLE: " + pull_object["title"]);
                console.log("PULL USER: " + pull_object["user"]["login"]);
                console.log("PULL URL: " + pull_object["url"]);
                console.log("PULLING FROM: " + pull_object["head"]["ref"]);
                console.log("PULLING TO: " + pull_object["base"]["ref"]);
            }
            counter++;

            console.log("---------------------");
        }
        
    });
}


//printRepoInfo("ayushajain", "Butler");

function printRepoInfo(user, repo){
    github.repos.get({user: user, repo: repo}, function(err, result){
        //console.log(result);

        console.log("---------------------");

        console.log("REPO NAME: " + result["name"]);
        console.log("REPO OWNER: " + result["owner"]["login"]);
        console.log("REPO URL: " + result["url"]);
        console.log("REPO # OF OPEN ISSUES: " + result["open_issues"]);

        //printBranchInfo("ayushajain", "Butler");

        console.log("---------------------");
    });


    printBranchInfo("ayushajain", "Butler");

}

function printBranchInfo(user, repo){
    github.repos.getBranches({user: user, repo: repo}, function(err, result){
        var counter = 0;

        console.log("---------------------");
        
        while(true){
            if(result[counter] == undefined){
                break;
            }else{
                console.log("BRANCH #: " + counter);
                console.log("BRANCH NAME: " + result[counter]["name"]);
                console.log("BRANCH URL: " + result[counter]["commit"]["url"]);
            }

            counter++;

            console.log("---------------------");
        }

        //console.log(result);
    });
}


/*console.log(github.repos.getCollaborators({user: "nejosephliu", repo: "Youth_Directory_Repo", number: 1}, function(err, result){
     console.log(result);
}));*/

// console.log(github.issues.getRepoIssue({user: "ayushajain", repo: "Butler", number: 1}, function(err, result){
//     console.log("THE TITLE IS: " + result["title"]);
//     console.log("THE BODY IS: " + result["body"]);
//     console.log("THE USER WHO WROTE IT IS: " + result["user"]["login"]);
// }));


//printIssues("ayushajain", "Butler");

function printIssues(user, repo){
    //github.issues.repoIssues({user: "ButlerLAHacks", repo: "Test", sort:"updated", direction: "asc"}, function(err, result){
    github.issues.repoIssues({user: user, repo: repo, sort:"updated", direction: "asc"}, function(err, result){
        //console.log(result);

        console.log("---------------------");


        var counter = 0
        ;

        while(true){
            //console.log("THE TITLE IS: " + the_title);
            var issue_object = result[counter];//["title"];
            if(issue_object == undefined){
                break;
            }else{
                console.log("ISSUE #: " + (counter));

                console.log("THE TITLE IS: " + issue_object["title"]);
                console.log("THE BODY IS: " + issue_object["body"]);
                console.log("THE USER IS: " + issue_object["user"]["login"]);
                console.log("THE LINK IS: " + issue_object["url"]);
                console.log("THE NUMBER IS: " + issue_object["number"]);
            }

            console.log("---------------------");

            counter += 1;
        }
        
    });
}



//printPullRequests("ayushajain", "Butler");

function printPullRequests(user, repo){
    github.pullRequests.getAll({user: user, repo: repo, direction:"asc"}, function(err, result){
        console.log(result);
    });
}



