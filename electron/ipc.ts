import { BrowserWindow, ipcMain } from "electron";
import { MpdClient } from "./mpd";

const mpd = new MpdClient("localhost", 6600);

export function initIpc(win: BrowserWindow) {
	function emitWindowProps() {
		win.webContents.send("window.props", {
			maximized: win.isMaximized(),
		});
	}

	//win.on("minimize", emitWindowProps);
	win.on("maximize", emitWindowProps);
	win.on("unmaximize", emitWindowProps);

	ipcMain.on("window.change", (e, arg) => {
		const action = arg[0];
		if (action == undefined) return;
		switch (action) {
			case "minimize":
				win.minimize();
				break;
			case "maximize":
				win.maximize();
				break;
			case "unmaximize":
				win.unmaximize();
				break;
			case "close":
				return win.close();
		}

		emitWindowProps();
	});

	// music

	ipcMain.on("music.getSongs", async (e, arg) => {
		const songs = await mpd.listAllInfo();
		win.webContents.send("music.getSongs", songs);
	});

	ipcMain.on("music.getAlbums", async (e, arg) => {
		const songs = await mpd.listAllInfo();
		let albums = {};

		for (let song of songs) {
			if (song.album != undefined) {
				if (albums[song.album] == undefined)
					albums[song.album] = {
						album: song.album,
						date: song.date,
						file: song.file,
						tracks: [],
					};

				albums[song.album].tracks.push(song);
			}
		}

		win.webContents.send("music.getAlbums", Object.values(albums));
	});

	ipcMain.on("music.getImage", async (e, arg) => {
		console.log(arg);
		const image = await mpd.readPictureAsDataUrl(arg);
		win.webContents.send("music.getImage", image);
	});
}
