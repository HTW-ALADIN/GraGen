import { Attributes as NodeAttributes } from "graphology-types";

const AND = (conditions: any) => {
	return conditions.every((condition: any) => condition);
};

const OR = (conditions: any) => {
	return conditions.some((condition: any) => condition);
};

const XOR = (conditions: any) => {
	return conditions.reduce((result: boolean, a: any, b: any) => {
		return result;
	}, false);
};

const equals = <T = any>(a: T, b: T) => a === b;

const unequals = <T = any>(a: T, b: T) => a !== b;

const resolveCondition = (condition: any) => {};

type LogicalOperation = "AND" | "OR" | "XOR";

interface ConditionGroup {
	leftCondition: ConditionGroup | Condition;
	logicalOperation?: LogicalOperation;
	rightCondition?: ConditionGroup | Condition;
}

export interface Conditions {
	[conditionName: string]: () => Condition;
}
// TODO: make generic after monday
export interface Condition {
	field: string;
	equals: string;
	AND?: Condition;
}

export const nodeTypeConditions: Conditions = {
	startCondition: () => ({
		field: "patternType",
		equals: "StartEPC",
	}),
	endCondition: () => ({
		field: "patternType",
		equals: "EndEPC",
	}),
	openAndCondition: () => ({
		field: "type",
		equals: "ANDGate",
		AND: {
			field: "status",
			equals: "opening",
		},
	}),
	closingAndCondition: () => ({
		field: "type",
		equals: "ANDGate",
		AND: {
			field: "status",
			equals: "closing",
		},
	}),
	openXORCondition: () => ({
		field: "type",
		equals: "XORGate",
		AND: {
			field: "status",
			equals: "opening",
		},
	}),
	closingXORCondition: () => ({
		field: "type",
		equals: "XORGate",
		AND: {
			field: "status",
			equals: "closing",
		},
	}),
	openORCondition: () => ({
		field: "type",
		equals: "ORGate",
		AND: {
			field: "status",
			equals: "opening",
		},
	}),
	closingORCondition: () => ({
		field: "type",
		equals: "ORGate",
		AND: {
			field: "status",
			equals: "closing",
		},
	}),
};

export const patternTypeConditions: Conditions = {
	loopCondition: () => ({
		field: "patternType",
		equals: "LOOP",
	}),
	xorCondition: () => ({
		field: "patternType",
		equals: "XOR",
	}),
	orCondition: () => ({
		field: "patternType",
		equals: "OR",
	}),
	andCondition: () => ({
		field: "patternType",
		equals: "AND",
	}),
};

// TODO: fix this?
export const evalCondition = (condition: Condition, conditionName: string, nodeAttributes: NodeAttributes) => {
	const { field, equals, AND } = condition;
	let conditionIsTruthy = false;

	if (AND) {
		const nestedField = AND.field;
		const nestedEquals = AND.equals;
		if (nodeAttributes[field] === equals && nodeAttributes[nestedField] === nestedEquals) {
			conditionIsTruthy = true;
		}
	}
	// console.log(field, nodeAttributes, equals);
	if (nodeAttributes[field] === equals) {
		conditionIsTruthy = true;
	}

	if (conditionIsTruthy) {
		return conditionName;
	}
	return "";
};
