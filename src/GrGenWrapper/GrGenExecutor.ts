import path from "path";

import util from "util";
const exec = util.promisify(require("child_process").exec);

const setScriptLocation = (scriptFolder: string) => {
	const scriptPath = path.join(__dirname, `../${scriptFolder}`);
	return scriptPath;
};

export async function GrGen(scriptLocation: string, scriptName: string) {
	const scriptPath = setScriptLocation(scriptLocation);
	const { stdout, stderr } = await exec(`grShell -N ${scriptName}`, {
		cwd: scriptPath,
	});

	// console.log("stdout:", stdout);
	return { stdout, stderr };
}
