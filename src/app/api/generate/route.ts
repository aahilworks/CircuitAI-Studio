import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { ensureProAccessSynced } from '@/lib/server/subscription';

interface GenerateRequestBody {
  prompt?: string;
  board?: string;
  userId?: string;
  isModification?: boolean;
  sessionId?: string;
  currentProject?: unknown;
}

interface GeminiErrorPayload {
  error?: { message?: string };
}

interface GeminiResponsePayload {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : String(error);
const getUsageMonth = () => new Date().toISOString().slice(0, 7);

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
          quantity: { type: "INTEGER" },
          estimated_price: { type: "STRING" },
          buying_tip: { type: "STRING" },
          alternative: { type: "STRING" }
        },
        required: ["item", "quantity", "estimated_price", "buying_tip", "alternative"]
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
    estimated_time: { type: "STRING" },
    difficulty: { type: "STRING" },
    safety_level: { type: "STRING" },
    learning_goals: { type: "ARRAY", items: { type: "STRING" } },
    test_plan: { type: "ARRAY", items: { type: "STRING" } },
    troubleshooting: { type: "ARRAY", items: { type: "STRING" } },
    next_upgrades: { type: "ARRAY", items: { type: "STRING" } },
    upload_guide: {
      type: "OBJECT",
      properties: {
        ide: { type: "STRING" },
        board_package: { type: "STRING" },
        required_libraries: { type: "ARRAY", items: { type: "STRING" } },
        steps: { type: "ARRAY", items: { type: "STRING" } },
        serial_monitor: { type: "STRING" },
        common_errors: { type: "ARRAY", items: { type: "STRING" } },
        upload_checklist: { type: "ARRAY", items: { type: "STRING" } }
      },
      required: ["ide", "board_package", "required_libraries", "steps", "serial_monitor", "common_errors", "upload_checklist"]
    },
    simulation: {
      type: "OBJECT",
      properties: {
        inputs: { type: "ARRAY", items: { type: "STRING" } },
        outputs: { type: "ARRAY", items: { type: "STRING" } },
        states: { type: "ARRAY", items: { type: "STRING" } },
        sample_readings: { type: "ARRAY", items: { type: "STRING" } },
        expected_behavior: { type: "ARRAY", items: { type: "STRING" } }
      },
      required: ["inputs", "outputs", "states", "sample_readings", "expected_behavior"]
    },
    teacher_mode: {
      type: "OBJECT",
      properties: {
        abstract: { type: "STRING" },
        working_principle: { type: "STRING" },
        applications: { type: "ARRAY", items: { type: "STRING" } },
        viva_questions: { type: "ARRAY", items: { type: "STRING" } },
        rubric: { type: "ARRAY", items: { type: "STRING" } },
        conclusion: { type: "STRING" }
      },
      required: ["abstract", "working_principle", "applications", "viva_questions", "rubric", "conclusion"]
    },
    code_explanation: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          concept: { type: "STRING" },
          code_reference: { type: "STRING" },
          explanation: { type: "STRING" }
        },
        required: ["concept", "code_reference", "explanation"]
      }
    },
    presentation_slides: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          bullets: { type: "ARRAY", items: { type: "STRING" } },
          speaker_notes: { type: "STRING" }
        },
        required: ["title", "bullets", "speaker_notes"]
      }
    },
    youtube_search_query: { type: "STRING" }
  },
  required: [
    "project_title", "target_board", "bill_of_materials", "tools_needed", 
    "connections", "warnings", "steps", "code", "secondary_code", "secondary_language",
    "estimated_time", "difficulty", "safety_level", "learning_goals", "test_plan",
    "troubleshooting", "next_upgrades", "upload_guide", "simulation", "teacher_mode",
    "code_explanation", "presentation_slides", "youtube_search_query"
  ]
};

const systemInstructionText = `You are an expert embedded systems technician and electronics hardware engineer. 
Your task is to help robotics students turn ideas into safe, buildable, school-project-ready engineering manifests. 

Rules:
1. Always return a complete, valid JSON object matching the requested schema.
2. The "code" parameter must contain fully functional firmware containing no truncation or placeholder stubs.
3. If the user request implies a secondary UI dashboard script running on a host computer (like a Processing GUI, Python Matplotlib dashboard, or HTML page), populate "secondary_code" and name its "secondary_language" explicitly. If not requested, leave "secondary_code" as an empty string.
4. Include realistic beginner-friendly learning goals, test plan, troubleshooting points, estimated build time, difficulty, and next upgrades.
5. For every component, include an estimated student-market price range, buying tip, and an alternate part students can use.
6. Include a board-specific code upload guide with IDE, libraries, board package, serial monitor setting, common upload errors, and checklist.
7. Include a simulation plan with inputs, outputs, states, sample readings, and expected behavior students can test before real hardware.
8. Include teacher_mode content with abstract, working principle, applications, viva questions, marking rubric, and conclusion.
9. Include code_explanation entries that explain important firmware blocks in beginner-friendly language.
10. Include exactly 5 presentation_slides: Aim, Components, Circuit & Code, Working/Test, Result/Future Scope.
11. Prefer low-voltage student-safe robotics components. Add warnings for motors, batteries, current draw, shorts, heat, sharp tools, and calibration risks when relevant.
12. Do not wrap the JSON output block inside markdown code ticks (\`\`\`json). Return the pure raw JSON string directly.`;

