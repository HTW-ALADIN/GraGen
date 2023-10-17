import { fillTemplate } from "./TemplateFiller";
import Graph, { NodeAttributes } from "../Graph";

abstract class PromptHandler {
	constructor() {}
}

interface PromptTemplates {
	[promptTemplateName: string]: string;
}

interface PromptResponseProcessingConfig {
	separator?: string;
	lineSeparator?: string;
}
interface PromptResponseConfig {
	promptResponsePrefix: string;
	promptOutputPrefix?: string;
	promptResponseProcessingConfig: PromptResponseProcessingConfig;
}
// outputVariableName is used to then insert the output of the prompt into the promptContext
interface PromptResponseConfigs {
	[outputVariableName: string]: PromptResponseConfig;
}
interface UserPromptConfig {
	userPromptTemplate: string;
	isPartialPrompt: boolean;
	promptResponseConfigs?: PromptResponseConfigs;
}
export interface UserPromptTemplates {
	[promptTemplateName: string]: UserPromptConfig;
}

interface PromptContext {
	[key: string]: string[];
}

interface PatternPromptTemplateMap {
	[key: string]: PatternPromptTemplateMap | string;
}

const patternPromptTemplateMap: PatternPromptTemplateMap = {
	Event: {
		StartEPC: "startNode",
		EndEPC: "endNode",
	},
	Function: "alternatingNodes",
	ANDGate: {
		AND: {
			opening: "openingAnd",
			closing: "closingAnd",
		},
	},
	ORGate: {
		OR: {
			opening: "openingOr",
			closing: "closingOr",
		},
		LOOP: "openingLoop",
	},
	XORGate: {
		OR: {
			opening: "openingXOr",
			closing: "closingXOr",
		},
		LOOP: "closingLoop",
	},
};

export class ModellPromptHandler extends PromptHandler {
	protected systemPromptTemplates: PromptTemplates;
	protected promptContext: PromptContext = {};

	constructor(protected userPromptTemplates: UserPromptTemplates, protected llm: Function = (x: string) => x) {
		super();

		this.systemPromptTemplates = {
			promptResponseRestriction: "Do not give further explanations on the output.",
		};

		this.addPartialPromptsToPromptContext();
		this.addSystemPromptsToPromptContext();
	}

	private selectPromptTemplate(nodeAttributes: NodeAttributes, startNode: string, epc: Graph) {
		const { type, patternType, status } = nodeAttributes;

		// handle case for alternating Event chain that is not start or end event
		if (type === "Event" && !["StartEPC", "EndEPC"].includes(patternType)) {
			return <string>patternPromptTemplateMap["Function"];
		}
		// handle case for alternating Function chain that follows start event
		if (type === "Function" && epc.areInNeighbors(startNode, "0")) {
			return "alternateAfterStartEvent";
		}

		let promptTemplate = patternPromptTemplateMap[type];
		if (typeof promptTemplate !== "string") {
			promptTemplate = promptTemplate[patternType];
		}
		if (typeof promptTemplate !== "string") {
			promptTemplate = promptTemplate[status];
		}

		return <string>promptTemplate;
	}

	public executePromptChain(
		graphSegments: Array<Array<string>>,
		patternNestingMap: { [key: string]: any },
		epc: Graph
	) {
		console.log(graphSegments);
		for (const segment of graphSegments) {
			const startNode = segment[0];
			const startNodeAttributes = epc.getNodeAttributes(startNode);

			// TODO: was this meant to be patternID?
			const startElementID = startNode;
			const substructureIDs = [0];

			// select promptTemplate based on attributes of startNode
			const templateName = this.selectPromptTemplate(startNodeAttributes, startNode, epc);

			// build and execute prompt
			const prompt = this.buildPrompt(templateName, segment, patternNestingMap, epc);
			const response = this.executePrompt(prompt);

			// process prompt output
			const processedOutput = this.processPromptOutput(response, templateName, startElementID, substructureIDs);

			// save previous outputs for use in next prompts
			[segment, processedOutput];

			console.log(prompt, processedOutput, templateName);
		}
	}

