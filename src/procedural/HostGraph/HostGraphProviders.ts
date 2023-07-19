import { TreeGenerator } from "./TreeGenerator";
import { HostGraphProvider, ConstructorArgs, ProviderArgs } from "./HostGraphProvider";

export enum HostGraphProviders {
	TreeGenerator = "TreeGenerator",
}

export interface HostGraphProviderArgs {
	constructorArgs: ConstructorArgs;
	providerArgs: ProviderArgs;
}

type DerivedHostGraphProvider = { new (args: ConstructorArgs): HostGraphProvider } & typeof HostGraphProvider;

export const HostGraphProviderMap = new Map<HostGraphProviders, DerivedHostGraphProvider>([
	[HostGraphProviders.TreeGenerator, TreeGenerator],
]);

export interface HostGraphArgs {
	hostGraphs: Array<{ [hostGraphName: string]: { provider: HostGraphProviders; args: HostGraphProviderArgs } }>;
}
