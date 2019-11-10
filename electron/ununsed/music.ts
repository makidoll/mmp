import * as fs from "fs";
import * as path from "path";
import { parseFile, IAudioMetadata } from "music-metadata";
import * as JSZip from "jszip";
import { parseBuffer } from "music-metadata/lib/core";

export enum MusicType {
	SINGLE = "single",
	ALBUM = "album",
}

export interface Art {
	dataUrl: string;
}

export interface Single {
	type: MusicType.SINGLE;
	title: string;
	artist: string;
	year: number;
	art: Art | null;
	path: string;
}

export interface AlbumTrack {
	number: number;
	title: string;
	path: string;
}

export interface Album {
	type: MusicType.ALBUM;
	title: string;
	artist: string;
	year: number;
	art: Art | null;
	path: string;
	tracks: AlbumTrack[];
}

function getExt(filename: string): string {
	const split = filename.split(".");
	return split[split.length - 1].toLowerCase();
}

function getArtFromMetadata(metadata: IAudioMetadata): Art | null {
	if (metadata.common.picture.length > 0) {
		const picture = metadata.common.picture[0];

		return {
			dataUrl:
				"data:" +
				picture.format +
				";base64," +
				picture.data.toString("base64"),
		} as Art;
	}
	return null;
}

async function getSingleFromMetadata(
	filePath: string,
	metadata: IAudioMetadata,
): Promise<Single | null> {
	try {
		const single = {
			type: MusicType.SINGLE,
			title: metadata.common.title,
			artist: metadata.common.artist,
			year: metadata.common.year,
			art: getArtFromMetadata(metadata),
			path: filePath,
		} as Single;
		return single;
	} catch (err) {
		return null;
	}
}

async function getSingleFromFilePath(filePath: string): Promise<Single | null> {
	try {
		const metadata = await parseFile(filePath);
		return await getSingleFromMetadata(filePath, metadata);
	} catch (err) {
		return null;
	}
}

async function getAlbumFromZip(zipFilePath: string): Promise<Album | null> {
	try {
		const zipLoader = new JSZip();
		const zipData = fs.readFileSync(zipFilePath);
		const zip = await zipLoader.loadAsync(zipData);

		let tracks: AlbumTrack[] = [];
		let album: Album = {
			type: MusicType.ALBUM,
			title: null,
			artist: null,
			year: null,
			art: null,
			path: zipFilePath,
			tracks,
		};
		let gotAlbumInfo = false;

		for (let fileName in zip.files) {
			try {
				const file = zip.files[fileName];

				const metadata = await parseBuffer(
					await file.async("nodebuffer"),
				);

				if (gotAlbumInfo == false) {
					album.title = metadata.common.album;
					album.artist = metadata.common.albumartist;
					album.year = metadata.common.year;
					album.art = getArtFromMetadata(metadata);

					gotAlbumInfo = true;
				}

				const albumTrack = {
					number: metadata.common.track.no,
					title: metadata.common.title,
					path: file.name,
				};

				tracks.push(albumTrack);
			} catch (err) {
				continue;
			}
		}

		return album;
	} catch (err) {
		return null;
	}
}

export async function getMusic(dir: string): Promise<(Single | Album)[]> {
	const musicDir = fs.readdirSync(dir);
	const foundMusic: (Single | Album)[] = [];

	for (let filename of musicDir) {
		const fileExt = getExt(filename);
		const filePath = path.join(dir, filename);

		console.log(filePath);

		if (fileExt == "zip") {
			const album = await getAlbumFromZip(filePath);
			if (album == null) continue;
			foundMusic.push(album);
			continue;
		} else {
			const track = await getSingleFromFilePath(filePath);
			if (track == null) continue;
			foundMusic.push(track);
			continue;
		}
	}

	return foundMusic;
}

getMusic("/home/maki/Files/Files/Music").then(music => {
	//console.log(music);
	fs.writeFileSync("./music.json", JSON.stringify(music, null, 4));
});
