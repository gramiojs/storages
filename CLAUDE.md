# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Monorepo of storage adapters for [GramIO](https://gramio.dev) (Telegram bot framework). Provides a unified `Storage` interface with multiple backend implementations. Published to both NPM and JSR.

## Development Workflow

**After making changes to code:**
1. **Type check:** `bunx tsc --noEmit` (from package directory)
2. **Run tests:** `bun test` (from package or root directory)
3. **For sqlite package:** Also run Node.js tests after building:
   ```bash
   bunx pkgroll && node --test tests/node.test.ts
   ```

**Before publishing:** The `prepublishOnly` script automatically runs type checking, builds, and runs all tests.

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
bun test packages/sqlite/tests/
```

**Run a single test file:**
```bash
bun test packages/core/tests/index.test.ts
```

**Redis tests with real Redis (instead of ioredis-mock):**
```bash
USE_REAL_REDIS=1 bun test packages/redis/tests/
```

**SQLite tests (dual runtime support):**
```bash
# Run only Bun runtime tests
bun test packages/sqlite/tests/index.test.ts

# Run Node.js tests with Node.js native test runner (requires build first)
cd packages/sqlite && bunx pkgroll && node --test tests/node.test.ts
```

**Note:** Node.js tests require the package to be built first because they import from `dist/node.js`. The `prepublishOnly` script handles this automatically.

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
- **`sqlite`** (`@gramio/storage-sqlite`) — SQLite adapter with dual runtime support (Bun and Node.js), includes TTL support

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
- SQLite tests use in-memory databases and have dual runtime support:
  - `tests/index.test.ts` — Tests Bun runtime using `bun:sqlite` and `bun:test` (imports from `src/bun.ts`)
  - `tests/node.test.ts` — Tests Node.js runtime using `node:sqlite` and `node:test` (imports from `dist/node.js`, requires build)
  - The `prepublishOnly` script runs: typecheck → build → bun tests → node tests
