// // src/app/api/tts/route.js
// // import { ElevenLabsClient } from "elevenlabs";
// import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

// import { v2 as cloudinary } from "cloudinary";
// import fs from "fs/promises";
// import path from "path";

// export const runtime = "nodejs";

// export async function POST(req) {
//   const { text } = await req.json();
//   if (!text) {
//     return new Response(JSON.stringify({ error: "Text is required" }), {
//       status: 400,
//       headers: { "Content-Type": "application/json" },
//     });
//   }

//   const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
//   const {
//     NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
//     CLOUDINARY_API_KEY,
//     CLOUDINARY_API_SECRET,
//   } = process.env;

//   // Debug logging (remove in production)
//   console.log("Environment check:", {
//     hasElevenLabsKey: !!ELEVENLABS_API_KEY,
//     keyLength: ELEVENLABS_API_KEY ? ELEVENLABS_API_KEY.length : 0,
//     keyPrefix: ELEVENLABS_API_KEY ? ELEVENLABS_API_KEY.substring(0, 4) + '...' : 'none'
//   });

//   if (!ELEVENLABS_API_KEY) {
//     return new Response(JSON.stringify({ 
//       error: "ElevenLabs API key missing. Please add ELEVENLABS_API_KEY to your .env.local file.",
//       debug: "No API key found in environment variables"
//     }), {
//       status: 500,
//       headers: { "Content-Type": "application/json" },
//     });
//   }

//   if (!NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
//     return new Response(JSON.stringify({ error: "Cloudinary mis-configuration" }), {
//       status: 500,
//       headers: { "Content-Type": "application/json" },
//     });
//   }

//   let audioBuffer;
//   try {
//     // Initialize ElevenLabs client
//     const client = new ElevenLabsClient({
//       // apiKey: ELEVENLABS_API_KEY,
//       apiKey: process.env.ELEVENLABS_API_KEY,
//     });

//     console.log("Attempting TTS generation with voice ID: 21m00Tcm4TlvDq8ikWAM");
    
//     // Use the correct API method for text-to-speech
//     // The API expects voice_id as a string and text as a string
//     const audioStream = await client.generate({
//       text: text,
//       voice_id: "21m00Tcm4TlvDq8ikWAM",
//       model_id: "eleven_monolingual_v1",
//       voice_settings: {
//         stability: 0.5,
//         similarity_boost: 0.5
//       }
//     });

//     audioBuffer = Buffer.concat(await streamToBuffer(audioStream));
//   } catch (err) {
//     console.error("TTS error:", err);
//     console.error("Error details:", {
//       statusCode: err.statusCode,
//       message: err.message,
//       body: err.body,
//       stack: err.stack
//     });
    
//     // Handle invalid API key - check if it's a format issue
//     if (err.statusCode === 401) {
//       let errorMessage = "Invalid or expired API key. Please check your ElevenLabs API key at https://elevenlabs.io/";
//       let details = "The API key provided is not valid or has expired. Please verify you're using the correct key from your ElevenLabs dashboard.";
      
//       // Check if it might be a format issue
//       if (ELEVENLABS_API_KEY && !ELEVENLABS_API_KEY.startsWith('xi-api-key:-')) {
//         errorMessage = "Invalid API key format. ElevenLabs API keys should start with 'xi-api-key:-'";
//         details = "Please ensure your API key starts with 'xi-api-key:-' and is copied correctly from the ElevenLabs dashboard.";
//       }
      
//       return new Response(JSON.stringify({ 
//         error: errorMessage,
//         details: details,
//         debug: {
//           statusCode: err.statusCode,
//           hasBody: !!err.body,
//           message: err.message,
//           keyFormat: ELEVENLABS_API_KEY ? ELEVENLABS_API_KEY.substring(0, 7) : 'none'
//         }
//       }), {
//         status: 401,
//         headers: { "Content-Type": "application/json" },
//       });
//     }
    
//     // Handle specific permission errors
//     if (err.statusCode === 401 && err.body?.detail?.status === "missing_permissions") {
//       return new Response(JSON.stringify({ 
//         error: "API key missing required permissions. Please ensure your ElevenLabs API key has the necessary permissions. You may need to upgrade your plan at https://elevenlabs.io/ or check your API key settings.", 
//         details: err.body.detail.message 
//       }), {
//         status: 401,
//         headers: { "Content-Type": "application/json" },
//       });
//     }
    
//     // Handle other API errors
//     if (err.statusCode) {
//       return new Response(JSON.stringify({ 
//         error: `TTS generation failed (Status: ${err.statusCode})`, 
//         details: err.body?.detail?.message || err.message || "Unknown error occurred"
//       }), {
//         status: err.statusCode,
//         headers: { "Content-Type": "application/json" },
//       });
//     }
    
