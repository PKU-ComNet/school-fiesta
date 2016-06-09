/**
 * Created by vincent on 16/6/10.
 */

function search(type, callback) {
  if (typeof type !== 'string')
    throw new Error('type should be string');
  if (typeof callback !== 'function')
    throw new Error('callback should be a function');
  // parse input parameters
  var search_url;
  var search_text = $('#searchText').val();
  switch (type) {
    case 'TEXT':
      search_url = '/upload';
      break;
    case 'CATEGORY':
      search_url = '/upload_neo';
      break;
    default:
      throw new Error('type string doesn\'t match');
  }
  // query for school data list
  $.post(search_url, { text: search_text })
    .done(function (data) { callback(null, data); })
    .error(function (error) { callback(error); });
}

function resultHandler (err, data) {
  if (err) {
    console.log('cannot query');
    return 0;
  }
  console.log('Received ' + data.length + ' number of programs');
  data.forEach(function (item) {
    
  });
}

/* Event handlers */
$('#searchByTextBtn')
  .click(function () { search('TEXT', resultHandler); });
$('#searchByCategoryBtn')
  .click(function () { search('CATEGORY', resultHandler); });
