import { GrGenNode } from "./GrGenModelNode";
import { GrGenEdge } from "./GrGenModelEdge";

export class GrGenModel {
	constructor(private nodeClasses: Array<GrGenNode>, private edgeClasses: Array<GrGenEdge>) {}

	public writeModel() {
		const nodeClassesString = this.nodeClasses.map((nodeClass) => nodeClass.writeEntity()).join("\n");
		const edgeClassesString = this.edgeClasses.map((edgeClass) => edgeClass.writeEntity()).join("\n");

		return `${nodeClassesString}\n${edgeClassesString}`;
	}
}
