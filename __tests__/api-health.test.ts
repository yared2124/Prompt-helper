/**
 * Integration tests for GET /api/health (Load Balancer & System Health endpoint).
 *
 * @jest-environment node
 */

import { GET } from "@/app/api/health/route";

describe("GET /api/health", () => {
  it("returns 200 with system status, model health, and cache statistics", async () => {
    const response = await GET();
    expect(response.status).toBe(200);

    const json = await response.json();

    expect(json.status).toBe("ok");
    expect(typeof json.timestamp).toBe("string");
    expect(new Date(json.timestamp).getTime()).not.toBeNaN();

    // Load balancer stats
    expect(json).toHaveProperty("loadBalancer");
    expect(json.loadBalancer).toHaveProperty("models");
    expect(json.loadBalancer).toHaveProperty("cache");

    // Models health list
    expect(Array.isArray(json.loadBalancer.models)).toBe(true);
    expect(json.loadBalancer.models.length).toBeGreaterThan(0);

    const firstModel = json.loadBalancer.models[0];
    expect(firstModel).toHaveProperty("model");
    expect(firstModel).toHaveProperty("avgLatencyMs");
    expect(firstModel).toHaveProperty("successRate");
    expect(firstModel).toHaveProperty("circuitBroken");
    expect(typeof firstModel.avgLatencyMs).toBe("number");
    expect(typeof firstModel.circuitBroken).toBe("boolean");

    // Cache metrics
    expect(typeof json.loadBalancer.cache.size).toBe("number");
    expect(typeof json.loadBalancer.cache.maxSize).toBe("number");
    expect(json.loadBalancer.cache.maxSize).toBeGreaterThan(0);
  });
});
