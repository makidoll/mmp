import { Socket } from "net";
import Queue from "p-queue";

export class MpdClient {
	private client = new Socket({
		allowHalfOpen: true,
	});

	connected = false;
	version = null;

	private queue = new Queue({ concurrency: 1 });

	private _getData(cmd: string): Promise<Buffer> {
		return null;
	}

	constructor(host: string, port: number) {
		this.queue.pause();
		this.client.connect(port, host, () => {
			const onDataConnected = (data: Buffer) => {
				const msg = data.toString();
				try {
					const match = msg.match(/OK MPD ([^]+?)$/);
					this.connected = true;
					this.version = match[1].trim();
					this.client.off("data", onDataConnected);
					this.queue.start();
				} catch (err) {}
			};
			this.client.on("data", onDataConnected);

			this._getData = (cmd: string): Promise<Buffer> => {
				if (this.connected == false) return null;
				return new Promise<Buffer>(resolve => {
					const onData = (data: Buffer) => {
						this.client.off("data", onData);
						return resolve(data);
					};
					this.client.on("data", onData);
					this.client.write(cmd + "\n");
				});
			};
		});
	}

	private async getData(cmd: string): Promise<Buffer> {
		return await this.queue.add(async () => {
			return await this._getData(cmd);
		});
	}

	private async getMsg(cmd: string): Promise<string> {
		return (await this.getData(cmd)).toString();
	}

	private msgToObj(infoStr: string): any {
		const lines = infoStr.split("\n");
		let info = {};

		for (let line of lines) {
			if (line.trim() == "") continue;
			const split = line.split(":");

			const key = split[0].toLowerCase();
			const value = split
				.slice(1)
				.join(":")
				.trim();

			info[key] = value;
		}

		return info;
	}

	async listAllInfo(): Promise<any[]> {
		const msg = await this.getMsg("listallinfo");
		const matches = msg.match(/(file:[^]+?)(?=file:|directory:|OK)/g);
		const files = [];

		for (let match of matches) {
			files.push(this.msgToObj(match));
		}

		return files;
	}

	private async readPictureChunk(
		filename: string,
		offset: number,
	): Promise<{ size: number; type: string; binary: number; buffer: Buffer }> {
		const filenameEscapted = '"' + filename.replace(/"/g, '\\"') + '"';
		const buffer = await this.getData(
			"readpicture " + filenameEscapted + " " + offset,
		);

		const msg = buffer.toString();
		const infoStr = msg.match(/^[^]+?binary:[^]+?\n/)[0];

		const info = this.msgToObj(infoStr);
		info.size = parseInt(info.size);
		info.binary = parseInt(info.binary);
		info.buffer = buffer.slice(
			infoStr.length,
			buffer.length - "\nOK\n".length,
		);

		return info;
	}

	private async readPicture(
		filename: string,
	): Promise<{ type: string; buffer: Buffer }> {
		const firstChunk = await this.readPictureChunk(filename, 0);

		const type = firstChunk.type;
		const size = firstChunk.size;

		let sizeLeft = size - firstChunk.binary;
		let offset = firstChunk.binary;
		let chunks = [firstChunk.buffer];

		while (sizeLeft > 0) {
			const chunk = await this.readPictureChunk(filename, offset);

			chunks.push(chunk.buffer);

			offset += chunk.binary;
			sizeLeft -= chunk.binary;
		}

		return { type, buffer: Buffer.concat(chunks) };
	}

	public async readPictureAsDataUrl(filename: string): Promise<string> {
		try {
			const image = await this.readPicture(filename);
			return (
				"data:" +
				image.type +
				";base64," +
				image.buffer.toString("base64")
			);
		} catch (err) {
			console.log(err);
			return "";
		}
	}
}

//const mpd = new MpdClient("localhost", 6600);

// mpd.readPictureAsDataUrl(
// 	"Snail's House & In Love With a Ghost - Journey.flac",
// ).then(datauri => {
// 	console.log(datauri.slice(0, 100));
// });

// mpd.listAllInfo().then(info => {
// 	console.log(JSON.stringify(info).slice(0, 100));
// });
