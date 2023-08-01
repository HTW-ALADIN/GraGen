import seedrandom from "seedrandom";

export class RNG {
	private rng: Math["random"] | seedrandom.PRNG;

	constructor(seed?: any) {
		this.rng = seed ? seedrandom(seed) : Math.random;
	}

	public random() {
		return this.rng();
	}

	public coinFlip() {
		return this.trueByChanceOf(0.5);
	}

	public trueByChanceOf(n: number) {
		return this.floatBetween(0, 1) < n;
	}

	public floatBetween(min?: number, max?: number) {
		if (min && max) return this.rng() * (max - min) + min;
		return this.rng();
	}

	public intBetween(min: number, max: number) {
		return Math.round(this.rng() * (max - min) + min);
	}

	public intPairBetween(min: number, max: number): Array<number> {
		const n1 = this.intBetween(min, max);
		const n2 = this.intBetween(min, max);
		if (n1 < n2) {
			return [n1, n2];
		} else {
			return [n2, n1];
		}
	}

	// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
	public shuffle<T>(iterable: Iterable<T>): Array<T> {
		const array = [...iterable];
		let j, x;

		for (let i = array.length - 1; i > 0; i--) {
			j = this.intBetween(0, i);
			x = array[i];
			array[i] = array[j];
			array[j] = x;
		}
		return array;
	}

	public randomSample<T>(iterable: Array<T>, n: number, replace: true): Array<T>;
	public randomSample<T>(iterable: Iterable<T>, n: number, replace: false): IterableIterator<Array<T>>;
	public randomSample<T>(iterable: Iterable<T>, n: number, replace?: boolean): IterableIterator<Array<T>>;
	public randomSample<T>(iterable: Iterable<T>, n: number, replace?: boolean): IterableIterator<Array<T>> | Array<T> {
		const array = this.shuffle(iterable);
		if (n > array.length) {
			throw new Error(`Samplesize is greater than number of elements in the given array.\n${n}\n${array}`);
		}

		function* elementGenerator(): IterableIterator<Array<T>> {
			while (array.length) {
				yield array.splice(0, n);
			}
		}

		if (replace) {
			return elementGenerator().next().value;
		}

		return elementGenerator();
	}

	// https://stackoverflow.com/a/55671924/14804461
	public weightedSample(options: Array<{ item: any; weight: number }>, rng?: RNG) {
		if (!rng) rng = new RNG();

		let i;
		let weights = [options[0].weight];
		for (i = 1; i < options.length; i++) weights[i] = options[i].weight + weights[i - 1];

		let random = rng.random() * weights[weights.length - 1];
		for (i = 0; i < weights.length; i++) if (weights[i] > random) break;

		return options[i].item;
	}
}
