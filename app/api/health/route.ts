import { NextResponse } from "next/server";
import { getHealthStats, getCacheStats } from "@/lib/loadBalancer";

/**
 * GET /api/health
 * Returns load balancer health stats, model performance metrics, and cache status.
 * Useful for monitoring and debugging latency issues.
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    loadBalancer: {
      models: getHealthStats(),
      cache: getCacheStats(),
    },
  });
}
