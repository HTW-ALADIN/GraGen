export function minMaxScaler(
	measurementMin: number,
	measurementMax: number,
	targetMin: number,
	targetMax: number
): Function {
	return (value: number): number =>
		((value - measurementMin) / (measurementMax - measurementMin)) * (targetMax - targetMin) + targetMin;
}
