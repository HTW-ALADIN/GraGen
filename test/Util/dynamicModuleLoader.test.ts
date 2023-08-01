import { dynamicModuleLoader } from "../../src/Util/dynamicModuleLoader";

import { test, expect } from "@jest/globals";

test("non existing dir throws error", async () => {
	await expect(dynamicModuleLoader("non existing dir")).rejects.toThrow("ENOENT: no such file or directory");
});
