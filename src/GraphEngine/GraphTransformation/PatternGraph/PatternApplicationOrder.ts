import { Graph, NodeIdentifier } from "../../../Graph/Graph";
import { HostGraph } from "../../HostGraph/HostGraph";
import { TraversalMethods, TraversalType, TraversalCallback, Attributes } from "../../../Graph/Traversal";
import { RNG } from "../../../Util/RNG";

type HostGraphName = string;

interface PatternApplicationOrderArgs {
	startNode: NodeIdentifier;
	traversalType: TraversalType;
	invertedOrder: boolean;
}

interface TraversalOrder {
	[key: number]: Array<NodeIdentifier>;
}

interface TraversalOrders {
	[hostGraph: HostGraphName]: TraversalOrder;
}

export abstract class ApplicationOrderProvider {
	protected hostGraphApplicationOrdersArgs: ApplicationOrderArgs;

	constructor(args: PatternApplicationOrderArgs, protected hostGraph: HostGraph, protected rng: RNG) {
		this.hostGraphApplicationOrdersArgs = args.hostGraphApplicationOrdersArgs;
	}

	public abstract provideApplicationOrder(): TraversalOrders;
}

export class ApplicationOrderTraversalProvider extends ApplicationOrderProvider {
	public provideApplicationOrder() {
		const { hostGraphs, hostGraphOrder, hostGraphApplicationOrdersArgs } = this;

		return hostGraphOrder.reduce((traversalOrders, hostGraphName) => {
			const hostGraph = hostGraphs[hostGraphName];
			const hostGraphApplicationOrderArgs = hostGraphApplicationOrdersArgs[hostGraphName];

			const traversalOrder = this.calculateApplicationOrder(hostGraph, hostGraphApplicationOrderArgs);
			traversalOrders[hostGraphName] = traversalOrder;

			return traversalOrders;
		}, {} as TraversalOrders);
	}

	private calculateApplicationOrder(hostGraph: HostGraph, ApplicationOrderArgs: HostGraphApplicationOrderArgs) {
		const { startNode, traversalType, invertedOrder } = ApplicationOrderArgs;

		const traversalOrder = this.traverseGraph(hostGraph, startNode, traversalType);
		// TODO: implement invertedOrder and reassigning value
		if (invertedOrder) {
			this.invertOrder(traversalOrder);
		}

		return traversalOrder;
	}

	private traverseGraph(graph: Graph, startNode: NodeIdentifier, traversalType: TraversalType) {
		// TODO perhaps add options for traversal if needed
		const traversalOptions = {};

		const nodeTraversalOrder: TraversalOrder = {};
		const addToTraversalOrder: TraversalCallback = (key: string, attribute: Attributes, depth: number) => {
			const keysAtDepth = nodeTraversalOrder[depth] || [];
			nodeTraversalOrder[depth] = [...keysAtDepth, key];
		};

		const traversalMethod = TraversalMethods.get(traversalType);
		traversalMethod(graph, startNode, addToTraversalOrder, traversalOptions, this.rng);

		return nodeTraversalOrder;
	}

	// TODO: implement invertedOrder and reassing value
	private invertOrder(traversalOrder: TraversalOrder) {}
}
