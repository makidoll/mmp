import { Component, OnInit } from "@angular/core";
import { MusicService } from "../music.service";

@Component({
	selector: "app-songs",
	templateUrl: "./songs.component.html",
	styleUrls: ["./songs.component.scss"],
})
export class SongsComponent implements OnInit {
	songs$ = this.music.songs$;

	constructor(private music: MusicService) {}

	ngOnInit() {}
}
