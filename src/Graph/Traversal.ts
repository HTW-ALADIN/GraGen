import { dfsFromNode, bfsFromNode } from "graphology-traversal";
import { Attributes } from "graphology-types";
import { RNG } from "../Util/RNG";
import { Graph } from "./Graph";
import { TraversalCallback, TraversalOptions } from "graphology-traversal/types";
import { randomTraversal } from "./RandomTraversal";

export type TraversalFunction<N extends Attributes = Attributes> = (
	graph: Graph<N>,
	node: unknown,
	callback: TraversalCallback<N>,
	options?: TraversalOptions,
	rng?: RNG
) => void;

export enum TraversalType {
	TransformDepthFirst = "dfs",
	TransformBreathFirst = "bfs",
	TransformRandom = "random",
}

export const TraversalMethods = new Map<TraversalType, TraversalFunction>([
	[TraversalType.TransformDepthFirst, dfsFromNode],
	[TraversalType.TransformBreathFirst, bfsFromNode],
	[TraversalType.TransformRandom, randomTraversal],
]);

export { Attributes, TraversalCallback, TraversalOptions };
