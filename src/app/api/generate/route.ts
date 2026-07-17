import { NextResponse } from 'next/server';

// Strict schema validation parameters matching your Frontend UI requirements
const responseSchema = {
  type: "OBJECT",
  properties: {
    project_title: { type: "STRING" },
    target_board: { type: "STRING" },
    bill_of_materials: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          item: { type: "STRING" },
          quantity: { type: "INTEGER" }
        },
        required: ["item", "quantity"]
      }
    },
    tools_needed: { type: "ARRAY", items: { type: "STRING" } },
    connections: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          from: { type: "STRING" },
          to: { type: "STRING" }
        },
        required: ["from", "to"]
      }
    },
    warnings: { type: "ARRAY", items: { type: "STRING" } },
    steps: { type: "ARRAY", items: { type: "STRING" } },
    code: { type: "STRING" },
    secondary_code: { type: "STRING" },
    secondary_language: { type: "STRING" },
    youtube_search_query: { type: "STRING" }
  },
  required: [
    "project_title", "target_board", "bill_of_materials", "tools_needed", 
    "connections", "warnings", "steps", "code", "youtube_search_query"
  ]
};

const systemInstructionText = `You are an expert embedded systems technician and electronics hardware engineer. 
Your task is to analyze blueprints and assemble high-quality, fully populated engineering manifests. 

Rules:
1. Always return a complete, valid JSON object matching the requested schema.
2. The "code" parameter must contain fully functional firmware containing no truncation or placeholder stubs.
3. If the user request implies a secondary UI dashboard script running on a host computer (like a Processing GUI, Python Matplotlib dashboard, or HTML page), populate "secondary_code" and name its "secondary_language" explicitly. If not requested, leave "secondary_code" as an empty string.
4. Do not wrap the JSON output block inside markdown code ticks (\`\`\`json). Return the pure raw JSON string directly.`;

export async function POST(req: Request) {
  try {
    const { prompt, board } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "No hardware prompt parameters submitted." }, { status: 400 });
    }

    // Gathers explicit engine keys from your .env.local file
    const keyPool = [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_BACKUP
    ].filter(Boolean); // Discards empty variables safely

    if (keyPool.length === 0) {
      console.error("[API Failover System] Critical: No Gemini credentials found in .env.local");
      return NextResponse.json({ error: "Backend environment key missing error." }, { status: 500 });
    }

    let lastError = null;
    let rawTextResponse = null;

    // Iterates over the backup sequence until one passes 
    for (let i = 0; i < keyPool.length; i++) {
      const activeKey = keyPool[i];
      
      // Dynamic routing: Key 1 uses 2.5-flash, Key 2 uses 3.5-flash as the stable backup
      const targetModel = i === 0 ? "gemini-2.5-flash" : "gemini-3.5-flash";
      
      try {
        console.log(`[API Failover System] Firing content request using Key Slot [${i + 1}/${keyPool.length}] with model ${targetModel}`);

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${activeKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ 
                parts: [{ text: `Target micro-controller hardware board: ${board || 'Arduino Uno'}.\nUser blueprint request description: ${prompt}` }] 
              }],
              systemInstruction: {
                parts: [{ text: systemInstructionText }]
              },
              generationConfig: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.2
              }
            }),
          }
        );

        // Capture raw stream on 200 OK
        if (response.ok) {
          const apiData = await response.json();
          rawTextResponse = apiData.candidates?.[0]?.content?.parts?.[0]?.text;
          
          if (rawTextResponse) {
            console.log(`[API Failover System] Success! Handled flawlessly using Key Slot [${i + 1}] (${targetModel})`);
            break; // Break loop early, we have the valid output payload!
          }
        }

        // If it isn't an OK status, capture the reason and drop to the next loop pass
        const errorDump = await response.json();
        console.warn(`[API Failover System] Key Slot ${i + 1} (${targetModel}) failed with status: ${response.status}. Attempting backup swap...`);
        lastError = errorDump?.error?.message || `HTTP Status Code ${response.status}`;

      } catch (loopError: any) {
        console.error(`[API Failover System] Network error encountered on Key Slot ${i + 1} (${targetModel}):`, loopError);
        lastError = loopError?.message || loopError;
      }
    }

    // Universal validation safeguard check
    if (!rawTextResponse) {
      console.error("[API Failover System] Critical: All keys in target array have been completely exhausted.");
      return NextResponse.json(
        { error: `API capacity limit reached. Underlying error: ${lastError}` },
        { status: 429 }
      );
    }

    // Safely parse out structured JSON text directly to the CircuitAI UI engine
    const cleanProjectJSON = JSON.parse(rawTextResponse);
    return NextResponse.json(cleanProjectJSON);

  } catch (globalError: any) {
    console.error("[API Route Root Exception]:", globalError);
    return NextResponse.json(
      { error: "Internal compilation failure parsing matrix structural mapping data." }, 
      { status: 500 }
    );
  }
}