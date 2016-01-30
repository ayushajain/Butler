var prompt = require('prompt');
var wit = require('node-wit');
var open = require('open');
//var gi = require('github-issues');
var nodemailer = require('nodemailer');

var ACCESS_TOKEN = 'FMRINOOR6JOXN5W3LWPGBKOPUQG5CILD';

var transporter = nodemailer.createTransport('smtps://butlerlahacks%40gmail.com:testpass@smtp.gmail.com');



function sendTheEmail(recipient, subject){
	var mailOptions = {
    	from: 'The Butler <butlerlahacks@gmail.com>', // sender address
	    to: 'nejosephliu@gmail.com', // list of receivers
	    subject: 'Hello ✔', // Subject line
	    text: 'Hello world 🐴', // plaintext body
	    html: '<b>Hello world 🐴</b>' // html body
	};

	transporter.sendMail(mailOptions, function(error, info){
	    if(error){
	        return console.log(error);
	    }
	    console.log('Message sent: ' + info.response);
	});
}

prompt.start();

function hey(err, result){
	console.log('done');
	console.log('first: ' + result.username);
	getIntent(result.username);
}

prompt.get(['username'], hey);

var counter = 0;

var theIntent;

function getIntent(text){
	wit.captureTextIntent(ACCESS_TOKEN, text, function (err, res) {
	    console.log("Response from Wit for text input: ");
	    if (err) console.log("Error: ", err);
	    console.log(JSON.stringify(res, null, " "));
	    theIntent = res["outcomes"][0]["intent"];
	    //console.log('intent var: ' + JSON.stringify(theIntent));
	    var theValue = res["outcomes"][0]["entities"]["argument_text"][0]["value"]

	    obeyCommand(JSON.stringify(theIntent).substring(1, JSON.stringify(theIntent).length - 1), theValue);
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
		
	}
}

// var config = {
//   'repo'       : 'REPO',
//   'useragent'  : 'USERNAME',
//   'accesstoken': 'ACCESSTOKEN'
// };
 
// gi.setConfig(config);
 
// var issueStream = gi.fetchIssues('open|closed');
 
// issueStream.on('_data', function (issue) {
//   console.log(issue);
// });
