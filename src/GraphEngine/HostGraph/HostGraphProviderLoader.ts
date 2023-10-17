import { dynamicModuleLoader } from "../../Util/DynamicModuleLoader";
import { GenericConstructor } from "../../Types/Constructor";
import path from "path";

import { HostGraphProvider, ConstructorArgs } from "./HostGraphProvider";

type DerivedHostGraphProvider = GenericConstructor<ConstructorArgs, HostGraphProvider>;

// type DerivedHostGraphProvider = { new (args: ConstructorArgs): HostGraphProvider } & typeof HostGraphProvider;

export type HostGraphProviderMap = Map<string, DerivedHostGraphProvider>;

export const loadHostGraphProviders = async (): Promise<HostGraphProviderMap> => {
	const hostGraphProvidersPath = path.join(__dirname, "/HostGraphProviders");
	const hostGraphProviders = await dynamicModuleLoader(hostGraphProvidersPath);
	const hostGraphProviderMap = new Map<string, DerivedHostGraphProvider>();

	Object.entries(hostGraphProviders).forEach(([hostGraphProviderName, hostGraphProvider]) => {
		hostGraphProviderMap.set(hostGraphProviderName, hostGraphProvider);
	});
	return hostGraphProviderMap;
};
