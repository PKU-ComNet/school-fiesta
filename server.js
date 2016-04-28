var http = require("http");
var url = require("url");
var queryString = require('querystring');
var postData = "";

function start(route,handler){
	function onRequest(request,response){
		var pathName = url.parse(request.url).pathname;
		console.log("Request for" + pathName +  " received.");
		request.setEncoding("utf8");

		request.addListener("data", function(postDataChunk) {
			postData += postDataChunk;
			console.log("Received POST data chunk '"+
				postDataChunk + "'.");
		});

		request.addListener("end", function() {
			postData = queryString.parse(postData);
			route(handler, pathName, response, postData);
			postData = "";
		});

	}

	http.createServer(onRequest).listen(8889);
	console.log("Server has started.");
}

exports.start = start;
