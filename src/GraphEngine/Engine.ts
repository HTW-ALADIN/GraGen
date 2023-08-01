// import { loadHostGraphProviders } from "";

export class GraGenEngine {
	/**
	 * Returns the singleton instance of the GraGenEngine.
	 */
	static engineInstance: GraGenEngine;

	private constructor() {}

	public static async getInstance(): Promise<GraGenEngine> {
		if (!GraGenEngine.engineInstance) {
			GraGenEngine.engineInstance = new GraGenEngine();
		}
		return GraGenEngine.engineInstance;
	}

	public logic() {
		console.log("my logic!");
	}
}
