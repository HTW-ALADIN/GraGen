import { HostGraphArgs, HostGraphProviderMap, HostGraphProviders } from "../HostGraph/HostGraphProviders";
import { RNG, randomSample, statefulCounter } from "../Util";
import Graph from "../Graph";
import { DOTSerialiser } from "../Serialisation/DOTSerialiser";
import * as R from "remeda";
import { dfsFromNode } from "graphology-traversal";
import * as fs from "fs";
import { v4 as uuidv4 } from "uuid";

export interface GraphGenerationEngineArgs {
	hostGraphArgs: HostGraphArgs;
	graphLabelArgs?: GraphLabelArgs;
	graphTransformationArgs?: GraphTransformationArgs;
	seed?: string;
}

export interface GraphLabelArgs {
	[key: string]: any;
	hostGraph: string;
	schema: { nodes: Array<string> };
	application: {
		type: string;
		schemaDistribution: {
			[key: string]: number;
		};
	};
}

export interface GraphTransformationArgs {
	[key: string]: any;
	labeledGraph: string;
	populationRange: Array<number>;
}

export interface HostGraphs {
	[hostGraphName: string]: Graph;
}
export interface LabeledGraphs {
	[labeledGraphName: string]: Graph;
}

export interface ChildNodeMap {
	[key: string]: Array<string>;
}
export interface ParentNodeMap {
	[key: string]: Array<string>;
}
export interface DepthNodeMap {
	[key: number]: Array<string>;
}
export interface TransformationOrder {
	depthNodeMap: DepthNodeMap;
	childNodeMap: ChildNodeMap;
	parentNodeMap: ParentNodeMap;
}

const jsonFile = fs.readFileSync(__dirname + "/EPCPatterns.json", "utf8");
const EPCPatterns = JSON.parse(jsonFile);

export class GraphGenerationEngine {
	private hostGraphProviderMap: typeof HostGraphProviderMap;

	private hostGraphs: HostGraphs;

	private labeledGraphs: LabeledGraphs;

	private rng: RNG;

	constructor() {
		this.loadHostGraphProviders();
	}

	public generateGraph(args: GraphGenerationEngineArgs) {
		const { hostGraphArgs, graphLabelArgs, graphTransformationArgs } = args;
		const seed = args.seed != undefined ? args.seed : Math.random();
		this.rng = new RNG(seed);

		this.hostGraphs = this.provideHostGraphs(hostGraphArgs);
		this.labeledGraphs = this.generateGraphSchema(graphLabelArgs);
		const transformationOrder = this.calculateTransformationOrder(graphTransformationArgs);
		this.applyTransformationRules(graphTransformationArgs, transformationOrder);

		return { hostGraphs: this.hostGraphs, labeledGraphs: this.labeledGraphs };
	}

	private provideHostGraphs(hostGraphArgs: HostGraphArgs): HostGraphs {
		const hostGraphs = Object.entries(hostGraphArgs.hostGraphs).reduce(
			(hostGraphs, [hostGraphName, hostGraphDefinition]) => {
				const { provider, args } = hostGraphDefinition;
				const { constructorArgs, providerArgs } = args;
				const Provider = this.hostGraphProviderMap.get(provider);
				const hostGraphProvider = new Provider({ rng: this.rng, constructorArgs });

				hostGraphs[hostGraphName] = hostGraphProvider.provideHostGraph(providerArgs);
				return hostGraphs;
			},
			{} as HostGraphs
		);

		return hostGraphs;
	}

