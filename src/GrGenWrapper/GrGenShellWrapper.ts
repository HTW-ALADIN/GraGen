import * as textTemplater from "squirrelly";

export type Template = string;

export interface TemplateData {
	[key: string]: string | Array<string> | Template | Array<Template>;
}

export interface Templates {
	[key: string]: Template;
}

export class DuplicateEntryError extends Error {
	constructor(message: string) {
		super(message);

		Object.setPrototypeOf(this, DuplicateEntryError.prototype);
	}
}

const templateString = (template: string, valueObject: { [key: string]: string[] } = {}, concatWith: string = " ") => {
	let output = template;
	Object.entries(valueObject).forEach(([key, values]) => {
		output = output.replace(new RegExp("\\$" + `{${key}}`, "g"), () =>
			values.reduce((string, value, i) => (!i ? value : string + concatWith + value), "")
		);
	});
	return output;
};

export class TextTemplateEngine {
	private data: TemplateData = {};
	private templates: Templates = {};
	constructor() {}

	// TODO: Finish nested rendering
	public render(template?: Template, data?: TemplateData): string {
		if (!template) {
		}
		this.buildTemplateTree();
		// this.renderTemplate(template, data);
		return "";
	}

	private buildTemplateTree(templates?: Templates) {
		if (!templates) templates = this.templates;

		const templateNames = Object.keys(templates);
		const templateOrder: { [key: string]: number } = {};
		Object.entries(templates).forEach(([currentTemplateName, currentTemplate]) => {
			templateNames.some((templateName) => {
				if (currentTemplate.includes(`$\{${templateName}}`)) {
					const position = templateOrder[currentTemplateName];
					Object.entries(templateOrder).forEach(([template, index]) => {
						if (index > position) {
							templateOrder[template]++;
						}
					});
					if (!Object.keys(templateOrder).includes(currentTemplateName)) {
						templateOrder[currentTemplateName] = position + 1;
					}
				}
			});
		});

		return Object.keys(templateOrder).sort((a, b) => templateOrder[a] - templateOrder[b]);
	}

	private renderTemplate(template: Template, templateData: TemplateData, concatWith: string = " "): string {
		let output = template;
		Object.entries(templateData).forEach(([key, values]) => {
			if (!Array.isArray(values)) {
				values = [values];
			}
			output = output.replace(new RegExp("\\$" + `{${key}}`, "g"), () =>
				(values as Array<string>).reduce((string, value, i) => (!i ? value : string + concatWith + value), "")
			);
		});
		return output;
	}

	public addTemplate(template: Templates): void;
	public addTemplate(template: Template, templateName: string): void;
	public addTemplate(template: Template | Templates, templateName?: string): void {
		if (!this.isTemplate(template)) {
			templateName = Object.keys(template)[0];
			template = Object.values(template)[0];
		}
		if ((templateName as string) in Object.keys(this.templates)) {
			throw new DuplicateEntryError(`A template with the name: '${templateName}' already exists.`);
		}
		this.templates[templateName as string] = template;
	}

	public addData(data: TemplateData): void;
	public addData(data: TemplateData | Template, dataName: string): void;
	public addData(data: TemplateData | Template, dataName?: string): void {
		if (this.isData(data)) {
			data = { [dataName as string]: data };
		}
		Object.entries(data).forEach(([dataName, data]) => {
			if ((dataName as string) in Object.keys(this.templates)) {
				throw new DuplicateEntryError(`A data entry with the name: '${dataName}' already exists.`);
			}
			this.data[dataName] = data;
		});
	}

	private isTemplate(template: Template | Templates): template is Template {
		return typeof template === "string";
	}

	private isTemplateWithData(template: Template): template is Template {
		return this.isTemplate(template) && /\${\w*}/.test(template);
	}

	private isData(data: string | TemplateData): data is string {
		return typeof data === "string";
	}
}

export class GrGenShellScriptFactory {
	constructor() {}

	createNewInstance(
		ruleSetFileName: string,
		graphName: string,
		recordFileName: Nullable<string> = null,
		seed: string,
		debug: boolean
	): GrGenShellScript {
		const grGenShellScriptInstance = new GrGenShellScript(ruleSetFileName, graphName, recordFileName, seed, debug);

		const templateEngine = new TextTemplateEngine();

		grGenShellScriptInstance.setTemplateEngine(templateEngine);

		return grGenShellScriptInstance;
	}
}

type Nullable<T> = T | null;
export class GrGenShellScript {
	private templateEngine: TextTemplateEngine;
	constructor(
		private ruleSetFileName: string,
		private graphName: string,
		private recordFileName: Nullable<string> = null,
		private seed: string,
		private debug: boolean
	) {}

	public writeShellScript(): string {
		const shellTemplate = "new graph {{it.}}";
		return "";
	}

	public setTemplateEngine(templateEngine: TextTemplateEngine): void {
		this.templateEngine = templateEngine;
	}

	private writeGraphInitString(): string {
		return `new graph ${this.ruleSetFileName} "${this.graphName}"\n`;
	}

	private writeRecordString(): string {
		if (this.recordFileName) {
			return `record`;
		}
		return "";
	}

	private writeSeedString(): string {
		return `randomseed ${this.seed}`;
	}
}

export class GrGenRuleExecution {
	constructor() {}

	public writeExecutionRule() {}
}

const conjunctionOperators = [];
const multiplicityOperators = [];
const randomOperators = [];
