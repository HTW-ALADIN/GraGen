import fs from "fs/promises";
import path from "path";

(async () => {
	const hostGraphProviders = path.join(__dirname, "/HostGraphProviders");
	console.log(hostGraphProviders);

	const files = await fs.readdir(hostGraphProviders);
	console.log(files);
})();

const test: Array<any> = [];
["./TreeGenerator.ts"].map((file) => {
	const TreeGenerator = require(file);
	test.push(TreeGenerator);
});

console.log(test);

export {};
