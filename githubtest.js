
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



printPullRequests("ayushajain", "Butler");

function printPullRequests(user, repo){
    console.log(github.pullRequests.getAll({user: user, repo: repo}, function(err, result){
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
        
    }));
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
>>>>>>> test_branch
        while(true){
            //console.log("THE TITLE IS: " + the_title);
            var issue_object = result[counter];//["title"];
            if(issue_object == undefined){
                break;
            }else{
                console.log("ISSUE #: " + (counter));
>>>>>>> test_branch
                console.log("THE TITLE IS: " + issue_object["title"]);
                console.log("THE BODY IS: " + issue_object["body"]);
                console.log("THE USER IS: " + issue_object["user"]["login"]);
                console.log("THE LINK IS: " + issue_object["url"]);
                console.log("THE NUMBER IS: " + issue_object["number"]);
            }

            console.log("---------------------");
>>>>>>> test_branch
            counter += 1;
        }
        
    });
}

>>>>>>> test_branch

printPullRequests("ayushajain", "Butler");

function printPullRequests(user, repo){
    github.pullRequests.getAll({user: user, repo: repo, direction:"asc"}, function(err, result){
        console.log(result);
    });
}
