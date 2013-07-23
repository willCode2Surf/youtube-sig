//npm install jsdom

var fs = require('fs');
var ht = require('http');
var jsdom = require("jsdom").jsdom;

//setup some "browser" hooks.
document = jsdom("<html><head></head><body>hello world</body></html>");
window = document.createWindow();
screen = window.screen;
navigator = window.navigator;
HTMLMediaElement = null;

//a vid to grab the html5video javascript code from
var seedvideo = "http://www.youtube.com/watch?v=QvKSP5gllz8";

ht.getAll = function(url, callback) {
  ht.get(url, function(res) {
    res.resume();
    res.setEncoding('utf8');
    var data = "";
    res.on('data', function(c) {
      data += c;
    });
    res.on('end', function() { callback(data); });
  });
};

//end fast if we have a lot of errors...and we will.
var success = 0;
var fail = 0;
process.on('uncaughtException', function() {
  fail++;
  if(fail > 100 && success > 0) {
    endCallback();
    process.kill();
  }
});
var returnObj = {
  url: ""
  ,methods: []
};
likelyCallback = function(funcName, func) {
  success++;
  returnObj.methods.push({
    func: funcName
    ,code: func.toString()
  });
};

maybeCallback = function(funcName, func) {};

endCallback = function() {
  console.log(JSON.stringify(returnObj));
};

ht.getAll(seedvideo, function(data) {
  var regex = /(http:[^"]+html5player.+\.js)/i;
  returnObj.url = require('querystring').unescape(data.match(regex)[0]).replace(/\\\//ig, "/");
  ht.getAll(returnObj.url, function(ojs) {
    var mod = ojs.replace(/\}\)\(\);\n$/, fs.readFileSync('./libs/injection.js') + "})();");
    eval(mod);
  });
});
