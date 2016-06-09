
var express = require('express');
var morgan = require('morgan');
var BodyParser = require('body-parser');
var app = express();
var controller = require('./controller');
var port = 8889;

app.use(morgan('dev'));
// express static router
app.use(express.static('public'));
// body parser
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

// /upload router
app.route('/upload').post(function (req, res) {
  var search_text = req.body['text'];
  if (search_text === null) {
    res.writeHead(401);
    return res.send('Search text should not be empty');
  }
  controller.searchByText(search_text, function (err, data) {
    if (err) {
      res.writeHead(401);
      return res.json(err);
    }
    return res.json(data);
  });
});

// /uploadNeo
app.route('/upload_neo').post(function (req, res) {
  var search_text = req.body['text'];
  if (search_text === null) {
    res.writeHead(401);
    return res.send('Search text should not be empty');
  }
  controller.searchByCategory(search_text, function (err, data) {
    if (err) {
      res.writeHead(401);
      return res.json(err);
    }
    return res.json(data);
  });
});

app.listen(8889, function () {
  console.log('Application started on port ' + port);
  console.log('Initializing reds and redis ...');
  controller.initialize('./schools.json');
  console.log('Done');
});