	protected buildCustomContext(
		templateName: string,
		segment: Array<string>,
		patternNestingMap: { [key: string]: any },
		epc: Graph
	) {
		const startNode = segment[0];
		const startNodeAttributes = epc.getNodeAttributes(startNode);

		const endNode = segment[segment.length - 1];
		const endNodeAttributes = epc.getNodeAttributes(endNode);

		const patternId = startNodeAttributes.patternId;

		// TODO: get a subprocess for an alternatingSequence if it follows the start event
	}

	protected buildAlternatingNodesPromptContext(
		templateName: string,
		segment: Array<string>,
		patternNestingMap: { [key: string]: any },
		epc: Graph
	) {
		const startNode = segment[0];
		const startNodeAttributes = epc.getNodeAttributes(startNode);
		const patternId = startNodeAttributes.patternId;

		// if parentPatternId is not nested, then the current pattern is only nested under "startingEvent" and thus the main "process"
		const parentPatternId = patternNestingMap[patternId];
		// TODO: make this always be "subprocess?"
		// this.promptContext["processType"] = patternNestingMap[parentPatternId] === null ? ["process"] : ["subprocess"];
		this.promptContext["processType"] = ["subprocess"];

		// set elementNumber according to segment length and elementNumerus to its plural form if length is > 1
		this.promptContext["elementNumber"] = [segment.length.toString()];
		this.promptContext["elementNumerus"] = segment.length > 1 ? ["elements"] : ["element"];

		// set elementTypeChain according to the types of the segment elements
		const segmentTypes = segment.map((nodeId) => epc.getNodeAttribute(nodeId, "type"));
		this.promptContext["elementTypeChain"] = [segmentTypes.join(", ")];

		// set elementExplanation according to the types of the segment elements
		let eventExplanationType: string;
		if (segmentTypes.includes("Event") && segmentTypes.includes("Function")) {
			if (startNodeAttributes.type === "Event") {
				eventExplanationType = "eventFunctionExplanation";
			} else {
				eventExplanationType = "functionEventExplanation";
			}
		} else if (segmentTypes.includes("Event")) {
			eventExplanationType = "eventExplanation";
		} else {
			eventExplanationType = "functionExplanation";
		}
		// set elementExplanation to the respective predefined promptTemplate (see userPromptTemplates in ProcessGenerator)
		this.promptContext["elementExplanation"] = [`{{${eventExplanationType}}}`];

		// set startEventType according to the type of the startNode
		this.promptContext["startEventType"] = [startNodeAttributes.type];
	}

	protected buildOpeningAndPromptContext(
		templateName: string,
		segment: Array<string>,
		patternNestingMap: { [key: string]: any },
		epc: Graph
	) {
		const startNode = segment[0];
		const startNodeAttributes = epc.getNodeAttributes(startNode);
		const patternId = startNodeAttributes.patternId;
	}

	protected buildPromptContext(
		templateName: string,
		segment: Array<string>,
		patternNestingMap: { [key: string]: any },
		epc: Graph
	) {
		if (templateName === "alternatingNodes") {
			this.buildAlternatingNodesPromptContext(templateName, segment, patternNestingMap, epc);
		}
		if (templateName === "openingAnd") {
		}

		const { promptResponseConfigs } = this.userPromptTemplates[templateName];

		for (const promptResponseConfigName in promptResponseConfigs) {
			const promptResponseConfig = promptResponseConfigs[promptResponseConfigName];
		}

		// TODO: make generic and associate with an overview of all necessary IDs for later lookup
		// set output prefix for the current prompt
		// alternatingNodes prompt build it's own promptOutputPrefix
		// const outputPrefix = promptResponseConfig?.promptResponsePrefix ?? "";
		// this.promptContext["outputPrefix"] = [outputPrefix];

		// promptOutputPrefix: {
		// 	userPromptTemplate: `Prefix your answer with the keyword "{{outputPrefix}}", seperate the names of the subprocesses with a comma , .`,
		// 	isPartialPrompt: true,
		// },
	}

