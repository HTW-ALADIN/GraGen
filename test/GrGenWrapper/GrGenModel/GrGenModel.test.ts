import { GrGenModel } from "../../../src/GrGenWrapper/GrGenModel/GrGenModelWrapper";
import { GrGenNode } from "../../../src/GrGenWrapper/GrGenModel/GrGenModelNode";
import { GrGenEdge } from "../../../src/GrGenWrapper/GrGenModel/GrGenModelEdge";

import { test, expect } from "@jest/globals";

test("dummy test", () => {
	const data: { one: number; two?: number } = { one: 1 };
	data["two"] = 2;
	expect(data).toEqual({ one: 1, two: 2 });
});
