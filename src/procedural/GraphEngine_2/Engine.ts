import Graph from "../Graph";
import { HostGraphArgs, HostGraphProviderMap, HostGraphProviders } from "../HostGraph/HostGraphProviderLoader";
import { RNG, randomSample, statefulCounter } from "../Util";

export type GenericFunction<T> = (args: any) => T;

export interface GraphElementAttributes {
	[attributeIdentifier: string]: any;
}

export interface Pattern {}
export interface Patterns {
	[patternIdentifier: string]: Pattern;
}
export interface NodeType {
	attributes: GraphElementAttributes;
}
export interface NodeTypes {
	[nodeTypeIdentifier: string]: NodeType;
}
export interface EdgeType {}
export interface EdgeTypes {
	[edgeTypeIdentifier: string]: EdgeType;
}

export interface GraphSchema {
	nodeTypes: NodeTypes;
	edgeTypes: EdgeTypes;
	patterns: Patterns;
	subGraphs?: string; // SubGraphs;
}

const graphSchema: GraphSchema = {
	nodeTypes: {
		Function: { attributes: {} },
		Event: { attributes: {} },
		Gate: { attributes: { type: ["XOR", "OR", "AND"], status: ["opening", "closing"] } },
		Loop: { attributes: {} },
		XORRhombus: { attributes: {} },
		ORRhombus: { attributes: {} },
		ANDRhombus: { attributes: {} },
		EPCStart: { attributes: {} },
		EPCBody: { attributes: {} },
		EPCEnd: { attributes: {} },
		EPC: { attributes: {} },
	},
	edgeTypes: {},
	patterns: {
		EPC: {
			nodes: {
				s: {},
				b: {},
				e: {},
			},
			edges: {
				e0: {
					source: "s",
					target: "b",
				},
				e1: {
					source: "b",
					target: "e",
				},
			},
			level: 0,
		},
	},
};

export class GraphGenerationEngine {
	private hostGraphProviderMap: typeof HostGraphProviderMap;

	private hostGraphs: HostGraphs;

	private rng: RNG;

	constructor() {
		this.loadHostGraphProviders();
	}

	public generateGraph(args: GraphGenerationEngineArgs) {
		const { hostGraphArgs, seed } = args;
		this.rng = new RNG(seed);
	}

	private loadHostGraphProviders() {
		this.hostGraphProviderMap = HostGraphProviderMap;
	}
}

export interface GraphGenerationEngineArgs {
	seed: string;
	hostGraphArgs: HostGraphArgs;
}

export interface HostGraphs {
	[hostGraphName: string]: Graph;
}

const hostGraphArgs = {
	seed: 321,
	hostGraphs: [
		{
			randomTree: {
				provider: HostGraphProviders.TreeGenerator,
				args: {
					constructorArgs: {},
					providerArgs: { cardinality: 10, depth: 5 },
				},
			},
			EPC: {
				provider: HostGraphProviders.PatternGraphProvider,
				args: {
					constructorArgs: {},
					providerArgs: { pattern: "EPC" },
				},
			},
		},
	],
};
