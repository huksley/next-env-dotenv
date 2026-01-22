# next-env-dotenv

This project is a drop-in replacement for `@next/env`, uses npm overrides mechanism and allows you to run local development next server with configuration variables from different environments, development, staging, production etc. You are not limited to 1 environment, as with classic next environment resolution mechanism.

Next.js versions supported: 14, 15, 16.

## Features

- Supports custom `NEXT_ENV_FILE` to load instead of `.env.${process.env.NODE_ENV}`
- Loads `.env.${process.env.NODE_ENV}` and `.env` environment files
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
      "@next/env": "@huksley/next-env-dotenv@1.0.33"
    }
  }
}
```

Install NextJS again: `npm i next@16`

## Differences from Next.js's next-env

This version loads:

If NEXT_ENV_FILE specified, will load that file instead of NODE_ENV

- `${process.env.NEXT_ENV_FILE}` - if `NEXT_ENV_FILE` is specified
- `.env.${process.env.NODE_ENV}` - if `NODE_ENV` is set and `NEXT_ENV_FILE` is not specified)
- `.env`

The original Next.js implementation also loads:
- `.env.local`
- `.env.NODE_ENV.local`
- Additional environment-specific files

## License

MIT
