var fs = require('fs');
var cheerio = require('cheerio');
var uglifyjs = require('uglify-js');
var index = fs.readFileSync('../index.html').toString();
var $ = cheerio.load(index);

var scripts = $('script').map(function(i) {
	return $(this).attr('src');
}).get();

console.log("scripts", scripts);

var filesContents = scripts.map(function (file) {
	return fs.readFileSync("../"+file, 'utf8');
});

var result = uglifyjs.minify(filesContents);

if (result.error) {
	console.error("Error minifying: " + result.error);
}

fs.writeFile("../dist/pandajs.min.js", result.code, function (err) {
	if (err) {
		console.error(err);
	} else {
		console.log("File was successfully saved.");
	}
});