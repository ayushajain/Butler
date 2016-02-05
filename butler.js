"use strict";

//Imported Modules
var mailer = require('node-mailer');
var wit = require('node-wit');
var jsonfile = require('jsonfile');
var Firebase = require('firebase');
var Slack = require('slack-client');

class Butler {

	contstructor() {
		loadData();
	}


	loadData() {
		jsonfile.readFile(".butler.json", function(err, obj){
			if(err)
				console.log(err);
			else
				this.data = obj;
		});

	}

	writeData() {
		this.data = {
			members: {},
			teams: {},
			tasks: {},
			api: {
				wit: this.WIT_API_KEY,
				github: this.GITHUB_API_KEY,
				trello: this.TRELLO_API_KEY,
			}
		}

		jsonfile.writeFile(".butler.json", this.data, function(err) {
			console.log(err);
		});
	}

}

module.exports = Butler;
