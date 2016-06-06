var util = require('util');
var index = require('./index');
var WordPos = require('wordpos');
var chlidProcess = require('child_process').exec;
var	wordpos = new WordPos();
var processEssay = require('./ProcessEssay');
var program_category = [0,2,1,0,0,0,0,0,1,1,1,0,0,1,2,2,2,1,0,0,0,0,0,0,0,1,0,1,1,0,0,0,0,0,0,0,0
	,0,0,0,0,0,0,1,0,0,0,0,1,2,0,0,0,0,0,0,0,0,0];

function start(response,postData){
	console.log("Request handler 'start' was called.");
	var body = '<html>' + 
		'<head>' +
		'<meta http-equiv="Content-Type" content="text/html"; ' +
		'charset=UTF-8" />' +
		'</head>' +
		'<body>' +
		'<form action="/upload" method="post">' +
		'<p>Search : <input type="text" name="text"/></p>' +
		'<input type="submit" value="Submit Text" />' +
		'</form>'+
		'<form action="/upload_neo" method="post">' +
		'<p>SearchNeo : <input type="text" name="text"/></p>' +
		'<input type="submit" value="Submit Text Neo" />' +
		'</form>' +
		'</body>' +
		'</html>';
	response.writeHead(200,{"Content-Type":"text/html"});
	response.write(body);
	response.end();
}

function upload(response,postData){
    var count = 0,redis_completion = 0;
	console.log("Request handler 'upload' was called.");
	var body = '<html>' +
		'<head>' +
		'<meta http-equiv="Content-Type" content="text/html"; ' +
		'charset=UTF-8" />' +
		'</head>' +
		'<body>' +
        '<form action="/upload" method="post">' +
        '<p>Search : <input type="text" name="text" value = "' + postData.text + '"/></p>' +
        '<input type="submit" value="Submit Text" />' +
        '</form>' +
		'<ul>';
	index.search
		.query(query = postData['text'])
		.type('or')
		.end(function(err, ids){
			if (err) throw err;
			console.log('Search results for "%s":', query);
			body += 'Search results for "' +  query + '"';
            count = ids.length;
            console.log(ids.length);
            redis_completion = 0;
			ids.forEach(function(id){
				//console.log('  - %s', index.strs[id]);
				index.client.hgetall(index.redis_key + ":essays:" + id, function (err, obj) {

                    //console.log(obj);
                    redis_completion ++;
                    if(!err) body += util.format('<li><a href = \'%s\'>%d:  - %s</a></li>',obj['url'],id, obj['name']);
                    if(redis_completion === count) {
                        body += '</ul>' +
                            '</body>' +
                            '</html>';
                        response.writeHead(200, {"Content-Type": "text/html"});
                        response.write(body);
                        response.end();
                    }
				});
			});
		});
}

function uploadNeo(response,postData){
	var count = 0,redis_completion = 0;
	var category = processEssay.predictCategory(postData['text']);
	var ids = [];
	console.log("Category Index:" + String(category));
	for(var i = 0; i < program_category.length;i++){
		if(program_category[i] == category)
		    ids.push(i);
	}
    count = ids.length;
	console.log("Request handler 'upload_neo' was called.")
	var body = '<html>' +
		'<head>' +
		'<meta http-equiv="Content-Type" content="text/html"; ' +
		'charset=UTF-8" />' +
		'</head>' +
		'<body>' +
		'<form action="/upload_neo" method="post">' +
		'<p>Search : <input type="text" name="text" value = "' + postData.text + '"/></p>' +
		'<input type="submit" value="Submit Text" />' +
		'</form>' +
		'<ul>';
	ids.forEach(function(id){
		//console.log('  - %s', index.strs[id]);
		index.client.hgetall(index.redis_key + ":essays:" + id, function (err, obj) {

			//console.log(obj);
			redis_completion ++;
			if(!err) body += util.format('<li><a href = \'%s\'>%d:  - %s</a></li>',obj['url'],id, obj['name']);
			if(redis_completion === count) {
				body += '</ul>' +
					'</body>' +
					'</html>';
				response.writeHead(200, {"Content-Type": "text/html"});
				response.write(body);
				response.end();
			}
		});
	});

}

exports.start = start;
exports.upload = upload;
exports.uploadNeo = uploadNeo;
