function route(handler,pathName,response,postData){
	console.log("About to route a request for " + pathName + " and Data:" + postData);
	if(typeof handler[pathName] === 'function'){
		handler[pathName](response,postData);
	} else {
		console.log("No request handler found for " + pathName);
		response.writeHead(404,{"Content-Type":"text/plain"});
		response.write("404 NOT FOUND");
		response.end();
	}
}

exports.route = route;
