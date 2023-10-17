import { GraGenEngine } from "../../GraphEngine/Engine";
import { TraversalMethods, TraversalType } from "../../Graph/Traversal";

(async () => {
	const engine = await GraGenEngine.getInstance();

	const hostGraphs = engine.generateGraph({
		hostGraphArgs: {
			hostGraphs: {
				randomTree: {
					provider: "TreeGenerator",
					args: {
						constructorArgs: {},
						providerArgs: {
							cardinality: 10,
							depth: 2,
						},
					},
				},
			},
		},
	});

	const randomTraversal = TraversalMethods.get(TraversalType.TransformRandom);
	randomTraversal(
		hostGraphs.randomTree,
		undefined,
		(key, attributes, depth) => {
			console.log(key, attributes, depth);
		},
		undefined,
		engine.getRNG()
	);
})();
