const path = require('path');
const { pathToFileURL } = require('url');
const pkg = require('./package.json');

const distURLBase = `https://example.com/dist`;
const packageName = pkg.name;

const production = !process.env.ROLLUP_WATCH;
const baseUrl = !production	? path.join(__dirname, 'dist') : distURLBase;

let meta = {
    "name": production ? packageName : packageName + ' -> dev',
    "namespace": "https://takkkane.tumblr.com/scripts/mfcTagCounter",
    "version": pkg.version,
    "description": pkg.description,
	"author": pkg.author,
	"homepage": pkg.homepage,
	"supportURL": pkg.homepage,
    "resource": {
		css: pathToFileURL(path.join(baseUrl, 'bundle.css'))
	},
    "match": [
        "https://myfigurecollection.net/entry/*",
		"https://myfigurecollection.net/browse.v4.php*",
		"https://myfigurecollection.net/browse/calendar/*",

		"https://myfigurecollection.net/*",
		"https://myfigurecollection.net/item/browse/figure/",
		"https://myfigurecollection.net/item/browse/goods/",
		"https://myfigurecollection.net/item/browse/media/",
		"https://myfigurecollection.net/item/browse/calendar/*"
    ],
	"icon": "https://www.google.com/s2/favicons?sz=64&domain=myfigurecollection.net",
	"license": "MIT",
    "grant": [
        "GM_getValue",
        "GM_setValue",
        "GM_addStyle",
        "GM_getResourceText",
        "GM_xmlhttpRequest"
    ],
    "connect": [
        "github.com"
    ],
    "run-at": "document-idle"
}

if(!production){
	meta.require = [
        pathToFileURL(path.join(baseUrl, 'bundle.js'))
	]
}

if(production) {
	meta.downloadURL = pathToFileURL(path.join(baseUrl, 'bundle.js'));
	meta.updateURL = pathToFileURL(path.join(baseUrl, 'bundle.js'));
}

module.exports = meta;
