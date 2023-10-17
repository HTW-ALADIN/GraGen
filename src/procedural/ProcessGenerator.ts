import { GraphGenerationEngine } from "./Engine_old";
import { HostGraphProviders } from "./HostGraph/HostGraphProviders";
import { DOTSerialiser } from "../Graph/Serialisation/DOTSerialiser";
import * as fs from "fs";

import { ModellPromptHandler, UserPromptTemplates } from "./PromptBuilder/PromptBuilder";

// TODO: extract TESTCASE
const seed = Math.random();

const studentParameters = {
	seed,
	XORCardinality: 1,
	ORCardinality: 1,
	ANDCardinality: 1,
	LOOPCardinality: 1,
	depth: 4,
	branchingRange: [2, 4],
	populationRange: [0, 1],
};

const engine = new GraphGenerationEngine();

const cardinality =
	studentParameters.ANDCardinality +
	studentParameters.ORCardinality +
	studentParameters.XORCardinality +
	studentParameters.LOOPCardinality;

const graph = engine.generateGraph({
	hostGraphArgs: {
		hostGraphs: {
			randomTree: {
				provider: HostGraphProviders.TreeGenerator,
				args: {
					constructorArgs: {},
					providerArgs: { cardinality: cardinality, depth: studentParameters.depth },
				},
			},
			EPC: {
				provider: HostGraphProviders.PatternGraphProvider,
				args: {
					constructorArgs: {},
					providerArgs: {
						schema: {},
					},
				},
			},
		},
	},
	graphLabelArgs: {
		hostGraph: "randomTree",
		schema: {
			nodes: ["AND", "OR", "XOR", "LOOP"],
		},
		application: {
			type: "random",
			schemaDistribution: {
				AND: studentParameters.ANDCardinality,
				OR: studentParameters.ORCardinality,
				XOR: studentParameters.XORCardinality,
				LOOP: studentParameters.LOOPCardinality,
			},
		},
	},
	graphTransformationArgs: {
		labeledGraph: "randomTree",
		populationRange: studentParameters.populationRange,
	},
});

const treeSerialiser = new DOTSerialiser(graph["hostGraphs"]["randomTree"]);
fs.writeFileSync("tree.dot", treeSerialiser.serialise());

const labeledTreeSerialiser = new DOTSerialiser(graph["labeledGraphs"]["randomTree"]);
fs.writeFileSync("labeled.dot", labeledTreeSerialiser.serialise("type"));

/*********************************************************************************
 *********************  PROMPT BUILDER *******************************************
 *********************************************************************************/

const userPromptTemplates: UserPromptTemplates = {
	scenario: {
		// TODO: userPromptTemplate for scenario will be a user-provided parameter
		userPromptTemplate: "about a website visit",
		isPartialPrompt: true,
	},
	contextPattern: {
		userPromptTemplate: "In the context of a process description {{scenario}},",
		isPartialPrompt: true,
	},
	startNode: {
		userPromptTemplate: `{{contextPattern}} provide a starting event. The starting event should be made up of concrete instances of the following part-of-speech tags: "NOUN AUX VERB NOUN", and provide a sentence in passive voice, e.g. "person has received information" or "text is displayed". {{promptOutputPrefix}}`,
		isPartialPrompt: false,
		promptResponseConfigs: {
			startNode: {
				promptResponsePrefix: "Event: ",
				promptOutputPrefix: `Prefix your answer with the keyword "{{promptResponsePrefix}}", seperate the names of the subprocesses with a comma , .`,
				promptResponseProcessingConfig: {},
			},
		},
	},
	extendedContext: {
		userPromptTemplate: `{{contextPattern}} with the starting event "{{startNode}}"`,
		isPartialPrompt: true,
	},
	alternatingNodes: {
		userPromptTemplate: `{{extendedContext}}, {{customContext}}. The {{processType}} is made up of the following {{elementNumber}} {{elementNumerus}}: "{{elementTypeChain}}". Provide descriptions for the {{elementNumber}} given {{processType}} {{elementNumerus}}, where {{elementExplanation}}. Do not generate more than the requested {{elementNumber}} {{processType}} {{elementNumerus}}.`,
		isPartialPrompt: false,
		promptResponseConfigs: {
			Events: {
				promptResponsePrefix: "Event: ",
				promptOutputPrefix: `Prefix your answers for each {{processType}} element with their respective type, e.g. "{{startEventType}}:" and seperate them with the newline character "\\n".`,
				promptResponseProcessingConfig: {
					lineSeparator: "\n",
				},
			},
			Functions: {
				promptResponsePrefix: "Function: ",
				promptResponseProcessingConfig: {
					lineSeparator: "\n",
				},
			},
		},
	},
	alternateAfterStartEvent: {
		userPromptTemplate: `{{extendedContext}}, {{customContext}}. The {{processType}} is made up of the following {{elementNumber}} {{elementNumerus}}: "{{elementTypeChain}}". Provide descriptions for the {{elementNumber}} given {{processType}} {{elementNumerus}}, where {{elementExplanation}}. Prefix your answers for each {{processType}} element with their respective type, e.g. "{{startEventType}}:" and seperate them with the newline character "\\n". Do not generate more than the requested {{elementNumber}} {{processType}} {{elementNumerus}}.`,
		isPartialPrompt: false,
		promptResponseConfigs: {
			Subprocesses: {
				promptResponsePrefix: "Subprocess: ",
				promptResponseProcessingConfig: {
					lineSeparator: "\n",
				},
			},
			Events: {
				promptResponsePrefix: "Event: ",
				promptResponseProcessingConfig: {
					lineSeparator: "\n",
				},
			},
			Functions: {
				promptResponsePrefix: "Function: ",
				promptResponseProcessingConfig: {
					lineSeparator: "\n",
				},
			},
		},
	},
	functionEventExplanation: {
		userPromptTemplate: `{{eventExplanation}} and {{functionExplanation}}`,
		isPartialPrompt: true,
	},
	eventFunctionExplanation: {
		userPromptTemplate: `{{functionExplanation}} and {{eventExplanation}}`,
		isPartialPrompt: true,
	},
	functionExplanation: {
		userPromptTemplate: `"Functions" is made up of concrete instances of the following part of speech tags "NOUN VERB NOUN" in active voice`,
		isPartialPrompt: true,
	},
	eventExplanation: {
		userPromptTemplate: `"Events" is made up of concrete instances of the following part of speech tags "NOUN AUX VERB NOUN" in passive voice`,
		isPartialPrompt: true,
	},
	openingAnd: {
		userPromptTemplate: `{{extendedContext}}, provide the names of {{branchAmount}} branches of parallel subprocesses. {{promptOutputPrefix}}`,
		isPartialPrompt: false,
	},
};

const promptHandler = new ModellPromptHandler(userPromptTemplates);
const { segmentedGraph, epc, patternNestingMap } = graph;
const labels = promptHandler.executePromptChain(segmentedGraph, patternNestingMap, epc);
