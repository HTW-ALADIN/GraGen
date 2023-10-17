import fs from "fs/promises";
import path from "path";
import { Constructor } from "../Types/Constructor";

export interface Classes {
	[className: string]: Constructor;
}

export const dynamicModuleLoader = async (dir: string) => {
	const modules = await fs.readdir(dir);

	return modules.reduce((modulesClasses, moduleName) => {
		const modulePath = path.join(dir, moduleName);
		const moduleClasses = require(modulePath);

		modulesClasses = { ...modulesClasses, ...moduleClasses };
		return modulesClasses;
	}, {} as Classes);
};
