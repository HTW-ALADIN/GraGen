import { Graph } from "../../Graph/Graph";

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

export interface HostGraphProviderArgs {
	constructorArgs: ConstructorArgs;
	providerArgs: ProviderArgs;
}

export interface HostGraphArgs {
	hostGraphs: { [hostGraphName: string]: { provider: string; args: HostGraphProviderArgs } };
}
