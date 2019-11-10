const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

const googleFonts =
	"Noto+Sans+JP:400,500|Roboto:400,500" + "&display=swap&subset=japanese";

const links = [
	"https://fonts.googleapis.com/css?family=" + googleFonts,
	"https://fonts.googleapis.com/icon?family=Material+Icons",
];

function getFilename(url) {
	const split = url.split("/");
	return split[split.length - 1];
}

function replaceAll(text, search, replacement) {
	return text.split(search).join(replacement);
}

(async () => {
	// remove all files in folder
	const dir = fs.readdirSync(__dirname);
	for (let file of dir) {
		if (/\.js$/i.test(file)) continue;
		fs.unlinkSync(path.join(__dirname, file));
	}

	// fill up final css
	let finalCss = "";

	for (link of links) {
		const res = await fetch(link, {
			headers: {
				//"user-agent": "Firefox 36.0", // woff
				//"user-agent": "Firefox 39.0", // woff2
				"user-agent": "Electron",
			},
		});
		const fontCss = await res.text();
		finalCss += fontCss;
	}

	// get font files and manipulate css
	const matches = finalCss.match(/url\((https?:\/\/[^]+?)\)/gi);
	for (match of matches) {
		const url = /url\((https?:\/\/[^]+?)\)/gi.exec(match)[1];
		const filename = getFilename(url);

		const res = await fetch(url);
		res.body.pipe(fs.createWriteStream(path.join(__dirname, filename)));

		finalCss = replaceAll(finalCss, url, "./" + filename);
	}

	fs.writeFileSync(path.join(__dirname, "fonts.css"), finalCss);
})();
