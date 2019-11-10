import { app, BrowserWindow } from "electron";
import * as fs from "fs";
import * as path from "path";
import { initIpc } from "./ipc";

let win: BrowserWindow;

const APP_ROOT = path.join(__dirname, "/../../out/index.html");

fs.watchFile(APP_ROOT, { interval: 500 }, () => {
	if (win != null) win.loadFile(APP_ROOT);
});

const createWindow = () => {
	if (win != null) return;

	win = new BrowserWindow({
		//width: 1024,
		//height: 576,
		width: 1280,
		height: 720,
		frame: false,
		show: true,
		webPreferences: {
			nodeIntegration: true,
		},
	});
	win.setMenuBarVisibility(false);

	initIpc(win);

	win.loadFile(APP_ROOT);

	win.on("closed", () => {
		win = null;
	});
};

app.on("ready", createWindow);
app.on("activate", () => {
	if (win == null) createWindow();
});
