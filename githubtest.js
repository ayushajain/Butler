
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






/*console.log(github.pullRequests.get({user: "ayushajain", repo: "Butler", number: 1}, function(err, result){
    console.log(result);
}));*/


/*console.log(github.repos.getCollaborators({user: "nejosephliu", repo: "Youth_Directory_Repo", number: 1}, function(err, result){
	console.log(result);
}));*/




//printRepoIssues("ButlerLAHacks", "Test");

function printRepoIssues(user, repo){
    github.issues.repoIssues({user: user, repo: repo, sort:"updated", direction: "asc"}, function(err, result){
        console.log("--------------");


        var counter = 0;
        while(true){
            //console.log("THE TITLE IS: " + the_title);
            var issue_object = result[counter];//["title"];
            if(issue_object == undefined){
                break;
            }else{
                console.log("ISSUE #: " + (counter + 1));
                console.log("THE TITLE IS: " + issue_object["title"]);
                console.log("THE BODY IS: " + issue_object["body"]);
                console.log("THE USER IS: " + issue_object["user"]["login"]);
                console.log("THE LINK IS: " + issue_object["url"]);
                console.log("THE NUMBER IS: " + issue_object["number"]);
            }

            console.log("---------------------")
            counter += 1;
        }
        
    });
}

printPullRequests("ayushajain", "Butler");

function printPullRequests(user, repo){
    github.pullRequests.getAll({user: user, repo: repo, direction:"asc"}, function(err, result){
        console.log(result);
    });
}