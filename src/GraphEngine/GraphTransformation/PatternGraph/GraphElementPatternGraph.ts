import { PatternGraph, PatternGraphArgs, PatternGraphShape } from "./PatternGraph";
import { Graph, Attributes, GraphElementIdentifier } from "../../../Graph/Graph";

export interface GraphElementAttributes extends Attributes {}

export interface GraphElementPatternGraphArgs extends PatternGraphArgs {
	identifier?: GraphElementIdentifier;
	attributes?: GraphElementAttributes;
}

export class GraphElementPatternGraph extends PatternGraph {
	constructor(args: GraphElementPatternGraphArgs) {
		super(args);
	}

	public applyPatternGraph() {
		return new Graph();
	}

	protected constructPatternGraph(args: GraphElementPatternGraphArgs): PatternGraphShape {
		return this.patternGraph;
	}
}
