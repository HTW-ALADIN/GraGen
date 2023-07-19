import Graph from "../Graph";
import { randomSample } from "../Util";
import {
	HostGraphGenerator,
	HostGraphGeneratorParameters,
	HostGraphGeneratorConstructorArgs,
} from "./HostGraphGenerator";

export interface TreeGeneratorConstructorArgs extends HostGraphGeneratorConstructorArgs {}

export interface TreeGeneratorParameters extends HostGraphGeneratorParameters {
	cardinality: number;
	depth: number;
}

export class TreeGenerator extends HostGraphGenerator implements TreeGeneratorConstructorArgs {
	constructor(args: TreeGeneratorConstructorArgs) {
		super(args);
	}

	protected generateGraph(args: TreeGeneratorParameters): Graph {
		const { cardinality, depth } = args;

		if (depth > cardinality) {
			throw new Error("Depth must be smaller than cardinality");
		}
		if (depth < 2 && cardinality > 1) {
			throw new Error("Depth must be at least 2, when cardinality is greater than 1");
		}

		const maxBranches = cardinality / (depth - 1);

		const rootId = this.idGenerator();
		const leaves = new Set<string>();
		leaves.add(rootId);

		const tree = new Graph();
		tree.addNode(rootId, { depth: 1 });
		let branches = 1;

		for (let i = 0; i < cardinality - 1; i++) {
			let validNode = false;
			let randomNodeId: string;
			do {
				if (this.isBranchingAllowed(maxBranches, branches)) {
					[[randomNodeId]] = randomSample(tree.nodes(), 1, false, this.rng);
					if (tree.getNodeAttribute(randomNodeId, "depth") <= depth - 1) {
						validNode = true;
					}
				} else {
					[[randomNodeId]] = randomSample(Array.from(leaves), 1, false, this.rng);
					validNode = true;
				}
			} while (validNode === false);

			const newNodeId = this.idGenerator();
			tree.addNode(newNodeId, { depth: tree.getNodeAttribute(randomNodeId, "depth") + 1 });
			tree.addEdge(randomNodeId, newNodeId);

			leaves.add(newNodeId);
			if (leaves.has(randomNodeId)) {
				leaves.delete(randomNodeId);
			} else {
				branches++;
			}
		}

		return tree;
	}

	private isBranchingAllowed(maxBranches: number, branches: number) {
		return maxBranches - branches >= 0;
	}
}
