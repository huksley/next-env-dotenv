import * as dotenv from 'dotenv'
import * as dotenvExpand from 'dotenv-expand'
import * as fs from 'fs'
import * as path from 'path'

export type Env = { [key: string]: string | undefined }

export interface LoadedEnvFiles {
  path: string
  contents: string
}

let initialEnv: Env | undefined = undefined

/**
 * Load environment variables from .env and .env.${NODE_ENV} files
 * @param dir - Directory to load .env files from
 * @param dev - Whether running in development mode (optional, deprecated)
 * @param log - Whether to log loaded files (default: true)
 * @returns Object containing combined env, loaded env, and loaded file info
 */
export function loadEnvConfig(
  dir: string,
  dev?: boolean,
  log: boolean = true
): {
  combinedEnv: Env
  loadedEnvFiles: LoadedEnvFiles[]
} {
  // Store initial environment if not already stored
  if (!initialEnv) {
    initialEnv = Object.assign({}, process.env)
  }

  const loadedEnvFiles: LoadedEnvFiles[] = []
  const combinedEnv: Env = {}

  // Determine which .env files to load
  const envFiles = [
    '.env',
    process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : null,
  ].filter(Boolean) as string[]

  // Load each env file in order
  for (const envFile of envFiles) {
    const envPath = path.join(dir, envFile)

    try {
      // Check if file exists and is readable
      const stat = fs.statSync(envPath)
      if (!stat.isFile()) {
        continue
      }

      const contents = fs.readFileSync(envPath, 'utf8')

      // Parse the env file using dotenv
      const parsed = dotenv.parse(contents)

      // Expand variables using dotenv-expand
      const expanded = dotenvExpand.expand({
        parsed,
        processEnv: { ...process.env, ...combinedEnv },
      })

      // Merge expanded values into combinedEnv
      if (expanded.parsed) {
        Object.assign(combinedEnv, expanded.parsed)
      }

      // Store the loaded file info
      loadedEnvFiles.push({
        path: envPath,
        contents,
      })

      if (log) {
        console.log(`Loaded env from ${envPath}`)
      }
    } catch (err: any) {
      // File doesn't exist or can't be read - skip silently
      if (err.code !== 'ENOENT') {
        if (log) {
          console.error(`Failed to load env from ${envPath}:`, err.message)
        }
      }
    }
  }

  // Merge loaded env into process.env (but don't override existing values)
  for (const key of Object.keys(combinedEnv)) {
    if (
      typeof process.env[key] === 'undefined' ||
      process.env[key] === ''
    ) {
      process.env[key] = combinedEnv[key]
    }
  }

  return {
    combinedEnv,
    loadedEnvFiles,
  }
}

/**
 * Process environment files and load them into process.env
 * @param loadedEnvFiles - Array of loaded env file objects
 * @param dir - Directory path (optional)
 * @returns Combined environment object
 */
export function processEnv(
  loadedEnvFiles: LoadedEnvFiles[],
  dir?: string
): Env {
  const combinedEnv: Env = {}

  for (const envFile of loadedEnvFiles) {
    const parsed = dotenv.parse(envFile.contents)

    const expanded = dotenvExpand.expand({
      parsed,
      processEnv: { ...process.env, ...combinedEnv },
    })

    if (expanded.parsed) {
      Object.assign(combinedEnv, expanded.parsed)
    }
  }

  // Merge into process.env
  for (const key of Object.keys(combinedEnv)) {
    if (
      typeof process.env[key] === 'undefined' ||
      process.env[key] === ''
    ) {
      process.env[key] = combinedEnv[key]
    }
  }

  return combinedEnv
}

/**
 * Update the initial environment snapshot
 * @param newEnv - New environment to use as baseline
 */
export function updateInitialEnv(newEnv: Env): void {
  initialEnv = Object.assign({}, newEnv)
}

/**
 * Reset process.env to its initial state
 */
export function resetEnv(): void {
  if (!initialEnv) {
    return
  }

  // Remove all current env vars except Next.js internal ones
  for (const key of Object.keys(process.env)) {
    if (!key.startsWith('__NEXT_PRIVATE')) {
      delete process.env[key]
    }
  }

  // Restore initial env
  Object.assign(process.env, initialEnv)
}
