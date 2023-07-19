import Graph from "../Graph";

export interface ConstructorArgs {
	[key: string]: any;
}

export interface ProviderArgs {
	[key: string]: any;
}

export abstract class HostGraphProvider implements ConstructorArgs {
	constructor(args: ConstructorArgs) {}

	public abstract provideHostGraph(args: ProviderArgs): Graph;
}
