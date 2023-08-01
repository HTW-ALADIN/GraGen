export const counterGenerator = <T>(start: number = 0): Generator<T> => {
	function* counter(): Generator<T> {
		while (true) {
			yield <T>start;
			start++;
		}
	}
	return counter();
};

export const statefulCounter = () => {
	const counter = counterGenerator();
	return () => counter.next().value;
};

export function range(min: number, max: number) {
	return Array(max - min)
		.fill(0)
		.map((e) => min++);
}