	private calculateTransformationOrder(args: GraphTransformationArgs) {
		const { labeledGraph } = args;
		const graph = this.labeledGraphs[labeledGraph].copy();

		const depthNodeMap: DepthNodeMap = {};
		const addToDepthMap = (key: string, depth: number, depthNodeMap: { [key: number]: Array<string> }) => {
			const keysAtDepth = depthNodeMap[depth] || [];
			depthNodeMap[depth] = [...keysAtDepth, key];
			return depthNodeMap;
		};

		const childNodeMap: ChildNodeMap = {};
		graph.forEachNode((node) => {
			childNodeMap[node] = graph.outboundNeighbors(node);
		});
		const parentNodeMap: ParentNodeMap = {};
		graph.forEachNode((node) => {
			parentNodeMap[node] = graph.inboundNeighbors(node);
		});

		dfsFromNode(graph, "0", (key, attributes, depth) => {
			addToDepthMap(key, depth, depthNodeMap);
		});

		return { depthNodeMap, parentNodeMap, childNodeMap };
	}

	private loadHostGraphProviders() {
		this.hostGraphProviderMap = HostGraphProviderMap;
	}

	private generateGraphSchema(graphLabelArgs: GraphLabelArgs) {
		const { hostGraph: hostGraphName, schema, application, rng } = graphLabelArgs;
		const labeledGraph = this.hostGraphs[hostGraphName].copy();

		const { schemaDistribution } = application;
		const mutableSchemaDistribution = R.clone(schemaDistribution);

		labeledGraph.forEachNode((node) => {
			const eligibleNodeTypes = Object.entries(mutableSchemaDistribution).reduce(
				(eligibleNodeTypes, [nodeType, cardinality]) => {
					if (cardinality > 0) {
						eligibleNodeTypes.push(nodeType);
					}
					return eligibleNodeTypes;
				},
				[]
			);
			const [[nodeType]] = randomSample<string>(eligibleNodeTypes, 1, false, rng);
			labeledGraph.setNodeAttribute(node, "type", nodeType);

			mutableSchemaDistribution[nodeType]--;
		});

		return { [hostGraphName]: labeledGraph };
	}

	private applyTransformationRules(args: GraphTransformationArgs, transformationOrder: TransformationOrder) {
		const { labeledGraph, populationRange } = args;
		const { depthNodeMap, parentNodeMap, childNodeMap } = transformationOrder;

		const graph = this.labeledGraphs[labeledGraph];

		const idGenerator = statefulCounter();
		const epcGraph = new Graph();

		// const eventListener = (stuff: any) => {
		// 	// !!!! DEBUG !!!!
		// 	const EPCStyle = JSON.parse(fs.readFileSync(__dirname + "/EPCShape.json", "utf8"));
		// 	const s = new DOTSerialiser(graph, { nodes: EPCStyle });
		// 	fs.writeFileSync("epc.dot", s.serialise("both"));
		// 	console.log(graph.nodes(), stuff);
		// 	// !!!! DEBUG !!!!
		// };
		// epcGraph.on("nodeAdded", eventListener);
		// epcGraph.on("edgeAdded", eventListener);
		// epcGraph.on("nodeDropped", eventListener);
		// epcGraph.on("edgeDropped", eventListener);

		let parentId = idGenerator();
		let childId = idGenerator();
		epcGraph.addNode(parentId, { type: "Event", patternTypes: ["StartEPC"], patternIds: [uuidv4()] });
		epcGraph.addNode(childId, { type: "Event", patternTypes: ["EndEPC"], patternIds: [uuidv4()] });
		let parentRequires = "Function";
		let childRequires = "Function";
		const patternIdMap: { [key: string]: string } = {};
		for (const depth of Object.keys(depthNodeMap)) {
			for (const node of depthNodeMap[Number(depth)]) {
				// only select parent and child Node and their requirements if not root node
				if (Number(depth) !== 0) {
					const [parentPatternNode] = parentNodeMap[node];
					const parentPatternId = patternIdMap[parentPatternNode];
					const edges = epcGraph.filterEdges((edge, attributes) => {
						const { eligibleEdge, patternId: currentPatternId } = attributes;
						return eligibleEdge && currentPatternId === parentPatternId;
					});
					const [[replacementEdge]] = randomSample(edges, 1, false, this.rng);

					[parentId, childId] = epcGraph.extremities(replacementEdge);
					parentRequires = this.inferPathTypeRequirement(epcGraph, parentId);
					childRequires = this.inferPathTypeRequirement(epcGraph, childId);

					epcGraph.dropEdge(replacementEdge);
				}

				const nodeType = graph.getNodeAttribute(node, "type");
				const patternId = uuidv4();
				this.constructPattern(
					epcGraph,
					nodeType,
					idGenerator,
					parentId,
					childId,
					parentRequires,
					childRequires,
					patternId,
					populationRange
				);
				patternIdMap[node] = patternId;
			}
		}

		const EPCStyle = JSON.parse(fs.readFileSync(__dirname + "/EPCShape.json", "utf8"));
		const s = new DOTSerialiser(epcGraph, { nodes: EPCStyle });
		fs.writeFileSync("epc.dot", s.serialise("both"));
	}

