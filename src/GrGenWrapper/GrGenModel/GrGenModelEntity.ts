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
