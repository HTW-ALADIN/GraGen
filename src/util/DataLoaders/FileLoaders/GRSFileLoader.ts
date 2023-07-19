import { FileLoader } from "./FileLoader";

export type GRSFile = string;

export class GRSFileLoader extends FileLoader<GRSFile> {
	public async load(): Promise<GRSFile> {
		const file = await super.load();
		return file;
	}
}
