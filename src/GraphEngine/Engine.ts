import { RNG } from "../Util/RNG";
import { HostGraphArgs } from "./HostGraph/HostGraphProvider";
import { loadHostGraphProviders, HostGraphProviderMap } from "./HostGraph/HostGraphProviderLoader";
import { HostGraphs } from "./HostGraph/HostGraph";
import { Graph } from "../Graph/Graph";
import * as R from "remeda";

export interface EngineArgs {
	hostGraphArgs: HostGraphArgs;
	seed?: string;
}

export class GraGenEngine {
	/**
	 * Returns the singleton instance of the GraGenEngine.
	 */
	static engineInstance: GraGenEngine;

	private rng: RNG;

	private hostGraphProviderMap: HostGraphProviderMap;

	private hostGraphs: HostGraphs;

	// prevent instantiation from outside
	private constructor() {}

	// initialize the singleton instance if no instance exists yet, otherwise return the instance
	public static async getInstance(): Promise<GraGenEngine> {
		if (!GraGenEngine.engineInstance) {
			GraGenEngine.engineInstance = new GraGenEngine();

			GraGenEngine.engineInstance.hostGraphProviderMap = await loadHostGraphProviders();
		}
		return GraGenEngine.engineInstance;
	}

	public getRNG() {
		return this.rng;
	}

	public generateGraph(args: EngineArgs) {
		const { seed, hostGraphArgs } = args;
		this.rng = this.initializeRNG(seed);

		this.hostGraphs = this.provideHostGraphs(hostGraphArgs);

		return this.hostGraphs;
	}

	private initializeRNG(seed: string) {
		seed = seed != undefined ? seed : String(Math.random());
		return new RNG(seed);
	}

	private provideHostGraphs(hostGraphArgs: HostGraphArgs): HostGraphs {
		const hostGraphs = Object.entries(hostGraphArgs.hostGraphs).reduce(
			(hostGraphs, [hostGraphName, hostGraphDefinition]) => {
				const { provider, args } = hostGraphDefinition;
				const { constructorArgs, providerArgs } = args;

				const HostGraphProvider = this.hostGraphProviderMap.get(provider);
				const hostGraphProvider = new HostGraphProvider({ rng: this.rng, constructorArgs });

				hostGraphs[hostGraphName] = hostGraphProvider.provideHostGraph(providerArgs);
				return hostGraphs;
			},
			{} as HostGraphs
		);

		return hostGraphs;
	}
}
