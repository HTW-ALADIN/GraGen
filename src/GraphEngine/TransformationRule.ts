import uuid from "uuid";

interface GraphPattern {}

interface GraphTransformationRuleDescription {
	name: string;
	id: string;
	args: { [key: string]: any };
	searchPattern: GraphPattern;
	rewritePattern: GraphPattern;
	deletionList: Array<string>;
}

class GraphTransformationRuleFactory {
	constructor() {}

	public createGraphTransformationRule(description: GraphTransformationRuleDescription): GraphTransformationRule {
		return new GraphTransformationRule();
	}
}

class GraphTransformationRule {}
