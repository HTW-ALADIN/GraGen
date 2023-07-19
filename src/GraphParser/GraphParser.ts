import { Loader } from "../util/DataLoaders/Loader";
import { Graph } from "../Graph/Graph";

export abstract class GraphParser<T, G extends Graph> {
	/**
	 * Abstract base class for GraphExportParsers.
	 * Create your own subclass to support a new graph format.
	 *
	 * @param folderPath - The path to the folder containing the graph
	 * @param fileName - The name of the export script
	 * @returns A graph object of type Graph or a subclass of Graph
	 *
	 * @beta
	 */
	protected unparsedGraph: T;

	constructor(loader: Loader<T>) {
		loader.load().then((res) => {
			this.unparsedGraph = res;
		});
	}

	public abstract parseGraph(): G;
}
