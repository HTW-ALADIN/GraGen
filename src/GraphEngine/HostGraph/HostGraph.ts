import { Graph } from "../../Graph/Graph";

export type HostGraph = Graph;

export interface HostGraphs {
	[hostGraphName: string]: HostGraph;
}
