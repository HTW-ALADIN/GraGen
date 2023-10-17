import Graph from "graphology";
import { Attributes } from "graphology-types";

export type GraphElementIdentifier = string;
export type NodeIdentifier = GraphElementIdentifier;
export type EdgeIdentifier = GraphElementIdentifier;
export type GraphIdentifier = GraphElementIdentifier;

export interface GraphElement {
	key: GraphElementIdentifier | undefined;
	attributes: Attributes;
}

export { Graph, Attributes };
