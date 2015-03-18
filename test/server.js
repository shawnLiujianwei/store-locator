var loader = require("../lib/loader");
var urls = [
	"http://www.pharmacy2u.co.uk/nicotinell-21mg-24-hour-patch-step-1-p9245.html"
];

var http = require('http');
http.createServer(function(req, res) {
	res.writeHead(200, {'Content-Type': 'application/json'});
	if (req.url === '/scrape') {
		loader.details(urls, "en_gb").then(function(data) {
			res.end(JSON.stringify({
				"result": data
			}));
		}, function(result) {
			res.end(JSON.stringify({
				"message": "reject",
				"result": result
			}));
		});
	} else {
		res.end('Hello World\n');
	}

}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');