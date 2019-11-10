import { Component, OnInit } from "@angular/core";
import { MusicService } from "../music.service";

@Component({
	selector: "app-albums",
	templateUrl: "./albums.component.html",
	styleUrls: ["./albums.component.scss"],
})
export class AlbumsComponent implements OnInit {
	songs$ = this.music.songs$;
	albums$ = this.music.albums$;
	getImage = this.music.getImage;

	constructor(private music: MusicService) {}

	ngOnInit() {}
}
