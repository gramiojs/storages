import RedisMock from "ioredis-mock";

// maybe use real redis instance

import { mock } from "bun:test";

// but it harder to work in other environments
if (!("USE_REAL_REDIS" in process.env))
	mock.module("ioredis", () => ({
		default: RedisMock,
		Redis: RedisMock,
	}));
