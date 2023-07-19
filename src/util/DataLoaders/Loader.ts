export abstract class Loader<T> {
	public abstract load(): Promise<T>;
}
