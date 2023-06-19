export class GrGenModel {
	constructor(private nodeClasses: Array<GrGenNode>, private edgeClasses: Array<GrGenEdge>) {}

	public writeModel() {
		const nodeClassesString = this.nodeClasses.map((nodeClass) => nodeClass.writeEntity()).join("\n");
		const edgeClassesString = this.edgeClasses.map((edgeClass) => edgeClass.writeEntity()).join("\n");

		return `${nodeClassesString}\n${edgeClassesString}`;
	}
}

export enum GrGenEntityAttributeType {
	STRING = "string",
	INT = "int",
	FLOAT = "float",
	DOUBLE = "double",
	BOOL = "bool",
}
export interface GrGenEntityAttributes {
	[key: string]: GrGenEntityAttributeType;
}
export class GrGenEntity {
	protected entityType: string;
	constructor(
		protected name: string,
		protected isAbstract: boolean = false,
		protected entityAttributes: GrGenEntityAttributes = {},
		protected inheritedEntities: Array<string> = []
	) {}

	public writeEntity(): string {
		const { abstractModifierString, classIdentifierString, inheritedEntitiesString, entityAttributesString } =
			this.constructEntityStrings();

		return `${abstractModifierString}${this.entityType} ${classIdentifierString}${inheritedEntitiesString}${entityAttributesString};`;
	}

	protected constructEntityStrings(): { [key: string]: string } {
		const abstractModifierString = this.writeAbstractModifier();
		const classIdentifierString = `class ${this.name}`;
		const inheritedEntitiesString = this.writeInheritedEntities();
		const entityAttributesString = this.writeEntityAttributes();

		return { abstractModifierString, classIdentifierString, inheritedEntitiesString, entityAttributesString };
	}

	protected writeAbstractModifier(): string {
		if (this.isAbstract) {
			return "abstract ";
		}
		return "";
	}
	protected writeInheritedEntities(): string {
		if (this.inheritedEntities.length) {
			const joinedEntities = this.inheritedEntities.join(", ");
			return ` extends ${joinedEntities}`;
		}
		return "";
	}
	protected writeEntityAttributes(): string {
		if (Object.keys(this.entityAttributes).length) {
			const entityAttributes = Object.entries(this.entityAttributes).reduce(
				(attributes, [attributeName, attributeType]) => {
					attributes += `\t${attributeName}: ${attributeType};\n`;
					return attributes;
				},
				""
			);
			return ` {\n${entityAttributes}}`;
		}
		return "";
	}
}

export class GrGenNode extends GrGenEntity {
	constructor(
		name: string,
		isAbstract: boolean = false,
		entityAttributes: GrGenEntityAttributes = {},
		inheritedEntities: Array<string> = []
	) {
		super(name, isAbstract, entityAttributes, inheritedEntities);
		this.entityType = "node";
	}
}

export enum GrGenEdgeType {
	ARBITRARY = "arbitrary",
	DIRECTED = "directed",
	UNDIRECTED = "undirected",
}
export class GrGenEdge extends GrGenEntity {
	constructor(
		name: string,
		protected edgeType: GrGenEdgeType = GrGenEdgeType.DIRECTED,
		isAbstract: boolean = false,
		entityAttributes: GrGenEntityAttributes = {},
		inheritedEntities: Array<string> = []
	) {
		super(name, isAbstract, entityAttributes, inheritedEntities);
		this.entityType = "edge";
	}

	public writeEntity(): string {
		const { abstractModifierString, classIdentifierString, inheritedEntitiesString, entityAttributesString } =
			this.constructEntityStrings();

		return `${abstractModifierString}${this.edgeType} ${this.entityType} ${classIdentifierString}${inheritedEntitiesString}${entityAttributesString};`;
	}
}
