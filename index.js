var server = require("./server");
var router = require("./router");
var processEssay = require('./ProcessEssay');
var requestHandlers = require("./requestHandlers");
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var reds = require('reds');
var redis = require("redis");
var redis_key = "schoolFiesta1"
var search = reds.createSearch(redis_key);
var client = redis.createClient();
var fs = require('fs');

var schoolObj = JSON.parse(fs.readFileSync('./schools.json'))
var schoolInfo,programs,programInfo,name;
var count = 0;
var strs = [];

//test.process('./essays/data_mining1.txt');
//processEssay.run();
processEssay.initKeywordList();
for(var schoolIndex in schoolObj["schools"]) {
    schoolInfo = schoolObj["schools"][schoolIndex];
    name = schoolInfo["name"];
    programs = schoolInfo["progs"];
    for(var programIndex in programs) {
        programInfo = programs[programIndex];
        client.hmset(redis_key  + ":essays:" + (count++),programInfo);
        strs.push(programInfo['text']);
        console.log(name + " & " + programInfo['name'] + " & " + programInfo['url'] + " \\\\");
        //console.log("count:" + count + " text:" + programInfo['text']);
    }
}
//var vectors = processEssay.run();
console.log(2);

strs.forEach(function(str, i){ search.index(str,i); });

search.remove(2);

//var url = 'mongodb://localhost:27017/test';
//MongoClient.connect(url, function(err,db) {
//	assert.equal(null,err);
//	console.log("Connected correctly to server.");
//	db.close;
//});

var handler = {};
handler["/"] = requestHandlers.start;
handler["/start"] = requestHandlers.start;
handler["/upload"] = requestHandlers.upload;
handler["/upload_neo"] = requestHandlers.uploadNeo;

server.start(router.route,handler);
/**/
exports.search = search;
exports.strs = strs;
exports.client = client;
exports.redis_key = redis_key;
