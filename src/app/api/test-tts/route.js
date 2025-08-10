// src/app/api/test-tts/route.js
// import { ElevenLabsClient } from "elevenlabs";
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

export const runtime = "nodejs";

export async function GET() {
  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
  
  if (!ELEVENLABS_API_KEY) {
    return new Response(JSON.stringify({ 
      status: "error",
      message: "No API key found",
      debug: "ELEVENLABS_API_KEY environment variable is not set"
    }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const client = new ElevenLabsClient({ apiKey: ELEVENLABS_API_KEY });
    
    // Test the API key by trying to get user info
    const user = await client.user.get();
    
    return new Response(JSON.stringify({ 
      status: "success",
      message: "API key is valid",
      user: {
        subscription: user.subscription,
        isNewUser: user.isNewUser,
        xiApiKey: user.xiApiKey ? "***" + user.xiApiKey.slice(-4) : "not found"
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Test TTS error:", error);
    
    return new Response(JSON.stringify({ 
      status: "error",
      message: "API key validation failed",
      error: error.message,
      statusCode: error.statusCode || "unknown",
      debug: {
        hasApiKey: !!ELEVENLABS_API_KEY,
        keyLength: ELEVENLABS_API_KEY ? ELEVENLABS_API_KEY.length : 0,
        keyPrefix: ELEVENLABS_API_KEY ? ELEVENLABS_API_KEY.substring(0, 4) + '...' : 'none'
      }
    }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
