import Graph from "../Graph";
import { RNG, statefulCounter } from "../Util";
import { HostGraphProvider, ConstructorArgs, ProviderArgs } from "./HostGraphProvider";

// Interfaces don't allow protected properties, so we have to use getters in the class that implements this interface.
// https://github.com/microsoft/TypeScript/issues/25163
export interface HostGraphGeneratorConstructorArgs extends ConstructorArgs {
	idGenerator?: Function;
}

export interface HostGraphGeneratorParameters extends ProviderArgs {
	[key: string]: any;
}

export abstract class HostGraphGenerator extends HostGraphProvider implements HostGraphGeneratorConstructorArgs {
	protected _rng: RNG;
	protected _idGenerator: Function;
	constructor(args: HostGraphGeneratorConstructorArgs) {
		super(args);
		this._rng = args.rng || new RNG();
		this._idGenerator = args.idGenerator || statefulCounter();
	}

	public provideHostGraph(args: HostGraphGeneratorParameters): Graph {
		return this.generateGraph(args);
	}

	protected abstract generateGraph(args: HostGraphGeneratorParameters): Graph;

	get rng(): RNG {
		return this._rng;
	}

	get idGenerator(): Function {
		return this._idGenerator;
	}
}
