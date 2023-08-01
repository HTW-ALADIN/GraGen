import Graph from "../../procedural/Graph";

interface GraphStyle {
	nodes: {
		[nodeType: string]: {
			shape?: string;
			nodeStyle?: string;
			color?: string;
			bgcolor?: string;
			style?: string;
		};
	};
}

export class DOTSerialiser {
	constructor(private graph: Graph, private style?: GraphStyle) {}

	public serialise(nodeLabel: string = "name"): string {
		const nodes = this.graph.mapNodes((node, attributes) => {
			return { [node]: attributes };
		});
		const edges = this.graph.mapEdges((edge, attributes, source, target) => {
			const edgeString = `${source} -> ${target}`;
			return { [edgeString]: attributes };
		});

		const graphName = "EPC";
		return `digraph ${graphName} {\n${this.serialiseNodes(nodes, nodeLabel)}\n${this.serialiseEdges(edges)}\n}`;
	}

	private serialiseNodes(nodes: Array<{ [key: string]: { [key: string]: any } }>, nodeLabel: string) {
		const nodeStrings = [];
		for (const node of nodes) {
			const [nodeName] = Object.keys(node);
			const nodeAttributes = node[nodeName];
			const nodeAttributeString = Object.entries(nodeAttributes)
				.map(([key, value]) => {
					return `${key}="${value}"`;
				})
				.join(", ");

			let label = "";
			if (nodeLabel === "name") {
				label = nodeName;
			} else if (nodeLabel === "type") {
				label = nodeAttributes[nodeLabel];
			} else if (nodeLabel === "both") {
				label = `${nodeName}_${nodeAttributes["type"]}`;
			}

			const nodeStyle = this.style
				? Object.entries(this.style.nodes[nodeAttributes["type"]])
						.reduce((nodeStyles, [styleElement, styleValue]) => {
							nodeStyles.push(`${styleElement}="${styleValue}"`);
							return nodeStyles;
						}, [])
						.join(", ")
				: "";

			nodeStrings.push(`${nodeName} [label="${label}", ${nodeAttributeString}, ${nodeStyle}]`);
		}
		return nodeStrings.join("\n");
	}

	private serialiseEdges(edges: Array<{ [key: string]: { [key: string]: any } }>) {
		const edgeStrings = [];
		for (const edge of edges) {
			const [edgeName] = Object.keys(edge);
			const edgeAttributes = edge[edgeName];
			const edgeAttributeString = Object.entries(edgeAttributes)
				.map(([key, value]) => {
					return `${key}="${value}"`;
				})
				.join(", ");
			edgeStrings.push(`${edgeName} [${edgeAttributeString}]`);
		}
		return edgeStrings.join("\n");
	}
}
