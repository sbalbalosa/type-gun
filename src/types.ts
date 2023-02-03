import { IGunInstance, ISEA } from "gun";

export type RootNode = "user" | "public";
export type ChildNode = "object" | "set";
export type Node = RootNode | ChildNode;
export type GlobalMetaData<T> = { gun: IGunInstance | null, sea: ISEA | null } & T;


