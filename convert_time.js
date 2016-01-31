convertTimeStamp("2016-01-31T09:00:00.000-08:00");



function convertTimeStamp(time){
	var year = "";
	for(var i = 0; i < 4; i++){
		year += time.charAt(i);
	}

	var month = "";
	for(var i = 5; i < 7; i++){
		month += time.charAt(i);
	}

	var date = "";
	for(var i = 8; i < 10; i++){
		date += time.charAt(i);
	}

	var hour = "";
	for(var i = 11; i < 13; i++){
		hour += time.charAt(i);
	}

	var minute = "";
	for(var i = 14; i < 16; i++){
		minute += time.charAt(i);
	}

	var second = "";
	for(var i = 17; i < 19; i++){
		second += time.charAt(i);
	}



	console.log(month + "/" + date + "/" + year + " | " + hour + ":" + minute + ":" + second);
	//console.log(hour + ":" + minute + ":" + second);



}