const crypto = require("crypto");

function generateRandomIP() {
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join(
    ".",
  );
}

function identifyNode(ip, selectedNode) {
  console.log(`Incoming IP: ${ip} → Routed to: ${selectedNode}`);
}

const nodeConfigs = {
  "Node-A": { weight: 1, isHealthy: true },
  "Node-B": { weight: 2, isHealthy: true },
  "Node-C": { weight: 1, isHealthy: true },
};

const metrics = { "Node-A": 0, "Node-B": 0, "Node-C": 0 };
const rateLimits = new Map();

let hashRing = [];

function hashString(str) {
  return crypto.createHash("md5").update(str).digest("hex");
}

function buildHashRing() {
  hashRing = [];
  for (const [nodeName, config] of Object.entries(nodeConfigs)) {
    if (config.isHealthy) {
      const virtualNodes = config.weight * 3;
      for (let i = 0; i < virtualNodes; i++) {
        const hash = hashString(`${nodeName}-vn-${i}`);
        hashRing.push({ hash, nodeName });
      }
    }
  }
  hashRing.sort((a, b) => a.hash.localeCompare(b.hash));
}

function LoadBalancer(ip) {
  if (hashRing.length === 0) {
    throw new Error("No healthy nodes available!");
  }

  const ipHash = hashString(ip);
  let selectedNode = hashRing[0].nodeName;

  for (const ringItem of hashRing) {
    if (ringItem.hash >= ipHash) {
      selectedNode = ringItem.nodeName;
      break;
    }
  }

  identifyNode(ip, selectedNode);
  metrics[selectedNode]++;

  return selectedNode;
}

function checkRateLimit(ip) {
  const NOW = Date.now();
  const WINDOW_MS = 10000;
  const MAX_REQUESTS = 10;

  if (!rateLimits.has(ip)) {
    rateLimits.set(ip, { count: 1, resetTime: NOW + WINDOW_MS });
    return true;
  }

  const record = rateLimits.get(ip);
  if (NOW > record.resetTime) {
    rateLimits.set(ip, { count: 1, resetTime: NOW + WINDOW_MS });
    return true;
  }

  if (record.count >= MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

module.exports = {
  buildHashRing,
  checkRateLimit,
  LoadBalancer,
  generateRandomIP,
  metrics,
  nodeConfigs,
};
