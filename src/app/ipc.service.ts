import { Injectable } from "@angular/core";
import { IpcRenderer } from "electron";
import { Observable } from "rxjs";

@Injectable({
	providedIn: "root",
})
export class IpcService {
	private ipc: IpcRenderer;

	constructor() {
		this.ipc = (window as any).require("electron").ipcRenderer;
	}

	run(key: string, args?: any) {
		return new Promise<void>(resolve => {
			this.ipc.send(key, args);
			return resolve();
		});
	}

	get(key: string, args?: any) {
		return new Promise<any>(resolve => {
			this.ipc.once(key, (e, args) => {
				return resolve(args);
			});
			this.ipc.send(key, args);
		});
	}

	listen(key: string) {
		return new Observable(sub => {
			const listener = (e: Electron.IpcRendererEvent, args: any) => {
				sub.next(args);
			};

			this.ipc.on(key, listener);
			sub.add(() => {
				this.ipc.removeListener(key, listener);
			});
		});
	}
}
