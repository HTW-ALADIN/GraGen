import { GRSGraphParser } from "../../src/GraphParser/GRSGraphParser";
import { GRSFileLoader } from "../../src/util/DataLoaders/FileLoaders/GRSFileLoader";
import { test, expect } from "@jest/globals";

const loader = new GRSFileLoader("../../../EPC", "test.grs");
const parser = new GRSGraphParser(loader);

const { unparsedNodes, unparsedEdges } = parser.parseGraph();

test("parse GRS nodes", () => {
	expect(unparsedNodes).toEqual({ one: 1, two: 2 });
});

test("parse GRS edges", () => {
	expect(unparsedNodes).toEqual({ one: 1, two: 2 });
});
