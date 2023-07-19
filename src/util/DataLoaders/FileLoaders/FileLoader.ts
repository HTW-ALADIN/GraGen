import { Loader } from "../Loader";

import path from "path";
const fsp = require("fs").promises;

export class FileLoader<T> extends Loader<T> {
	private readonly filePath: string;
	constructor(folderPath: string, fileName: string) {
		super();
		this.filePath = path.join(__dirname, folderPath, fileName);
	}

	public async load(): Promise<T> {
		return <T>fsp.readFile(this.filePath, { encoding: "utf8" });
	}
}
