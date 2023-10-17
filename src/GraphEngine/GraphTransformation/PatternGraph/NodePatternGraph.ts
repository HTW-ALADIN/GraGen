import {
	GraphElementPatternGraph,
	GraphElementAttributes,
	GraphElementPatternGraphArgs,
} from "./GraphElementPatternGraph";
import { Graph } from "../../../Graph/Graph";

interface NodePatternAttributes extends GraphElementAttributes {
	nodeType?: string | undefined;
}

interface NodePatternGraphArgs extends GraphElementPatternGraphArgs {
	attributes?: NodePatternAttributes;
}

export class NodePatternGraph extends GraphElementPatternGraph {
	constructor(args: NodePatternGraphArgs) {
		super(args);
	}

	public applyPatternGraph() {
		return new Graph();
	}

	protected constructPatternGraph(args: NodePatternGraphArgs) {
		return new Graph();
	}
}
