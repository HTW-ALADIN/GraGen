import { Graph, GraphElement, GraphIdentifier } from "../../../Graph/Graph";

export interface PatternGraphArgs {
	hostGraph: GraphIdentifier;
	patternGraph: PatternGraphShape;
}

export type PatternGraphShape = Graph | GraphElement;

export abstract class PatternGraph {
	protected patternGraph: PatternGraphShape;

	constructor(args: PatternGraphArgs) {
		this.patternGraph = this.constructPatternGraph(args);
	}

	public abstract applyPatternGraph(): Graph;

	protected abstract constructPatternGraph(args: PatternGraphArgs): PatternGraphShape;
}
