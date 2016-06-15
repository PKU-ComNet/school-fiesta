/**
 * Created by vincent on 16/6/7.
 */

/* reds and redis service */
var reds = require('./reds');
var redis = require("redis");
var redis_key = "schoolFiesta1"
var fs = require('fs');
var async = require('async');

/* other modules */
var ProcessEssay = require('./ProcessEssay');

/* Controller class */
var Controller = function () {
  this.search = reds.createSearch(redis_key);
  this.client = redis.createClient(process.env.REDIS_URL);
};

Controller.prototype.initialize = function (json_file_name) {
  var schools = JSON.parse(fs.readFileSync(json_file_name));
  var count = 0;
  var string_list = [];
  
  var _search = this.search;
  var _client = this.client;

  ProcessEssay.initKeywordList();
  
  // initialize client
  schools['schools'].forEach(function (school_info) {
    var name = school_info["name"];
    var programs = school_info["progs"];
    programs.forEach(function (program_info) {
      // hot patch
      program_info.school_name = school_info['name'];
      _client.hmset(redis_key  + ":essays:" + (count++), program_info);
      string_list.push(program_info['text'].toLowerCase());
    });
  });
  string_list.forEach(function (str, i) { 
    _search.index(str, i, null); 
  });
  _search.remove(2);
};

// helpers
Controller.prototype.searchByIndex = function (ids, callback) {
  // finished search
  var _client = this.client;
  var result = [];
  async.forEachOf(ids, function (val, key, cb) {
    var id = val;
    var client_key = redis_key + ":essays:" + id;
    _client.hgetall(client_key, function (err, obj) {
      if (err)
        return cb(err);
      // if no error, add a new entry to the list
      var url = obj['url'];
      var name = obj['name'];
      var school_name = obj['school_name']
      result.push({ 
        id: id, 
        url: url,
        name: name,
        school_name: school_name });
      return cb(null);
    });
  }, function (err) {
    if (err)
      return callback(err);
    callback(null, result);
  }); 
};

Controller.prototype.searchByText = function (data, callback) {
  var self = this;  
  self.search.query(query = data).type('or').end(function (err, ids) {
    if (err) 
      return callback(err);
    
    self.searchByIndex(ids, callback); 
  });
};

Controller.prototype.searchByCategory = function (data, callback) {
  var program_category = [0,2,1,0,0,0,0,0,1,1,1,0,0,1,2,2,2,1,0,0,0,0,0,0,0,1,0,1,1,0,0,0,0,0,0,0,0
    ,0,0,0,0,0,0,1,0,0,0,0,1,2,0,0,0,0,0,0,0,0,0];
  var category = ProcessEssay.predictCategory(data);
  var ids = [];
  for (var i = 0; i < program_category.length; i++)
    if (program_category[i] == category)
      ids.push(i);
  
  // call inner search
  this.searchByIndex(ids, callback); 
};

module.exports = new Controller();
