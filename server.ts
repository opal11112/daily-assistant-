import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy Google GenAI initialization
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in environment.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Vision Scan Endpoint (Multi-purpose scanner: Money, Plants, Food, Meds, Cleaning, Safety)
app.post("/api/scan-vision", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg", mode = "general", allergies = [] } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64 payload" });
    }

    const ai = getGeminiClient();

    const allergiesContext = allergies && allergies.length > 0 
      ? `CRITICAL ALLERGY LIST: ${allergies.join(", ")}. Carefully inspect for any of these ingredients or cross-contamination warnings.`
      : "User has not declared specific allergies, but flag common allergens (nuts, dairy, gluten, shellfish, soy, eggs).";

    let prompt = "";
    if (mode === "money") {
      prompt = `Analyze this image of currency/money/bill/receipt:
1. Identify all coins, bills, currency denominations, or receipt total lines.
2. Calculate the exact total monetary value and currency code (e.g. USD, EUR, etc.).
3. Itemize each visible denomination or line item with counts and values.
4. Note any visual authenticity indicators or condition notes.`;
    } else if (mode === "clean") {
      prompt = `Analyze this dirty item, stain, or household surface:
1. Identify the surface material (e.g., stainless steel, marble, hardwood, cotton, porcelain) and stain/dirt type.
2. Recommend the safest household cleaning agents (vinegar, baking soda, dish soap, etc.) and what to STRICTLY AVOID (e.g., never mix bleach and ammonia, no acid on marble).
3. Provide step-by-step cleaning procedure.`;
    } else if (mode === "food") {
      prompt = `Analyze this food item, dish, or ingredient nutrition label:
${allergiesContext}
1. Identify the food item or dish name.
2. Parse ingredients or describe likely ingredients.
3. ALLERGY CHECK: List any ingredients that conflict with the user's allergies (${allergies.join(", ") || "none listed"}). If safe, state clearly.
4. Estimate key nutrition facts (calories, protein, carbs, fats) and storage/safety tips.`;
    } else if (mode === "meds") {
      prompt = `Analyze this medication, pill, prescription bottle, or supplement label:
${allergiesContext}
1. Identify the medication name, strength/dosage, and active ingredients.
2. Check whether it is suited for Day (☀️), Night (🌙), or both, and typical precautions (take with food, avoid alcohol, etc.).
3. Check for any inactive ingredients matching user allergies.
4. Highlight major safety warnings (Disclaimer: Informational only).`;
    } else if (mode === "plant_wildlife") {
      prompt = `Analyze this plant, flower, mushroom, insect, or animal:
1. Identify the common and scientific name with confidence level.
2. Toxicity & Safety Assessment: Is it poisonous to humans, dogs, or cats? Does it bite/sting or cause contact dermatitis?
3. Care tips (for plants) or safety actions (for wildlife/insects).`;
    } else {
      prompt = `Perform a comprehensive multi-purpose visual analysis of this image:
${allergiesContext}
1. Identify what is shown (Money/bills, food/groceries, plant/wildlife, medication, dirty surface, or general item).
2. If currency/money: calculate the exact total value and itemize denominations.
3. If food/medication: state ingredients and explicitly check against user allergies (${allergies.join(", ") || "none specified"}).
4. If plant/insect: state toxicity/safety status.
5. If cleaning needed: provide quick cleaning recommendation.
6. Provide a concise, clear summary with safety highlights.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: {
        parts: [
          {
            inlineData: {
              data: imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, ""),
              mimeType,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Short descriptive title of what was identified" },
            category: { type: Type.STRING, description: "One of: currency, food_nutrition, medication, plant_wildlife, cleaning, general" },
            summary: { type: Type.STRING, description: "2-3 sentence overview of the finding" },
            safetyStatus: { type: Type.STRING, description: "SAFE, CAUTION, DANGER, or INFORMATIONAL" },
            safetyAssessment: { type: Type.STRING, description: "Detailed safety, toxicity, or allergy evaluation" },
            allergenMatches: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of user allergies detected in the item, if any",
            },
            totalMoneyAmount: { type: Type.STRING, description: "If currency, total calculated amount with currency symbol, else empty" },
            keyDetails: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Itemized points, denominations, ingredients, or dosage points",
            },
            actionSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Step-by-step instructions or recommended actions (e.g. cleaning steps, care tips)",
            },
            spokenSummary: { type: Type.STRING, description: "A friendly, concise 1-2 sentence phrase suitable for text-to-speech reading" },
          },
          required: ["title", "category", "summary", "safetyStatus", "spokenSummary"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Error in /api/scan-vision:", error);
    return res.status(500).json({ error: error?.message || "Failed to analyze image" });
  }
});

// Recipe Generation with Allergy Cross-Checking Endpoint
app.post("/api/generate-recipe", async (req, res) => {
  try {
    const { query, allergies = [], mealType = "Any", prepTimeLimit = "" } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Missing query for recipe" });
    }

    const ai = getGeminiClient();

    const allergiesPrompt = allergies.length > 0
      ? `STRICT ALLERGY CONSTRAINTS: The user CANNOT eat: ${allergies.join(", ")}. You MUST NOT include any of these ingredients or their common derivatives. Suggest safe substitutions if needed.`
      : "No specific allergy restrictions.";

    const prompt = `Create a delicious, easy-to-follow recipe for "${query}".
Meal type preference: ${mealType}.
Time limit preference: ${prepTimeLimit || "reasonable"}.
${allergiesPrompt}

Provide exact ingredient measurements, prep time, cook time, calories estimate, clear step-by-step instructions, and safety/temperature guidance.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Name of the dish" },
            description: { type: Type.STRING, description: "Brief appetizing description" },
            servings: { type: Type.STRING, description: "Number of servings, e.g. 2-4 servings" },
            prepTimeMinutes: { type: Type.INTEGER, description: "Preparation time in minutes" },
            cookTimeMinutes: { type: Type.INTEGER, description: "Cooking time in minutes" },
            totalTimeMinutes: { type: Type.INTEGER, description: "Total time in minutes" },
            caloriesPerServing: { type: Type.INTEGER, description: "Estimated calories per serving" },
            difficulty: { type: Type.STRING, description: "Easy, Medium, or Advanced" },
            allergySafetyNote: { type: Type.STRING, description: "Statement confirming allergy compliance and safe substitutions" },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  item: { type: Type.STRING },
                  amount: { type: Type.STRING },
                  notes: { type: Type.STRING },
                },
                required: ["item", "amount"],
              },
            },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepNumber: { type: Type.INTEGER },
                  instruction: { type: Type.STRING },
                  timerMinutes: { type: Type.NUMBER, description: "If this step requires waiting or boiling, suggested timer duration in minutes, else 0" },
                  tips: { type: Type.STRING },
                },
                required: ["stepNumber", "instruction"],
              },
            },
            chefTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            spokenOverview: { type: Type.STRING, description: "Short summary for text-to-speech" },
          },
          required: ["title", "description", "prepTimeMinutes", "cookTimeMinutes", "ingredients", "steps", "spokenOverview"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Error in /api/generate-recipe:", error);
    return res.status(500).json({ error: error?.message || "Failed to generate recipe" });
  }
});

