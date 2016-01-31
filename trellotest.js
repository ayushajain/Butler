var Trello = require("node-trello");
var t = new Trello("06de1b95fad0ac55e662a7429f9d6d1d", "c6bb2f83ff57ddf45fda2eb60434f1e8dce2bbf6745f106303a110fddb2260da");

/*t.get("/1/members/me", function(err, data) {
  if (err) throw err;
  console.log(data);
});*/
 
printBoards();

// URL arguments are passed in as an object. 
function printBoards(){
	t.get("/1/members/me", { boards: "open" }, function(err, data) {
	  if (err) throw err;

	  console.log(data);

	  var counter = 0;
	  while(true){
	  	if(data["boards"][counter] == undefined){
	  		break;
	  	}else{
	  		console.log("----------------");
	  		console.log("BOARD #" + counter + ": " + data["boards"][counter]["name"]);
	  	}

	  	counter++;
	  }
		console.log("----------------");
	  
	});
}