import { dynamicModuleLoader } from "../../Util/DynamicModuleLoader";
import { GenericConstructor } from "../../Types/Constructor";

import { HostGraphProvider, ConstructorArgs, ProviderArgs } from "./HostGraphProvider";

type DerivedHostGraphProvider = GenericConstructor<ConstructorArgs, HostGraphProvider>;

// type DerivedHostGraphProvider = { new (args: ConstructorArgs): HostGraphProvider } & typeof HostGraphProvider;

export const loadHostGraphProviders = async () => {
	const hostGraphProviders = await dynamicModuleLoader("/HostGraphProviders");
	const hostGraphProviderMap = new Map<string, DerivedHostGraphProvider>();

	Object.entries(hostGraphProviders).forEach(([hostGraphProviderName, hostGraphProvider]) => {
		hostGraphProviderMap.set(hostGraphProviderName, hostGraphProvider);
	});
};

export interface HostGraphProviderArgs {
	constructorArgs: ConstructorArgs;
	providerArgs: ProviderArgs;
}

export interface HostGraphArgs {
	hostGraphs: { [hostGraphName: string]: { provider: string; args: HostGraphProviderArgs } };
}
