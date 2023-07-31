import { HostGraphProvider, ConstructorArgs, ProviderArgs } from "./HostGraphProvider";

// load all host graph providers manually
import { TreeGenerator } from "./HostGraphProviders/TreeGenerator";
import { PatternGraphProvider } from "./HostGraphProviders/PatternGraphProvider";

export enum HostGraphProviders {
	TreeGenerator = "TreeGenerator",
	PatternGraphProvider = "PatternGraphProvider",
}

export interface HostGraphProviderArgs {
	constructorArgs: ConstructorArgs;
	providerArgs: ProviderArgs;
}

type DerivedHostGraphProvider = { new (args: ConstructorArgs): HostGraphProvider } & typeof HostGraphProvider;

export const HostGraphProviderMap = new Map<HostGraphProviders, DerivedHostGraphProvider>([
	[HostGraphProviders.TreeGenerator, TreeGenerator],
	[HostGraphProviders.PatternGraphProvider, PatternGraphProvider],
]);

export interface HostGraphArgs {
	hostGraphs: { [hostGraphName: string]: { provider: HostGraphProviders; args: HostGraphProviderArgs } };
}
