import { GraphParser } from "./GraphParser";
import { GRSFile } from "../util/DataLoaders/FileLoaders/GRSFileLoader";
import { Graph } from "../Graph/Graph";

export class GRSGraphParser extends GraphParser<GRSFile, Graph> {
	public parseGraph(): Graph {
		for (let line of this.unparsedGraph.split("\n")) {
            if (line.split("\s")[0])
		}

		const parts = this.splitSections(this.unparsedGraph);

		return parts;
	}

	private splitSections(graph: GRSFile) {
		const nodes = graph.split(/^new graph .*\\n/);
		const edges = "";
		return { unparsedNodes: nodes, unparsedEdges: edges };
	}

	private parseNodes(graph: GRSFile) {
        const nodeRegex =  /(new)\s(:\w*?)(\(.*\))/g
        const edgeRegex =  /(new)\s(:\w*?)(\(.*\))/g
    }
}
