import { GRSFileLoader } from "../../../../src/util/DataLoaders/FileLoaders/GRSFileLoader";

const loader = new GRSFileLoader("../../../EPC", "test.grs");

import { test, expect } from "@jest/globals";

test("GRSFile is loaded", () => {
	return loader.load().then((file) => {
		expect(file).toMatch(/saved by GrsExport/gi);
	});
});