	private inferPathTypeRequirement(graph: Graph, nodeId: string) {
		let type = graph.getNodeAttribute(nodeId, "type");

		if (["XORGate", "ANDGate", "ORGate"].includes(type)) {
			graph.inboundNeighbors(nodeId).forEach((node) => {
				type = graph.getNodeAttribute(node, "type");
			});
		}
		return this.inferTypeRequirement(type);
	}

	private inferPathTypeRequirementOutgoing(graph: Graph, nodeId: string) {
		let type = graph.getNodeAttribute(nodeId, "type");
		if (["XORGate", "ANDGate", "ORGate"].includes(type)) {
			graph.outboundNeighbors(nodeId).forEach((node) => {
				type = graph.getNodeAttribute(node, "type");
			});
		}
		return this.inferTypeRequirement(type);
	}

	private constructPattern(
		graph: Graph,
		patternType: string,
		idGenerator: Function,
		parent: string,
		child: string,
		parentRequires: string,
		childRequires: string,
		patternId: string,
		populationRange: Array<number>
	) {
		const concreteNodeMap: { [key: string]: Array<string> } = {};

		// add nodes
		EPCPatterns[patternType].nodes.forEach((nodeSchema: { [key: string]: any }, i: number) => {
			const nodeSchemaName = Object.keys(nodeSchema)[0];
			const { type, cardinality, attributes } = nodeSchema[nodeSchemaName];

			let nodeSchemaCardinality = 1;
			if (cardinality) {
				const [min, max] = cardinality;
				nodeSchemaCardinality = this.rng.intBetween(min, max);
			}
			// const [[nodeSchemaCardinality]] = cardinality ? randomSample<number>(cardinality, 1, false, this.rng) : [[1]];
			for (let j = 0; j < nodeSchemaCardinality; j++) {
				const nodeId = idGenerator();
				graph.addNode(nodeId, { ...attributes, type, patternId, patternType });
				concreteNodeMap[nodeSchemaName] = [...(concreteNodeMap[nodeSchemaName] || []), nodeId];
			}
		});

		// add edges
		Object.entries(concreteNodeMap).forEach(([abstractNode, concreteNodes], i) => {
			if (EPCPatterns[patternType].edges[abstractNode]) {
				const abstractTargets = EPCPatterns[patternType].edges[abstractNode].target;
				const edgeAttributes = EPCPatterns[patternType].edges[abstractNode].attributes;

				concreteNodes.forEach((nodeId) => {
					abstractTargets.forEach((abstractTarget: string) => {
						concreteNodeMap[abstractTarget].forEach((concreteTarget: string) => {
							graph.addEdge(nodeId, concreteTarget, { ...edgeAttributes, patternId, patternType });
						});
					});
				});
			}
		});

		const patternNodes = EPCPatterns[patternType].nodes.reduce(
			(patternNodes: { [key: string]: object }, nodeObject: { [key: string]: object }) => {
				const [key] = Object.keys(nodeObject);
				patternNodes[key] = nodeObject[key];
				return patternNodes;
			},
			{}
		);

		// replace SEQ with actual sequence
		// only in first iteration is parent the first node
		let subParent: string = parent;
		let subParentRequires: string = parentRequires;
		let nodeIds: Array<string> = [];
		Object.entries(concreteNodeMap).forEach(([abstractNode, concreteNodes], i) => {
			// infer childRequirement for all sequence nodes between targets, so that the end node is of the same type
			let subChild: string;
			let subChildRequires: string;
			const [[requiredType]] = randomSample(["Function", "Event"], 1, false, this.rng);
			subChildRequires = this.inferTypeRequirement(requiredType);

			concreteNodes.forEach((nodeId) => {
				// ATTACH pattern child node to child node passed in function
				if (i === Object.keys(concreteNodeMap).length - 1) {
					// set childrequirement if last node
					subChild = child;
					subChildRequires = childRequires;
					// infer childRequirement based on outgoing nodes after a gate, if last node is a gate
					subChildRequires = this.inferPathTypeRequirementOutgoing(graph, subChild);

					const { type: abstractType, required } = patternNodes[abstractNode];
					if (abstractType === "SEQ") {
						this.constructSequence(
							graph,
							idGenerator,
							subParent,
							subChild,
							subParentRequires,
							subChildRequires,
							patternId,
							false,
							patternType,
							populationRange,
							required
						);

						// drop Sequence shadowNode as it has been replaced
						graph.dropNode(nodeId);
					}
				}

				if (EPCPatterns[patternType].edges[abstractNode]) {
					const abstractTargets = EPCPatterns[patternType].edges[abstractNode].target;

					// ATTACH pattern child node to pattern target node
					abstractTargets.forEach((abstractTarget: string) => {
						if (patternNodes[abstractNode]) {
							const { type: abstractType, required } = patternNodes[abstractNode];
							const edgeAttributes = EPCPatterns[patternType].edges[abstractNode].attributes;

							if (abstractType === "SEQ") {
								const { type: targetType } = patternNodes[abstractTarget];

								// infer childRequirement if not gate or another sequence
								// in case of non-gate or SEQ (Event or Function) infer requirement by concrete Node type
								if (!["XORGate", "ANDGate", "ORGate", "SEQ"].includes(targetType)) {
									subChildRequires = this.inferTypeRequirement(targetType);
								} else if (targetType === "SEQ") {
									// in case of SEQ randomize type requirement
									const [[requiredType]] = randomSample(["Function", "Event"], 1, false, this.rng);
									subChildRequires = this.inferTypeRequirement(requiredType);
								}
								concreteNodeMap[abstractTarget].forEach((concreteTarget: string) => {
									subChild = concreteTarget;

									nodeIds = this.constructSequence(
										graph,
										idGenerator,
										subParent,
										subChild,
										subParentRequires,
										subChildRequires,
										patternId,
										edgeAttributes.eligibleEdge,
										patternType,
										populationRange,
										required
									);

									// drop Sequence shadowNode as it has been replaced
									graph.dropNode(nodeId);
								});
							}
						}
					});
				}
				// set subParent for next iteration if it wasn't deleted (SEQ)
				if (graph.hasNode(nodeId) && !graph.getNodeAttribute(nodeId, "backwards")) {
					subParent = nodeId;
				}
				subParentRequires = this.inferPathTypeRequirement(graph, subParent);
			});
			// subParentRequirement is based on the type of the last node in the sequence
			subParentRequires = this.inferPathTypeRequirement(graph, subParent);
		});
	}

