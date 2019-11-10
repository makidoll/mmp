import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { IpcService } from "./ipc.service";

@Injectable({
	providedIn: "root",
})
export class MusicService {
	songs$ = new BehaviorSubject<any[]>([]);
	albums$ = new BehaviorSubject<any[]>([]);

	async getImage(filename: string): Promise<string> {
		const image = await this.ipc.get("music.getImage", filename as any);
		return image || "";
	}

	constructor(private ipc: IpcService) {
		this.ipc.get("music.getSongs").then(songs => {
			this.songs$.next(songs);
		});

		this.ipc.get("music.getAlbums").then(async albums => {
			for (let album of albums) {
				album.image = await this.getImage(album.file);
			}
			this.albums$.next(albums);
		});
	}
}
