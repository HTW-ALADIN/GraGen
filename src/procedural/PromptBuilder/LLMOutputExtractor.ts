import { matchAllToArray } from "./Util";
export const extractOutput = (s: string, prefix: string) => {
	const regexPattern = `${prefix}(.*)`;
	return matchAllToArray(s, regexPattern);
};

// testCase

// const testOutput = "Event: Website visit was initiated by a link being clicked.";
// console.log(extractOutput(testOutput, "Event: "));
