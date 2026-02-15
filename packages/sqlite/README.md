# @gramio/storage-sqlite

SQLite storage adapter for GramIO with support for both Bun and Node.js runtimes.

## Features

- Dual runtime support (Bun and Node.js)
- TTL (Time To Live) support
- Type-safe storage interface
- JSON serialization
- In-memory and file-based databases

## Installation

```bash
npm install @gramio/storage-sqlite
# or
bun add @gramio/storage-sqlite
```

## Usage

### Bun

```typescript
import Database from "bun:sqlite";
import { sqliteStorage } from "@gramio/storage-sqlite";

const db = new Database("mydb.sqlite");
const storage = sqliteStorage({ db });

await storage.set("key", "value");
const value = await storage.get("key");
```

### Node.js

```typescript
import { DatabaseSync } from "node:sqlite";
import { sqliteStorage } from "@gramio/storage-sqlite";

const db = new DatabaseSync("mydb.sqlite");
const storage = sqliteStorage({ db });

await storage.set("key", "value");
const value = await storage.get("key");
```

## Options

- `db`: SQLite database instance (required)
- `$ttl`: Time to live in seconds (optional)

## Testing

Run Bun tests:
```bash
bun test tests/index.test.ts
```

Run Node.js tests with Node.js native test runner (requires build first):
```bash
bunx pkgroll && node --test tests/node.test.ts
```

**Note:** Node.js tests import from the built distribution (`dist/node.js`) rather than source files, so the package must be built before running Node.js tests. The `prepublishOnly` script handles this automatically by running: typecheck → build → bun tests → node tests.
