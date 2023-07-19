import { GrGenEntity, GrGenEntityAttributes } from "./GrGenModelEntity";

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
