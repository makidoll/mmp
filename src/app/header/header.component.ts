import { Component, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { IpcService } from "../ipc.service";

interface WindowProps {
	maximized: boolean;
}

@Component({
	selector: "app-header",
	templateUrl: "./header.component.html",
	styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit, OnDestroy {
	constructor(private ipc: IpcService, private ref: ChangeDetectorRef) {}

	async changeWindow(button: "minimize" | "maximize" | "close") {
		let action = button as string;
		if (button == "maximize" && this.maximized) action = "unmaximize";

		console.log(action);
		await this.ipc.run("window.change", [action]);
	}

	drawerItems = [
		{ link: "", icon: "play_arrow" },
		{ divider: true },
		{ link: "albums", icon: "album" },
		{ link: "artists", icon: "person" },
		{ link: "songs", icon: "music_note" },
		{ divider: true },
		{ link: "settings", icon: "settings" },
	];

	maximized = false;

	windowPropsSub = null;

	ngOnInit() {
		this.windowPropsSub = this.ipc
			.listen("window.props")
			.subscribe((props: WindowProps) => {
				//console.log(props);
				this.maximized = props.maximized;
				this.ref.detectChanges();
			});
	}

	ngOnDestroy() {
		this.windowPropsSub.unsubscribe();
	}
}
