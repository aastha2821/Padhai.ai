import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, count = 5 } = body;

    console.log('[FRONTEND API] Generate notes request:', { topic, count });

    if (!topic) {
      return NextResponse.json({ 
        status: "error",
        message: "Topic is required" 
      }, { status: 400 });
    }

    const backendUrl = `${BACKEND_URL}/api/generate-notes`;
    console.log('[FRONTEND API] Calling backend:', backendUrl);

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic,
        count,
      }),
    });

    console.log('[FRONTEND API] Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[FRONTEND API] Backend error response:', errorText);
      return NextResponse.json(
        { 
          status: "error",
          message: `Backend returned ${response.status}: ${errorText}` 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[FRONTEND API] Backend data:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[FRONTEND API] Generate notes error:", error);
    return NextResponse.json(
      { 
        status: "error",
        message: `Failed to generate notes: ${error instanceof Error ? error.message : String(error)}` 
      },
      { status: 500 }
    );
  }
}
