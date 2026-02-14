# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Monorepo of storage adapters for [GramIO](https://gramio.dev) (Telegram bot framework). Provides a unified `Storage` interface with multiple backend implementations. Published to both NPM and JSR.

## Commands

**Install dependencies:**
```bash
bun install
```

**Run all tests (from root or any package directory):**
```bash
bun test
```

**Run tests for a single package:**
```bash
bun test packages/core/tests/
bun test packages/redis/tests/
```

**Run a single test file:**
```bash
bun test packages/core/tests/index.test.ts
```

**Redis tests with real Redis (instead of ioredis-mock):**
```bash
USE_REAL_REDIS=1 bun test packages/redis/tests/
```

**Lint and format:**
```bash
bunx biome check --apply .
```

**Type check a package (run from package directory):**
```bash
bunx tsc --noEmit
```

**Build a package for publishing (run from package directory):**
```bash
bunx pkgroll
```

## Architecture

### Monorepo Structure

Bun workspaces with 4 packages under `packages/`:

- **`core`** (`@gramio/storage`) — Core `Storage<Data>` interface, `inMemoryStorage`, and `withFallbackStorages` wrapper
- **`redis`** (`@gramio/storage-redis`) — Redis adapter using `ioredis` (peer dep), supports TTL
- **`cloudflare`** (`@gramio/storage-cloudflare`) — Cloudflare Workers KV adapter
- **`sqlite`** (`@gramio/storage-sqlite`) — Bun-only SQLite adapter with TTL support

### The Storage Interface

All adapters implement this interface from `packages/core/src/types.ts`:

```typescript
interface Storage<Data extends Record<string, any> = Record<string, any>> {
  get<K extends keyof Data>(key: K): MaybePromise<Data[K] | undefined>;
  set<K extends keyof Data>(key: K, value: Data[K]): MaybePromise<void>;
  has<K extends keyof Data>(key: K): MaybePromise<boolean>;
  delete<K extends keyof Data>(key: K): MaybePromise<boolean>;
}
```

Key design decisions:
- `MaybePromise<T>` allows both sync (in-memory) and async (redis, cloudflare) implementations
- Generic `Data` parameter enables typed keys via template literals (e.g., `Record<\`user:${number}\`, User>`)
- Each adapter is a factory function returning a `Storage` object (not a class)
- All adapters use JSON serialization for values

### Adapter Pattern

Each adapter accepts either raw options or an existing client instance (redis accepts `Redis` instance, sqlite accepts `Database` instance). The adapter function returns a plain object conforming to `Storage`.

### Build & Publishing

- **pkgroll** bundles each package to `dist/` with both ESM (`.js`) and CJS (`.cjs`) outputs plus type declarations
- Each package has a `scripts/release-jsr.ts` that syncs the version from `package.json` to `deno.json` for JSR publishing
- Biome handles formatting and linting (import organization enabled, `noExplicitAny` disabled)

### Testing

- Uses Bun's built-in test runner (`bun:test`) with `describe`/`it`/`expect`
- Redis tests mock `ioredis` via `ioredis-mock` in `tests/preload.ts` (bypassed with `USE_REAL_REDIS` env var)
- SQLite tests use in-memory databases
