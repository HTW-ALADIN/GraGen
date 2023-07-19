import { GrGenEntity, GrGenEntityAttributes } from "./GrGenModelEntity";

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