	private inferTypeRequirement(type: string) {
		return type == "Function" ? "Event" : "Function";
	}

	private constructSequence(
		graph: Graph,
		idGenerator: Function,
		parentId: string,
		childId: string,
		parentRequires: string,
		childRequires: string,
		patternId: string,
		eligibleEdge: boolean,
		patternType: string,
		populationRange: Array<number>,
		required: boolean
	) {
		const [min, max] = populationRange;
		let sequenceLength = this.rng.intBetween(min, max);

		let sequenceShape: Array<string> = [];
		if (sequenceLength === 0) {
			if (parentRequires === childRequires) {
				if (parentRequires === "Event") {
					sequenceShape = ["Event"];
				} else {
					sequenceShape = ["Function"];
				}
			} else if (required) {
				if (parentRequires === "Function") {
					sequenceShape = ["Function", "Event"];
				} else {
					sequenceShape = ["Event", "Function"];
				}
			}
		} else {
			sequenceShape = this.calculateSequenceShape(parentRequires, childRequires, sequenceLength);
		}
		let previousNodeId = parentId;
		let nodeId: string;

		const nodeIds: Array<string> = [];
		for (const type of sequenceShape) {
			nodeId = idGenerator();
			graph.addNode(nodeId, { type, patternId, patternType });

			graph.addEdge(previousNodeId, nodeId, { patternId, eligibleEdge, patternType });

			previousNodeId = nodeId;
			nodeIds.push(nodeId);
		}
		if (graph.hasEdge(previousNodeId, childId)) {
			graph.setEdgeAttribute(previousNodeId, childId, "eligibleEdge", eligibleEdge);
		} else {
			graph.addEdge(previousNodeId, childId, { patternId, eligibleEdge, patternType });
		}

		// if (previousNodeId !== parentId) {
		// } else if (graph.hasEdge(previousNodeId, childId)) {
		// 	graph.setEdgeAttribute(previousNodeId, childId, "eligibleEdge", eligibleEdge);
		// }

		return nodeIds;
	}

