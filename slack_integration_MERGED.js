var Slack = require('slack-client');

var wit = require('node-wit');
var open = require('open');
var nodemailer = require('nodemailer');

var SLACK_TOKEN = 'xoxb-19889215429-MJPNMqleXI7RI8Dn24nEdrzd';
var SLACK_AUTORECONNECT = true;
var SLACK_AUTOMARK = true;

var ACCESS_TOKEN = 'FMRINOOR6JOXN5W3LWPGBKOPUQG5CILD';
var transporter = nodemailer.createTransport('smtps://butlerlahacks%40gmail.com:testpass@smtp.gmail.com');

var slack = new Slack(SLACK_TOKEN, SLACK_AUTORECONNECT, SLACK_AUTOMARK);

slack.on('open', function() {
     var channels = ["general"];
     var groups = [];
     console.log("Connected to " + slack.team.name + " as @ " + slack.self.name);
     console.log('You are in: ' + channels.join(', '))
     var channel = slack.getChannelByName('general');
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

     getIntent(text);
});

slack.on('error', function(err) {
     console.log(error);
});

slack.login();


function getIntent(text){
     wit.captureTextIntent(ACCESS_TOKEN, text, function (err, res) {
         console.log("Response from Wit for text input: ");
         if (err) console.log("Error: ", err);
         console.log(JSON.stringify(res, null, " "));
         var theIntent = JSON.stringify(res["outcomes"][0]["intent"]);
         var theArgument = res["outcomes"][0]["entities"]["argument_text"][0]["value"]

         obeyCommand(theIntent.substring(1, theIntent.length - 1), theArgument);
     });
}

function obeyCommand(intent, value){
     console.log("Intent: " + intent);
     if(intent == "PrintText"){
          console.log("Printing! " + value);
     }else if(intent == "Google"){
          console.log("Googlin' " + value);
          open("http://www.google.com/#q=" + encodeURIComponent(value));
     }else if(intent == "Send_Email"){
          sendTheEmail(value, "test subject");
     }
}

function sendTheEmail(recipient, subject){
     var mailOptions = {
     from: 'The Butler <butlerlahacks@gmail.com>', // sender address
         to: recipient, // list of receivers
         subject: 'Hello ✔', // Subject line
         text: 'Hello world', // plaintext body
     };

     transporter.sendMail(mailOptions, function(error, info){
         if(error){
             return console.log(error);
         }
         console.log('Message sent: ' + info.response);
     });}