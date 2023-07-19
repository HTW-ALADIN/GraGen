// interface GraphElementProperties {
// 	[key: string]: any;
// }

// interface GraphElementArgs {
// 	id?: string;
// 	attributes?: GraphElementProperties;
// }

// abstract class GraphElement {
// 	static counter = 0;
// 	protected id: string;
// 	protected attributes: GraphElementProperties;

// 	constructor(args: GraphElementArgs) {
// 		const { id, attributes } = args;
// 		id ? (this.id = id) : String(Vertex.counter++);
// 		this.attributes = attributes || {};
// 	}

// 	static resetCounter() {
// 		Vertex.counter = 0;
// 	}

// 	public getAttributes() {
// 		return this.attributes;
// 	}
// }

// class Vertex extends GraphElement {
// 	protected parents: { [id: string]: Vertex } = {};
// 	protected childs: { [id: string]: Vertex } = {};

// 	public addParents(parents: { [id: string]: Vertex }) {
// 		this.parents = { ...this.parents, ...parents };
// 	}
// 	public addChilds(childs: { [id: string]: Vertex }) {
// 		this.childs = { ...this.childs, ...childs };
// 	}
// 	public removeParent(parent: string) {
// 		delete this.parents[parent];
// 	}
// 	public removeChild(child: string) {
// 		delete this.parents[child];
// 	}
// 	public getParents() {
// 		return this.parents;
// 	}
// 	public getChilds() {
// 		return this.childs || {};
// 	}
// }
// class Edge extends GraphElement {}

// class Pattern {
// 	constructor() {}

// 	public applyPattern() {}
// }

// class Graph {}

abstract class PatternGraphElement {
	constructor(private type: string, private id: string) {}
}

abstract class PatternGraph extends PatternGraphElement {}
abstract class NodeElement extends PatternGraphElement {}
abstract class EdgeElement extends PatternGraphElement {}

interface Connection {
	[ElementType: string]: Array<typeof PatternGraphElement>;
}

class AtomicElement {
	private eligibleConnections: Connection;
}

class ShadowElement extends PatternGraphElement {}

class GraphPattern extends PatternGraphElement {
	private isCollapsed: Boolean;
}
