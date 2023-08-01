export type Constructor = { new (): any };

export type GenericConstructor<A, C> = { new (args: A): C };
