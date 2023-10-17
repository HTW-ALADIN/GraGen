export const matchAllToArray = (s: string, regexPattern: string) => {
	const regexp = new RegExp(regexPattern, "g");
	return [...s.matchAll(regexp)].map((match) => match[1]);
};
