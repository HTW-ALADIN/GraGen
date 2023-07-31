import { Attributes } from "graphology-types";
import Graph from "../../Graph";

import { HostGraphProvider, ConstructorArgs, ProviderArgs } from "../HostGraphProvider";

export interface PatternGraphProviderConstructorArgs extends ConstructorArgs {}

export interface PatternGraphProviderArgs extends ProviderArgs {
	patternName: string;
	patterns: Patterns;
}

// import from Engine.ts maybe? Or better to have a separate file?
export interface Patterns {
	[patternIdentifier: string]: Pattern;
}
export interface Pattern {}

export class PatternGraphProvider extends HostGraphProvider implements PatternGraphProviderConstructorArgs {
	constructor(args: PatternGraphProviderConstructorArgs) {
		super(args);
	}

	public provideHostGraph(args: PatternGraphProviderArgs): Graph {
		const { patternName, patterns } = args;
		return new Graph();
	}
}
