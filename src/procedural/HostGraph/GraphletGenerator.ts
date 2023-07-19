import Graph from "../Graph";
import { randomSample } from "../Util";
import {
	HostGraphGenerator,
	HostGraphGeneratorParameters,
	HostGraphGeneratorConstructorArgs,
} from "./HostGraphGenerator";

export interface GraphletGeneratorConstructorArgs extends HostGraphGeneratorConstructorArgs {}

export interface GraphletGeneratorParameters extends HostGraphGeneratorParameters {
	graphlet: number;
	depth: number;
}

export class TreeGenerator extends HostGraphGenerator implements GraphletGeneratorConstructorArgs {
	constructor(args: GraphletGeneratorConstructorArgs) {
		super(args);
	}

	protected generateGraph(args: GraphletGeneratorParameters): Graph {
		return new Graph();
	}
}