	private calculateSequenceShape(parentRequires: string, childRequires: string, sequenceLength: number) {
		const sequenceExtension = [];
		const extensionMap: { [key: string]: Array<string> } = {
			EventFunction: ["Function", "Event"],
			FunctionEvent: ["Event", "Function"],
			FunctionFunction: ["Event"],
			EventEvent: ["Function"],
			Event: ["Function", "Event"],
			Function: ["Event", "Function"],
		};
		let selectionKey = parentRequires + childRequires;
		for (let i = 0; i < sequenceLength; i++) {
			const extension = extensionMap[selectionKey];
			sequenceExtension.push(...extension);
			selectionKey = extension.at(-1);
		}
		return [parentRequires, ...sequenceExtension, childRequires];
	}
}

const seed = Math.random();
console.log(seed);

const studentParameters = {
	seed,
	XORCardinality: 0,
	ORCardinality: 0,
	ANDCardinality: 1,
	LOOPCardinality: 0,
	depth: 1,
	branchingRange: [2, 4],
	populationRange: [0, 1],
};

const engine = new GraphGenerationEngine();

const cardinality =
	studentParameters.ANDCardinality +
	studentParameters.ORCardinality +
	studentParameters.XORCardinality +
	studentParameters.LOOPCardinality;
const graph = engine.generateGraph({
	hostGraphArgs: {
		hostGraphs: {
			randomTree: {
				provider: HostGraphProviders.TreeGenerator,
				args: {
					constructorArgs: {},
					providerArgs: { cardinality: cardinality, depth: studentParameters.depth },
				},
			},
			EPC: {
				provider: HostGraphProviders.PatternGraphProvider,
				args: {
					constructorArgs: {},
					providerArgs: {
						schema: {},
					},
				},
			},
		},
	},
	graphLabelArgs: {
		hostGraph: "randomTree",
		schema: {
			nodes: ["AND", "OR", "XOR", "LOOP"],
		},
		application: {
			type: "random",
			schemaDistribution: {
				AND: studentParameters.ANDCardinality,
				OR: studentParameters.ORCardinality,
				XOR: studentParameters.XORCardinality,
				LOOP: studentParameters.LOOPCardinality,
			},
		},
	},
	graphTransformationArgs: {
		labeledGraph: "randomTree",
		populationRange: studentParameters.populationRange,
	},
});

const treeSerialiser = new DOTSerialiser(graph["hostGraphs"]["randomTree"]);
fs.writeFileSync("tree.dot", treeSerialiser.serialise());

const labeledTreeSerialiser = new DOTSerialiser(graph["labeledGraphs"]["randomTree"]);
fs.writeFileSync("labeled.dot", labeledTreeSerialiser.serialise("type"));
