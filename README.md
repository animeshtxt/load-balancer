# Custom Load Balancer Implementation

This project implements a custom load balancer in Node.js/Express, replacing basic random routing with Consistent Hashing to ensure sticky sessions based on IP addresses.

## Core Features Implemented

- **Consistent Hashing:** Guarantees an IP always routes to the same node, even if the node pool size changes.
- **In-memory state:** Fully adheres to constraints. No external databases used.
- **Logging:** Native terminal logging for every routed request.

## More Features Implemented

- **Weighted Routing:** Node-B is configured to take 2x the traffic of Node-A and Node-C.
- **Node failure simulation:** API endpoint to simulate a node going offline and automatically rebuilding the hash ring.
- **Rate Limiting:** Protects endpoints by limiting IPs to 10 requests per 10 seconds.
- **Metrics Dashboard:** Real-time JSON dashboard to view request distribution.

## Setup & Run Instructions

1. Ensure [Node.js](https://nodejs.org/) installed
2. Clone the repository: `git clone https://github.com/animeshtxt/load-balancer.git`.

3. Move to the root directory: `cd load-balancer`
4. Run `npm install` to install dependencies (express, crypto).
5. Run `node index.js` to start the server.
6. The APIs will be available at `http://localhost:3000`.

## API Endpoints

- `GET /request` - Simulates a single request (auto-generates a random IP if `?ip=x.x.x.x` is not provided).
- `GET /simulate?count=10` - Runs the batch simulation function.
- `GET /metrics` - View the simple metrics dashboard.
- `POST /simulate-failure/Node-C` - Toggles the health status of a node to test fallback and hash ring reconstruction.
