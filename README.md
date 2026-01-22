# next-env-dotenv

A simplified reimplementation of Next.js's `@next/env` package using `dotenv` and `dotenv-expand`. This package loads environment variables from `.env` and `.env.${NODE_ENV}` files only.

## Installation

```bash
npm install next-env-dotenv
```

## Usage

```typescript
import { loadEnvConfig } from 'next-env-dotenv'

// Load environment variables from the current directory
const { combinedEnv, loadedEnvFiles } = loadEnvConfig(process.cwd())

// Or specify a custom directory
const { combinedEnv, loadedEnvFiles } = loadEnvConfig('/path/to/your/project')
```

## Features

- **Simple**: Only loads `.env` and `.env.${NODE_ENV}` files
- **Variable Expansion**: Supports variable expansion using `dotenv-expand` (e.g., `API_URL=${BASE_URL}/api`)
- **TypeScript**: Full TypeScript support with type definitions
- **Compatible**: Similar API to `@next/env` for easy migration

## Environment File Loading Order

1. `.env` - Base environment variables
2. `.env.${NODE_ENV}` - Environment-specific overrides (e.g., `.env.development`, `.env.production`)

**Note**: Environment-specific files take precedence over the base `.env` file.

## API

### `loadEnvConfig(dir, dev?, log?)`

Loads environment variables from `.env` files in the specified directory.

**Parameters:**
- `dir` (string): Directory to load .env files from
- `dev` (boolean, optional): Deprecated, kept for compatibility
- `log` (boolean, optional): Whether to log loaded files (default: true)

**Returns:**
```typescript
{
  combinedEnv: { [key: string]: string | undefined }
  loadedEnvFiles: Array<{ path: string; contents: string }>
}
```

### `processEnv(loadedEnvFiles, dir?)`

Process already loaded environment files and merge them into `process.env`.

### `updateInitialEnv(newEnv)`

Update the initial environment snapshot used by `resetEnv()`.

### `resetEnv()`

Reset `process.env` to its initial state before any modifications.

## Differences from @next/env

This package is a simplified version that:
- Only loads `.env` and `.env.${NODE_ENV}` (no `.env.local`, `.env.development.local`, etc.)
- Uses `dotenv` and `dotenv-expand` directly
- Simpler implementation with fewer features
- No file watching or automatic reloading

## License

MIT