	protected buildPrompt(
		templateName: string,
		segment: Array<string>,
		patternNestingMap: { [key: string]: any },
		epc: Graph
	) {
		const { userPromptTemplate } = this.userPromptTemplates[templateName];

		// first build Context, so all variables are set
		this.buildPromptContext(templateName, segment, patternNestingMap, epc);

		const promptTemplate = `${userPromptTemplate} ${this.systemPromptTemplates.promptResponseRestriction}`;
		const prompt = fillTemplate(promptTemplate, this.promptContext);
		return prompt;
	}

	protected executePrompt(prompt: string) {
		//this.llm(prompt);
		return "Event: Website visit was initiated by a link being clicked.";
	}

	protected processPromptOutput(
		response: string,
		templateName: string,
		elementID: string,
		substructureID: Array<number>
	) {
		const { promptResponseConfigs } = this.userPromptTemplates[templateName];

		const outputs: Array<Array<any>> = [];
		for (const promptResponseConfigName in promptResponseConfigs) {
			const promptResponseConfig = promptResponseConfigs[promptResponseConfigName];
			const promptResponseProcessingConfig = promptResponseConfig?.promptResponseProcessingConfig;
			const outputPrefix = promptResponseConfig?.promptResponsePrefix ?? "";

			const { separator, lineSeparator } = promptResponseProcessingConfig;

			const regexp = new RegExp(`${outputPrefix}(.*)`);
			let splitResponse = [response];
			if (lineSeparator) {
				splitResponse = response.split(lineSeparator);
			}

			let output: Array<string> = [];
			for (const responseLine of splitResponse) {
				let match = [responseLine.match(regexp)[1]];

				if (separator) {
					output = match[0].split(separator);
				} else {
					output = match;
				}
			}

			// add to promptContext if output is only one element
			// e.g. output of startNode to extend prompting context
			if (output.length === 1) {
				this.promptContext[templateName] = output;
			}

			outputs.push(output);
		}
		return outputs;
	}

	private addPartialPromptsToPromptContext() {
		Object.entries(this.userPromptTemplates).forEach(([promptTemplateName, promptTemplateConfig]) => {
			if (promptTemplateConfig.isPartialPrompt) {
				this.promptContext[promptTemplateName] = [promptTemplateConfig.userPromptTemplate];
			}
		});
	}
	private addSystemPromptsToPromptContext() {
		Object.entries(this.systemPromptTemplates).forEach(([promptTemplateName, promptTemplate]) => {
			this.promptContext[promptTemplateName] = [promptTemplate];
		});
	}
}

// testCase
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
	promptOutputPrefix: {
		userPromptTemplate: `Prefix your answer with the keyword "{{outputPrefix}}".`,
		isPartialPrompt: true,
	},
	extendedPromptOutputPrefix: {
		userPromptTemplate: `Prefix your answer with the keyword "{{promptOutputPrefix}}", seperate the names of the subprocesses with a comma , .`,
		isPartialPrompt: true,
	},
	startNode: {
		userPromptTemplate: `{{contextPattern}} provide a starting event. The starting event should be made up of concrete instances of the following part-of-speech tags: "NOUN AUX VERB NOUN", and provide a sentence in passive voice, e.g. "person has received information" or "text is displayed". {{promptOutputPrefix}}`,
		isPartialPrompt: false,
		promptResponseConfigs: {
			startNode: { promptResponsePrefix: "Event: ", promptResponseProcessingConfig: {} },
		},
	},
	extendedContext: {
		userPromptTemplate: `{{contextPattern}} with the starting event "{{startNode}}"`,
		isPartialPrompt: true,
	},
	openingAnd: {
		userPromptTemplate: `{{extendedContext}}, provide the names of {{branchAmount}} branches of parallel subprocesses. {{extendedPromptOutputPrefix}}`,
		isPartialPrompt: false,
	},
};

const promptHandler = new ModellPromptHandler(userPromptTemplates);
// promptHandler.executePromptChain();
