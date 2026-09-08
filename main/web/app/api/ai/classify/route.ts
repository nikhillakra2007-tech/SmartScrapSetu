import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageBase64, weightKg = 1, locale = 'en' } = body;

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured on the server.' },
        { status: 500 }
      );
    }

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'imageBase64 is required.' },
        { status: 400 }
      );
    }

    const pureBase64 = imageBase64.includes(',')
      ? imageBase64.split(',')[1]
      : imageBase64;
    const mimeType = imageBase64.includes(';')
      ? imageBase64.split(';')[0].split(':')[1] || 'image/jpeg'
      : 'image/jpeg';

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey.trim()}`;

    const prompt = `You are SmartScrapSetu Delhi Scrap & E-Waste Classification Engine.
Analyze this scrap photograph. Classify this scrap into CPCB / Indian circular economy taxonomy.
Write human-readable descriptions in ${locale === 'hi' ? 'Hindi' : 'English'}, retaining taxonomy codes in English.
Return ONLY valid JSON matching this schema:
{
  "parent_code": "E_WASTE" | "PLASTIC" | "GLASS" | "PAPER" | "METAL_FERROUS" | "METAL_NONFERROUS" | "TEXTILE" | "RUBBER_OTHER",
  "parent_name": string,
  "sub_code": string,
  "sub_name": string,
  "condition": "working" | "damaged" | "scrap" | "burnt_unsafe",
  "category_confidence": number,
  "hazard_flags": string[],
  "is_hazardous": boolean,
  "hazard_advisory": string,
  "suggested_rate_per_kg": number,
  "epr_schedule1_hint": string,
  "identified_components": string[],
  "ai_notes": string
}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: pureBase64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          response_mime_type: 'application/json',
          temperature: 0.2,
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return NextResponse.json(
        { error: `Gemini API error: ${geminiRes.statusText}`, details: errText },
        { status: geminiRes.status }
      );
    }

    const geminiData = await geminiRes.json();
    const rawJson = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawJson) {
      return NextResponse.json(
        { error: 'No response candidate received from Gemini.' },
        { status: 502 }
      );
    }

    const parsed = JSON.parse(rawJson);
    const weight = Number(weightKg) || 1;
    const rate = Number(parsed.suggested_rate_per_kg) || 280;

    return NextResponse.json({
      success: true,
      ...parsed,
      weight_kg: weight,
      estimated_value: Math.round(rate * weight),
      ai_model_used: 'Gemini 2.5 Flash (Google Cloud API)',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
