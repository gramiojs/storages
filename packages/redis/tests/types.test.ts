import { expectTypeOf } from "bun:test";
import type { Storage } from "@gramio/storage";
import { redisStorage as bunStorage } from "../src/bun";
import { redisStorage as ioredisStorage } from "../src/ioredis";

// ioredis adapter returns Storage
expectTypeOf(ioredisStorage()).toMatchTypeOf<Storage>();
expectTypeOf(ioredisStorage({})).toMatchTypeOf<Storage>();
expectTypeOf(ioredisStorage({ $ttl: 60 })).toMatchTypeOf<Storage>();

// bun adapter returns Storage
expectTypeOf(bunStorage()).toMatchTypeOf<Storage>();
expectTypeOf(bunStorage({})).toMatchTypeOf<Storage>();
expectTypeOf(bunStorage({ $ttl: 60 })).toMatchTypeOf<Storage>();
expectTypeOf(
	bunStorage({ url: "redis://localhost:6379" }),
).toMatchTypeOf<Storage>();

// Storage methods return correct types
const storage = ioredisStorage();
expectTypeOf(storage.get).parameters.toMatchTypeOf<[string]>();
expectTypeOf(storage.set).parameters.toMatchTypeOf<[string, any]>();
expectTypeOf(storage.has).parameters.toMatchTypeOf<[string]>();
expectTypeOf(storage.delete).parameters.toMatchTypeOf<[string]>();
