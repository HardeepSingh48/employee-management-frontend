// src/app/api/auth/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  // do something with body...
  return NextResponse.json({ message: "Auth API working!", body });
}

// You can also add GET if needed:
export async function GET() {
  return NextResponse.json({ message: "Auth API GET endpoint works!" });
}