export async function POST(req: Request) {
  try {
    const { prompt, board, userId, isModification, sessionId, currentProject } = (await req.json()) as GenerateRequestBody;

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "No hardware prompt parameters submitted." }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }

    // -------------------------------------------------------------
    // 1. FIRESTORE USAGE & PRO SUBSCRIPTION CHECKS
    // -------------------------------------------------------------
    const userRef = adminDb.collection('users').doc(userId.trim());
    const userDoc = await userRef.get();
    const userData = userDoc.data() || {};

    const isPro = await ensureProAccessSynced(userId.trim(), userData);

    let currentModCount = 0;
    let currentUsage = 0;
    const usageMonth = getUsageMonth();

    // Limit Checks for Free Users
    if (!isPro) {
      if (isModification) {
        // --- CHECK 10 MODIFICATIONS LIMIT FOR THIS SESSION ---
        if (!sessionId) {
          return NextResponse.json({ error: "Session ID is required for modifications." }, { status: 400 });
        }

        const sessionRef = userRef.collection('chatSessions').doc(sessionId);
        const sessionDoc = await sessionRef.get();
        currentModCount = sessionDoc.data()?.modificationCount || 0;

        if (currentModCount >= 10) {
          return NextResponse.json(
            {
              success: false,
              error: 'MOD_LIMIT_REACHED',
              message: 'This project has reached the 10-modification limit on the Free plan. Subscribe to Pro for unlimited edits!',
            },
            { status: 403 }
          );
        }

      } else {
        // --- CHECK 5 MONTHLY GENERATIONS LIMIT ---
        currentUsage = userData.aiGenerationsUsageMonth === usageMonth
          ? userData.aiGenerationsUsedThisMonth || 0
          : 0;

        if (currentUsage >= 5) {
          return NextResponse.json(
            {
              success: false,
              error: 'QUOTA_EXCEEDED',
              message: 'You have used all 5 of your free AI generations for this month. Subscribe to Pro for unlimited generations!',
            },
            { status: 403 }
          );
        }

        const savedSessionsSnapshot = await userRef.collection('chatSessions').limit(11).get();
        if (savedSessionsSnapshot.size >= 10) {
          return NextResponse.json(
            {
              success: false,
              error: 'SAVED_PROJECT_LIMIT_REACHED',
              message: 'Free workspaces can save up to 10 projects. Subscribe to Pro for unlimited saved projects.',
            },
            { status: 403 }
          );
        }
      }
    }

    // -------------------------------------------------------------
    // 2. GEMINI AI ENGINE GENERATION & FAILOVER SYSTEM
    // -------------------------------------------------------------
    const keyPool = [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_BACKUP
    ].filter(Boolean); // Discards empty variables safely

    if (keyPool.length === 0) {
      console.error("[API Failover System] Critical: No Gemini credentials found in .env.local");
      return NextResponse.json({ error: "Backend environment key missing error." }, { status: 500 });
    }

    let lastError: string | null = null;
    let rawTextResponse: string | null = null;

    // Iterates over the backup sequence until one passes 
    for (let i = 0; i < keyPool.length; i++) {
      const activeKey = keyPool[i];
      
      const targetModel = "gemini-2.5-flash";
      
      try {
        console.log(`[API Failover System] Firing content request using Key Slot [${i + 1}/${keyPool.length}] with model ${targetModel}`);

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${activeKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ 
                parts: [{ text: `Target micro-controller hardware board: ${board || 'Arduino Uno'}.
User blueprint request description: ${prompt}
${currentProject ? `Existing project JSON to preserve and modify when relevant: ${JSON.stringify(currentProject)}` : ''}` }] 
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
          const apiData = await response.json() as GeminiResponsePayload;
          rawTextResponse = apiData.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
          
          if (rawTextResponse) {
            console.log(`[API Failover System] Success! Handled flawlessly using Key Slot [${i + 1}] (${targetModel})`);
            break; // Break loop early, we have the valid output payload!
          }
        }

        // If it isn't an OK status, capture the reason and drop to the next loop pass
        const errorDump = await response.json().catch(() => ({})) as GeminiErrorPayload;
        console.warn(`[API Failover System] Key Slot ${i + 1} (${targetModel}) failed with status: ${response.status}. Attempting backup swap...`);
        lastError = errorDump?.error?.message || `HTTP Status Code ${response.status}`;

      } catch (loopError: unknown) {
        console.error(`[API Failover System] Network error encountered on Key Slot ${i + 1} (${targetModel}):`, loopError);
        lastError = getErrorMessage(loopError);
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
    
    if (!isPro) {
      if (isModification && sessionId) {
        await userRef.collection('chatSessions').doc(sessionId).set(
          {
            modificationCount: currentModCount + 1,
            lastUpdated: new Date().toISOString(),
          },
          { merge: true }
        );
      } else {
        await userRef.set(
          {
            aiGenerationsUsedThisMonth: currentUsage + 1,
            aiGenerationsUsageMonth: usageMonth,
            lastActive: new Date().toISOString(),
          },
          { merge: true }
        );
      }
    }

    return NextResponse.json(cleanProjectJSON);

  } catch (globalError: unknown) {
    console.error("[API Route Root Exception]:", globalError);
    return NextResponse.json(
      { error: "Internal compilation failure parsing matrix structural mapping data.", message: getErrorMessage(globalError) }, 
      { status: 500 }
    );
  }
}
