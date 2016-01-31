
var GitHubApi = require("github");

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

github.authenticate({
    type: "oauth",
    token: "0e17a29b72a33ea4c99a8f9a5ae7f8e5c0b50425"
});

console.log(github.issues.getAll({}, function(err, result){
	console.log('The result is: ' + result);
}));


/*console.log(github.issues.getRepoIssue({user: "ButlerLAHacks", repo: "Test", number: 1}, function(err, result){
	console.log(result);
}));*/

//console.log(github.issues.getRepoIssue("nejosephliu", "Test"));