const express = require("express");

const app = express();
const PORT = 3000;

const {
  buildHashRing,
  checkRateLimit,
  LoadBalancer,
  generateRandomIP,
  metrics,
  nodeConfigs,
} = require("./balancer");

buildHashRing();

app.get("/request", (req, res) => {
  const ip = req.query.ip || generateRandomIP();

  if (!checkRateLimit(ip)) {
    return res
      .status(429)
      .json({ error: "Rate limit exceeded. Try again later." });
  }

  try {
    const node = LoadBalancer(ip);
    res.json({ message: "Request successful", ip: ip, routedTo: node });
  } catch (error) {
    res.status(503).json({ error: error.message });
  }
});

// Metrics dashboard
app.get("/metrics", (req, res) => {
  res.json({
    totalRequestsRouted: Object.values(metrics).reduce((a, b) => a + b, 0),
    nodeDistribution: metrics,
    activeNodes: Object.keys(nodeConfigs).filter(
      (n) => nodeConfigs[n].isHealthy,
    ),
  });
});

// Node failure simulation
app.post("/simulate-failure/:node", (req, res) => {
  const node = req.params.node;
  if (nodeConfigs[node]) {
    nodeConfigs[node].isHealthy = !nodeConfigs[node].isHealthy;
    buildHashRing();
    res.json({
      message: `${node} health status changed to ${nodeConfigs[node].isHealthy}`,
    });
  } else {
    res.status(404).json({ error: "Node not found" });
  }
});

// Simulation with single API call
app.get("/simulate", (req, res) => {
  let results = [];
  const requestCount = req.query.count ? parseInt(req.query.count) : 10;

  for (let i = 0; i < requestCount; i++) {
    const ip = generateRandomIP();
    const node = LoadBalancer(ip);
    results.push({ ip, node });
  }
  res.json({ simulationRun: requestCount, results });
});

app.get("/", (req, res) => {
  res.send(
    `<p>Send request to <a href="/request">"/request?ip=[ip]"</a> to get result or to <a href="/simulate">"/simulate"</a> to auto simulate multiple requests</p>`,
  );
});

app.listen(PORT, () => {
  console.log(`Load Balancer running on http://localhost:${PORT}`);
});