// Cleaning Guidance Endpoint
app.post("/api/cleaning-guide", async (req, res) => {
  try {
    const { query, surface = "", stain = "" } = req.body;

    if (!query && !stain) {
      return res.status(400).json({ error: "Missing cleaning inquiry" });
    }

    const ai = getGeminiClient();

    const prompt = `Provide practical, safe, and effective cleaning instructions for: "${query || `Cleaning ${stain} from ${surface}`}".
Surface: ${surface || "General household surface"}.
Stain/Dirt: ${stain || "General stain"}.

Include:
1. Safe household solutions (dish soap, white vinegar, baking soda, isopropyl alcohol, enzymatic cleaner, hydrogen peroxide, etc.).
2. Dangerous combinations to NEVER mix (e.g. Bleach + Ammonia, Bleach + Vinegar).
3. Step-by-step removal procedure.
4. Material caution (e.g. avoid acidic cleaners on natural stone/wood).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Title of cleaning procedure" },
            targetSurface: { type: Type.STRING, description: "Identified or assumed surface" },
            recommendedProducts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Safe household items and cleaners to use",
            },
            warningNeverDo: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Dangerous mixtures or actions that will damage the surface or create toxic fumes",
            },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepNumber: { type: Type.INTEGER },
                  instruction: { type: Type.STRING },
                  dwellTimeMinutes: { type: Type.INTEGER, description: "Minutes to let soak/sit, or 0 if immediate" },
                },
                required: ["stepNumber", "instruction"],
              },
            },
            proTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            spokenSummary: { type: Type.STRING, description: "Concise summary for speech output" },
          },
          required: ["title", "recommendedProducts", "warningNeverDo", "steps", "spokenSummary"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Error in /api/cleaning-guide:", error);
    return res.status(500).json({ error: error?.message || "Failed to generate cleaning advice" });
  }
});

// Smart Voice Command Parser Endpoint
app.post("/api/voice-command", async (req, res) => {
  try {
    const { speechText, allergies = [] } = req.body;

    if (!speechText) {
      return res.status(400).json({ error: "Missing speechText" });
    }

    const ai = getGeminiClient();

    const prompt = `You are the Complete Daily Assistant parsing a spoken user command: "${speechText}".
Current User Allergies: ${allergies.join(", ") || "None specified"}.

Determine user intent and extract appropriate payload:
Available intents:
1. "add_task" -> User wants to add grocery item or todo task (e.g. "Buy oat milk", "Pick up dry cleaning", "add eggs to my grocery list")
   - payload: { title: string, category: "Groceries"|"Daily"|"Work"|"Home" }
2. "add_reminder" -> User wants to set a reminder or calendar item (e.g. "Remind me to call dentist tomorrow at 2pm", "Reminder for team sync on Friday")
   - payload: { title: string, date: string (YYYY-MM-DD or empty if relative), time: string (HH:MM) }
3. "add_medication" -> User wants to log/track a pill or medicine (e.g. "Add Metformin 500mg morning and night", "I need to take 10mg Zyrtec every night")
   - payload: { name: string, dosage: string, timeOfDay: "Day"|"Night"|"Both", reminderTime: string }
4. "add_allergy" -> User wants to register an allergy (e.g. "I am allergic to shrimp and shellfish", "Add dairy to my allergies")
   - payload: { allergyName: string, severity: "Mild"|"Moderate"|"Severe" }
5. "recipe_query" -> User wants a cooking idea or recipe (e.g. "How to cook salmon with garlic", "Give me a quick 15 minute dinner")
   - payload: { query: string }
6. "clean_query" -> User wants cleaning advice (e.g. "How do I get red wine out of a white shirt", "Clean burnt pan")
   - payload: { query: string }
7. "general_assistant" -> Any general daily question, calculation, or conversational query.
   - payload: { answer: string }

Return structured JSON with intent, payload, and a warm, spokenResponse suitable for TTS.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: {
              type: Type.STRING,
              description: "One of: add_task, add_reminder, add_medication, add_allergy, recipe_query, clean_query, general_assistant",
            },
            spokenResponse: {
              type: Type.STRING,
              description: "Concise friendly conversational phrase confirming the action or answering the query",
            },
            payload: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                category: { type: Type.STRING },
                date: { type: Type.STRING },
                time: { type: Type.STRING },
                name: { type: Type.STRING },
                dosage: { type: Type.STRING },
                timeOfDay: { type: Type.STRING },
                reminderTime: { type: Type.STRING },
                allergyName: { type: Type.STRING },
                severity: { type: Type.STRING },
                query: { type: Type.STRING },
                answer: { type: Type.STRING },
              },
            },
          },
          required: ["intent", "spokenResponse", "payload"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Error in /api/voice-command:", error);
    return res.status(500).json({ error: error?.message || "Failed to process voice command" });
  }
});

// Vite middleware for development & static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Complete Daily Assistant server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
