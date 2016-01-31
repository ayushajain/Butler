var Slack = require('slack-client');

var SLACK_TOKEN = 'xoxb-19889215429-MJPNMqleXI7RI8Dn24nEdrzd';
var SLACK_AUTORECONNECT = true;
var SLACK_AUTOMARK = true;

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

});

slack.on('error', function(err) {
     console.log(error);
});

slack.login();
