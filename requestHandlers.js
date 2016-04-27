var util = require('util');
var index = require('./index');
var WordPos = require('wordpos');
var	wordpos = new WordPos();

function start(response,postData){
	console.log("Request handler 'start' was called.");
	var body = '<html>' + 
		'<head>' +
		'<meta http-equiv="Content-Type" content="text/html"; ' +
		'charset=UTF-8" />' +
		'</head>' +
		'<body>' +
		'<form action="/upload" method="post">' +
		'<textarea name="text" rows="20" cols="60"></textarea>' +
		'<input type="submit" value="Submit Text" />' +
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
		'<ul>';
	index.search
		.query(query = postData['text'])
		.type('or')
		.end(function(err, ids){
			if (err) throw err;
			console.log('Search results for "%s":', query);
			body += 'Search results for "' +  query + '"';
            count = ids.length;
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

exports.start = start;
exports.upload = upload;