//     return new Response(JSON.stringify({ error: "TTS generation failed", details: err.message }), {
//       status: 500,
//       headers: { "Content-Type": "application/json" },
//     });
//   }

//   // Save temporarily for Cloudinary upload
//   const tempFilePath = path.join("/tmp", `tts-${Date.now()}.mp3`);
//   await fs.writeFile(tempFilePath, audioBuffer);

//   // Upload to Cloudinary
//   cloudinary.config({
//     cloud_name: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
//     api_key: CLOUDINARY_API_KEY,
//     api_secret: CLOUDINARY_API_SECRET,
//   });

//   let uploadRes;
//   try {
//     uploadRes = await cloudinary.uploader.upload(tempFilePath, {
//       resource_type: "video", // Cloudinary uses "video" for audio files
//       folder: "tts-generations",
//       public_id: `tts-${Date.now()}`,
//       context: { text, model: "elevenlabs", generated_at: new Date().toISOString() },
//     });
//     await fs.unlink(tempFilePath); // Clean up temp file
//   } catch (e) {
//     console.error("Cloudinary upload failed:", e);
//     return new Response(JSON.stringify({ error: "Upload to Cloudinary failed", details: e.message }), {
//       status: 500,
//       headers: { "Content-Type": "application/json" },
//     });
//   }

//   return new Response(JSON.stringify({ audioUrl: uploadRes.secure_url, publicId: uploadRes.public_id }), {
//     status: 200,
//     headers: { "Content-Type": "application/json" },
//   });
// }

// // Helper to convert stream to buffer
// async function streamToBuffer(stream) {
//   const chunks = [];
//   for await (const chunk of stream) {
//     chunks.push(chunk);
//   }
//   return Buffer.concat(chunks);
// }

import fs from "fs/promises";
import path from "path";
import os from "os";

export const runtime = "nodejs";

export async function POST(req) {
  let text;
  try {
    const body = await req.json();
    text = body.text;
  } catch (e) {
    return new Response(JSON.stringify({ 
      error: "Invalid JSON body",
      details: "Failed to parse request body. Ensure it’s valid JSON with a 'text' field."
    }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!text) {
    return new Response(JSON.stringify({ 
      error: "Text is required",
      details: "The 'text' field in the request body is missing or empty"
    }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

  console.log("Environment check:", {
    hasElevenLabsKey: !!ELEVENLABS_API_KEY,
    keyLength: ELEVENLABS_API_KEY ? ELEVENLABS_API_KEY.length : 0,
    keyPrefix: ELEVENLABS_API_KEY ? ELEVENLABS_API_KEY.substring(0, 4) + '...' : 'none'
  });

  if (!ELEVENLABS_API_KEY) {
    return new Response(JSON.stringify({ 
      error: "ElevenLabs API key missing. Please add ELEVENLABS_API_KEY to your .env.local file.",
      debug: "No API key found in environment variables"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let audioBuffer;
  let response;
  try {
    console.log("Attempting TTS generation with voice ID: 21m00Tcm4TlvDq8ikWAM");
    
    response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.log("API response:", errorBody);
      throw new Error(`HTTP error ${response.status}: ${errorBody}`);
    }

    const audioStream = response.body;
    audioBuffer = await streamToBuffer(audioStream);
  } catch (err) {
    console.error("TTS error:", err);
    console.error("Error details:", {
      statusCode: err.statusCode || response?.status,
      message: err.message,
      body: err.body,
      stack: err.stack
    });

    if (err.statusCode === 401 || response?.status === 401) {
      return new Response(JSON.stringify({ 
        error: "Invalid or expired API key. Please check your ElevenLabs API key at https://elevenlabs.io/",
        details: "The API key provided is not valid or has expired. Please verify you're using the correct key from your ElevenLabs dashboard.",
        debug: {
          statusCode: err.statusCode || response?.status,
          hasBody: !!err.body,
          message: err.message,
          keyFormat: ELEVENLABS_API_KEY ? ELEVENLABS_API_KEY.substring(0, 7) : 'none'
        }
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (err.statusCode === 401 && err.body?.detail?.status === "missing_permissions") {
      return new Response(JSON.stringify({ 
        error: "API key missing required permissions. Please ensure your ElevenLabs API key has the necessary permissions. You may need to upgrade your plan at https://elevenlabs.io/ or check your API key settings.", 
        details: err.body.detail.message 
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (err.statusCode || response?.status) {
      return new Response(JSON.stringify({ 
        error: `TTS generation failed (Status: ${err.statusCode || response?.status})`, 
        details: err.body?.detail?.message || err.message || "Unknown error occurred"
      }), {
        status: err.statusCode || response?.status || 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "TTS generation failed", details: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Return the audio buffer directly as an audio/mpeg response
  return new Response(audioBuffer, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Disposition": `attachment; filename="tts-${Date.now()}.mp3"`
    },
  });
}

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}