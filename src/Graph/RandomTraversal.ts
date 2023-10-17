import { Attributes } from "graphology-types";
import { RNG } from "../Util/RNG";
import { Graph } from "./Graph";
import { TraversalCallback, TraversalOptions } from "graphology-traversal/types";
import { TraversalFunction } from "./Traversal";

/**
 * Random traversal in the given graph using a callback function
 *
 * @param {Graph}    graph        - Target graph.
 * @param {string}   startingNode - Optional Starting node.
 * @param {function} callback     - Iteration callback.
 * @param {object}   options      - Options:
 * @param {string}     mode         - Traversal mode.
 */
export const randomTraversal: TraversalFunction = <N extends Attributes = Attributes>(
	graph: Graph<N>,
	node: unknown,
	callback: TraversalCallback<N>,
	options?: TraversalOptions,
	rng?: RNG
) => {
	// Early termination
	if (graph.order === 0) return;

	const nodes = graph.nodes();
	const randomNodes = rng.randomSample(nodes, 1, false);

	let depth = 0;
	for (const node of randomNodes) {
		const [unpackedNode] = node;
		const nodeAttributes = graph.getNodeAttributes(node);
		let stop = callback(unpackedNode, nodeAttributes, depth + 1);

		if (stop === true) continue;
	}
};
