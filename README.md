# next-env-dotenv

A simplified implementation of Next.js's `next-env` package using `dotenv`. This package loads environment variables from `.env` and `.env.${process.env.NODE_ENV}` files.

## Features

- Loads `.env` and `.env.${process.env.NODE_ENV}` environment files
- Supports variable expansion using `dotenv-expand`
- Does not override existing environment variables
- Compatible with Next.js's `@next/env` API

## Installation

```bash
npm install next-env-dotenv
```

## Using it instead of @next/env

Add to package.json: 

```json
{
  ...
  "overrides": {
    "next": {
      "@next/env": "@huksley/next-env-dotenv@1.0.3"
    }
  }
}
```

Install NextJS again: `npm i next@16`

## Differences from Next.js's next-env

This version loads:

If NEXT_ENV_FILE specified, will load that file instead of NODE_ENV

- `.env.${process.env.NEXT_ENV_FILE}` - if `NEXT_ENV_FILE` is specified
- `.env.${process.env.NODE_ENV}` - if `NODE_ENV` is set and `NEXT_ENV_FILE` is not specified)
- `.env`

The original Next.js implementation also loads:
- `.env.local`
- `.env.NODE_ENV.local`
- Additional environment-specific files

## License

MIT
