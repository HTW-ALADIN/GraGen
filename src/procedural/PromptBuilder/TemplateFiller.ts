import { matchAllToArray } from "./Util";
const getVariables = (s: string) => {
	// {{variable}} -> regex means: "nothing but space" inside double curly braces
	return matchAllToArray(s, "{{([^ ]+)}}");
};
const shiftSet = <T = string>(set: Set<T>) => {
	for (const value of set) {
		set.delete(value);
		return value;
	}
};
export const fillTemplate = (
	template: string,
	valueObject: { [key: string]: string[] } = {},
	concatWith: string = " "
) => {
	let output = template;
	let variables: Set<string> = new Set(getVariables(template) ?? []);
	while (variables.size) {
		const key = shiftSet(variables);
		if (!Object.hasOwn(valueObject, key)) {
			throw new Error(`Key: ${key} not found in object: ${valueObject}`);
		}
		const values = valueObject[key];

		output = output.replace(new RegExp(`{{${key}}}`, "g"), values.join(concatWith));
		variables = new Set([...variables, ...getVariables(output)]);
	}
	return output;
};

// nested TestCase

// const template = "stuff {{stuff}} to {{bluff}}";
// const variables = {
// 	nuff: ["nuff"],
// 	stuff: ["tuff {{tuff}} to tuff"],
// 	bluff: ["bluff {{tuff}} to bluff"],
// 	tuff: ["{{nuff}}"],
// };

// console.log(fillTemplate(template, variables));
