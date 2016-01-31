var prompt = require('prompt');
var wit = require('node-wit');
var open = require('open');
var gi = require('github-issues');
var nodemailer = require('nodemailer');

var ACCESS_TOKEN = 'FMRINOOR6JOXN5W3LWPGBKOPUQG5CILD';

var transporter = nodemailer.createTransport('smtps://butlerlahacks%40gmail.com:testpass@smtp.gmail.com');



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

prompt.start();

function promptResults(err, result){
	getIntent(result.Input);
}

prompt.get(['Input'], promptResults);


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

var config = {
  'repo'       : 'ButlerLAHacks/Test',
  'useragent'  : 'nejosephliu',
  'accesstoken': '0e17a29b72a33ea4c99a8f9a5ae7f8e5c0b50425'
};
 
gi.setConfig(config);
 
var issueStream = gi.fetchIssues('open|closed');
 
issueStream.on('_data', function (issue) {
  console.log(issue);
});