import { NextResponse } from "next/server";

/**
 * Health check endpoint for load balancers, ECS, and monitoring.
 * GET /api/health → { status: "ok", timestamp }
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "learning-platform",
    },
    { status: 200 }
  );
}
