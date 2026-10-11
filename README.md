# JobsterU API

University Career Services API for the JobsterU portal. This service is the backend foundation: configuration, MongoDB, Redis, security middleware, and a place to add product modules. Student, employer, placement, and the other portal modules are not implemented yet.

## Requirements

- Node.js 22+
- Docker, for local MongoDB and Redis

## Run locally

```sh
npm install
npm run services:up
npm run dev
```

The API listens on `http://localhost:4000`. Liveness is `GET /api/v1/health`. Readiness is `GET /api/v1/health/ready`.

Copy `.env.example` to `.env` if you are not using the local file already in this checkout. `.env` is gitignored.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the API with reload |
| `npm start` | Start the API |
| `npm test` | Run foundation tests |
| `npm run services:up` | Start local MongoDB and Redis |
| `npm run services:down` | Stop local MongoDB and Redis |

## Where the next module goes

Add a folder under `src/modules/<name>` with routes, a controller, a service, and a Mongoose model. Register its router in `src/modules/index.js`. Shared responses, validation, auth, passwords, and tokens already live under `src/common` and `src/middleware`.
