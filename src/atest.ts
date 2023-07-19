type propertyName = string;
type propertyType = any;

interface BaseClass {
	[key: propertyName]: propertyType;
}

export type Constructor<T> = { new (...args: Array<any>): T };

type properties = Array<propertyName>;
type propertyTypes = Array<propertyType>;

class BaseClass implements BaseClass {}

export function createClass<P extends properties, PT extends propertyTypes>(...properties: P) {
	return class extends BaseClass {
		constructor(...values: PT) {
			super();
			for (const [index, property] of properties.entries()) {
				this[property] = values[index];
			}
		}
	} satisfies BaseClass;
}

const t = { nodes: "", edges: "" };
let r: keyof typeof t;

type GraphParameters = Array<typeof r>;
type GraphValues = [Array<string>, string];

const DiGraph = createClass<GraphParameters, GraphValues>("nodes", "edges");

const graph = new DiGraph([""], "one");

console.log(DiGraph);
