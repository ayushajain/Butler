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
var SELF_POSSESSIVE_WORDS = ["my", "myself", "mine"];

var SLACK_TOKEN = 'xoxb-19889215429-MJPNMqleXI7RI8Dn24nEdrzd'; //change
var SLACK_AUTORECONNECT = true;
var SLACK_AUTOMARK = true;
var WIT_TOKEN = 'FMRINOOR6JOXN5W3LWPGBKOPUQG5CILD'; //change
var transporter = nodemailer.createTransport('smtps://butlerlahacks%40gmail.com:testpass@smtp.gmail.com'); //allow customization
var slack = new Slack(SLACK_TOKEN, SLACK_AUTORECONNECT, SLACK_AUTOMARK);

var global_key = "";

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
     console.log(err);
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
     console.log(message)
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
                                   if (value["datetime"] != null) {
                                        task["deadline"] = value["datetime"];
                                   }
                                   task["type"] = "user";
                                   task["user"] = team;
                                   task["key"] = userRef.child('members').child(team).child('tasks').push(task);
                                   addTaskToGlobal(task);

                              } else {
                                   channel.send("Sorry that user does not exist.") // TODO: add suggestions for other people
                              }
                         });
                         break;

                    case "Cancel_Task":
                         console.log(message.user);
                         userRef.child('members').child(message.user).child('tasks').once('value', function(snapshot) {
                              var task = value["task"];
                              var containsTask = snapshot.forEach(function(childSnapshot) {
                                   channel.send("Actual task: " + childSnapshot.val().task);
                                   if (childSnapshot.val().task == task) {
                                        console.log("PARENT: " + JSON.stringify(childSnapshot.val()));
                                        global_key = childSnapshot.key();
                                        return true;
                                   }
                              });

                              if (containsTask == true) {
                                   userRef.child('members').child(message.user).child('tasks').child(global_key).remove();
                                   channel.send("Task removed!");
                              } else {
                                   channel.send("Sorry, that task does not exist.");
                              }

                         });
                         break;

                    case "List_Tasks":
                         var member = slack.getUserByName(value["member"]);
                         var output = "";
                         userRef.child("members").child(member.id).child('tasks').once('value', function(snapshot) {
                              var count = 1;
                              snapshot.forEach(function(childSnapshot) {
                                   var data = childSnapshot.val();
                                   var creator = data.creator == message.user ? "you" : slack.getUserByID(data.creator).name;
                                   output += "Task " + count + ": " + data.task + " (Assigned by " + creator + ")\n";

                                   count++;
                              });
                              channel.send(output);
                              if (output == "")
                                   channel.send("No such user found.");
                         });
                         break;
                    case "List_Members":
                         var isTeam = value["team"] != null;

                         var output = "";
                         if (isTeam) {
                              userRef.child('teams').once('value', function(snapshot) {
                                   snapshot.forEach(function(childSnapshot) {
                                        if (childSnapshot.val().name)
                                             output += childSnapshot.val().name + ", ";
                                   });
                                   channel.send(output);
                                   if (output == "") {
                                        channel.send("No such team exits.");
                                   }
                              });
                         } else {
                              userRef.child('members').once('value', function(snapshot) {
                                   snapshot.forEach(function(childSnapshot) {
                                        if (childSnapshot.val().name)
                                             output += childSnapshot.val().name + ", ";
                                   });
                                   channel.send(output);
                              });
                         }
                         break;
                    case "Create_Team":

                         break;
                    case "Dank_Meme":
                         var randomVar = Math.random();
                         if(randomVar > 0.67){
                              channel.send("Dank memes are bad. Learn how to be an anti-dank today!");
                         }else if(randomVar <= 0.33){
                              channel.send("Keep your IQ points! Don't look up dank memes.");
                         }else{
                              channel.send("Dankness is not a desirable quality. Say *_NO_* to dank memes.")
                         }
                         break;
                         
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
     task.key = task.key.toString().replaceAll(".*/", "");
     userRef.child('tasks').child(task.key).set(task);
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
