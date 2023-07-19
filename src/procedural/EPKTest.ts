import Graph from "./Graph";
import { RNG, statefulCounter } from "./Util";

const idGenerator = statefulCounter();

const rootPattern = { EPK: { pattern: "Event -> EPK -> Event", contains: ["OR", "AND", "XOR", "LOOP", "SEQ"] } };

const nestablePatterns = ["OR", "AND", "XOR", "LOOP", "SEQ"];

const basePattern = [
	"ORGateOpen",
	"ORGateClosed",
	"ANDGateOpen",
	"ANDGateClosed",
	"XORGateOpen",
	"XORGateClosed",
	"Event",
	"Function",
];

const edges = ["ForwardEdge", "BackwardEdge"];

const createEPK = () => {
	const userParameters = {
		OR: 2,
		AND: 3,
		XOR: 2,
		LOOP: 1,
	};

	const graph = new Graph();

	// insert base pattern
	const parentId = idGenerator();
	graph.addNode(parentId, { type: "Event" });

	const nodeId = idGenerator();
	graph.addNode(nodeId, { type: "EPK" });
	graph.addDirectedEdge(parentId, nodeId, { type: "ForwardEdge" });

	const childId = idGenerator();
	graph.addNode(childId, { type: "Event" });
	graph.addDirectedEdge(nodeId, childId, { type: "ForwardEdge" });

	// fill EPK Pattern
	const EPKPattern = "";

	insertPattern(graph, EPKPattern, parentId, childId);
};

const translatePattern = (pattern: string) => {
	return pattern.split(" -> ");
};

const insertPattern = (graph: Graph, pattern: string, parentNodeId: string, childNodeId: string) => {
	const nodes = translatePattern(pattern);
	const nodeAmount = nodes.length;

	let previousNodeId = "";
	nodes.forEach((nodeType, index) => {
		const nodeId = idGenerator();
		graph.addNode(nodeId, { type: nodeType });

		if (index === 0) {
			// connect to parent
			graph.addDirectedEdge(parentNodeId, nodeId, { type: "ForwardEdge" });
		} else if (index === nodeAmount - 1) {
			//connect to child
			graph.addDirectedEdge(nodeId, childNodeId, { type: "ForwardEdge" });
		} else {
			graph.addDirectedEdge(previousNodeId, nodeId, { type: "ForwardEdge" });
		}

		previousNodeId = nodeId;
	});

	// remove shadow edge of parent pattern after "rewriting"
	graph.dropEdge(parentNodeId, childNodeId);
};
