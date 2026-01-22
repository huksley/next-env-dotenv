# next-env-dotenv

A simplified implementation of Next.js's `next-env` package using `dotenv`. This package loads environment variables from `.env` and `.env.NODE_ENV` files.

## Features

- Loads `.env` and `.env.NODE_ENV` environment files
- Supports variable expansion using `dotenv-expand`
- Does not override existing environment variables
- Compatible with Next.js's `next-env` API

## Installation

```bash
npm install next-env-dotenv
```

## Usage

```typescript
import { loadEnvConfig } from 'next-env-dotenv'

// Load environment variables from the current directory
const result = loadEnvConfig(process.cwd())

console.log('Loaded env files:', result.loadedEnvFiles)
console.log('Combined env:', result.combinedEnv)
```

## API

### `loadEnvConfig(dir, dev?, log?, forceReload?, onReload?)`

Loads environment variables from `.env` and `.env.NODE_ENV` files in the specified directory.

**Parameters:**
- `dir` (string): Directory to load .env files from
- `dev` (boolean, optional): Development mode flag
- `log` (Log, optional): Logger object with `info` and `error` methods
- `forceReload` (boolean, optional): Force reload of environment variables
- `onReload` (function, optional): Callback called when an env file is reloaded

**Returns:**
- `combinedEnv` (Env): Combined environment variables
- `parsedEnv` (Env): Parsed environment variables from .env files
- `loadedEnvFiles` (LoadedEnvFiles): Array of loaded .env files

### `processEnv(loadedEnvFiles, dir?, log?, forceReload?, onReload?)`

Processes loaded environment files and merges them into `process.env`.

### `resetEnv()`

Resets `process.env` to its initial state.

### `updateInitialEnv(newEnv)`

Updates the initial environment with new values.

### `resetInitialEnv()`

Resets the module state (useful for testing).

## Environment File Loading Order

1. `.env.NODE_ENV` (if `NODE_ENV` is set, e.g., `.env.production`, `.env.development`)
2. `.env`

Variables defined earlier in the list take precedence. Existing environment variables are never overridden.

## Differences from Next.js's next-env

This is a simplified version that only loads:
- `.env`
- `.env.NODE_ENV` (e.g., `.env.production`, `.env.development`, `.env.test`)

The original Next.js implementation also loads:
- `.env.local`
- `.env.NODE_ENV.local`
- Additional environment-specific files

## License

MIT
