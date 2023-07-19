import { GrGen } from "../../src/GrGenWrapper/GrGenExecutor";

import { test, expect } from "@jest/globals";

test("GrGenShell is called with an existing file", () => {
	return GrGen("EPC", "singlestartEnd.grs").then(({ stdout, stderr }) => {
		expect(stdout).toMatch(/Bye!/gi);
	});
});
