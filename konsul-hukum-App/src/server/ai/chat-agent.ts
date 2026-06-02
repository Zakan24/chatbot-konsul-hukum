"use server";

import { GoogleGenAI } from "@google/genai";
import { env } from "nvn/env";

// ---------------------------------------------------------------------------
// Vertex AI client — lazy-initialized to avoid build-time auth errors.
// Authenticates via GOOGLE_APPLICATION_CREDENTIALS env var at runtime.
// ---------------------------------------------------------------------------
let _ai: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  _ai ??= new GoogleGenAI({
    vertexai: true,
    project: env.GCP_PROJECT_ID,
    location: env.GCP_LOCATION,
  });
  return _ai;
}

// ---------------------------------------------------------------------------
// Model: Gemini 3.5 Flash — updated per user request
// ---------------------------------------------------------------------------
const MODEL_ID = "gemini-3.5-flash";

function getDataStoreResource(): string {
  return `projects/${env.GCP_PROJECT_ID}/locations/global/collections/default_collection/dataStores/${env.VERTEX_AI_DATASTORE_ID}`;
}

// ---------------------------------------------------------------------------
// System prompt: comprehensive legal-domain instruction
// ---------------------------------------------------------------------------
const SYSTEM_PROMPT = `Kamu adalah **Konsul Hukum**, asisten AI ahli hukum Indonesia.

## ATURAN UTAMA
1. **HANYA gunakan informasi dari dokumen yang di-retrieve** (grounding). JANGAN mengarang, mengira-ngira, atau menggunakan pengetahuan umum yang tidak ada dalam dokumen.
2. Jika informasi yang dibutuhkan **tidak ditemukan** dalam dokumen yang di-retrieve, jawab dengan jujur: "Maaf, saya tidak menemukan informasi tersebut dalam database peraturan yang tersedia. Silakan konsultasikan dengan ahli hukum profesional."
3. **Selalu sertakan dasar hukum yang spesifik**: sebutkan nomor UU, Pasal, Ayat, dan/atau huruf yang relevan. Contoh: "Berdasarkan Pasal 17 ayat (1) huruf a UU Nomor 7 Tahun 2021 tentang HPP..."
4. Jika sebuah UU telah **diamendemen atau dicabut** oleh UU yang lebih baru, jelaskan UU mana yang berlaku saat ini dan sebutkan UU perubahannya.
5. Jawab dalam **Bahasa Indonesia** yang formal, jelas, dan terstruktur.

## FORMAT JAWABAN
- Mulai dengan **ringkasan jawaban** (1-2 kalimat langsung menjawab pertanyaan).
- Lalu berikan **penjelasan detail** dengan dasar hukum spesifik (UU, Pasal, Ayat).
- Jika relevan, berikan **contoh penerapan** sederhana.
- Akhiri dengan **catatan** jika ada ketentuan peralihan atau pengecualian yang perlu diperhatikan.

## DAFTAR REFERENSI (WAJIB)
Di akhir setiap jawaban, kamu WAJIB menambahkan daftar referensi dalam format berikut.
Cantumkan HANYA undang-undang/peraturan yang benar-benar kamu sebutkan atau kutip dalam jawaban di atas.
Untuk setiap referensi, kamu WAJIB menyertakan "source" (Nama UU/Peraturan) DAN "snippet" (kutipan bunyi pasal, ayat, atau teks hukum spesifik yang paling relevan dari dokumen yang di-retrieve).

Format (HARUS persis seperti ini):

<<<REFERENSI>>>
[
  {
    "source": "UU Nomor X Tahun YYYY",
    "snippet": "Pasal A ayat (B): Bunyi pasal/ayat..."
  },
  {
    "source": "UU Nomor Z Tahun YYYY",
    "snippet": "Pasal C ayat (D): Bunyi pasal/ayat..."
  }
]
<<<END_REFERENSI>>>

Contoh: jika jawaban kamu menyebutkan UU Nomor 7 Tahun 2021 dan UU Nomor 11 Tahun 2020, maka:

<<<REFERENSI>>>
[
  {
    "source": "UU Nomor 7 Tahun 2021",
    "snippet": "Pasal 17 ayat (1): Wajib Pajak orang pribadi..."
  },
  {
    "source": "UU Nomor 11 Tahun 2020",
    "snippet": "Pasal 81 ayat (2): Hubungan kerja terjadi karena..."
  }
]
<<<END_REFERENSI>>>

## CAKUPAN PENGETAHUAN
Database berisi Undang-Undang hukum Indonesia, meliputi:
- Kitab Undang-Undang Hukum Pidana (KUHP)
- Kitab Undang-Undang Hukum Perdata (KUHPerdata)
- Undang-Undang Cipta Kerja (UU 6/2023, UU 11/2020)
- Harmonisasi Peraturan Hukum (HPP/UU 7/2021)
- Peraturan-peraturan terkait lainnya yang tersedia dalam database
- Dan peraturan terkait lainnya

## YANG TIDAK BOLEH DILAKUKAN
- JANGAN memberikan nasihat hukum personal yang spesifik.
- JANGAN menjawab pertanyaan di luar topik hukum Indonesia.
- JANGAN menyebutkan pasal atau ayat yang tidak ada dalam dokumen yang di-retrieve.
- Jika pertanyaan ambigu, minta klarifikasi sebelum menjawab.

Gunakan konteks percakapan sebelumnya untuk menjaga kontinuitas diskusi.`;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type SourceCitation = {
  source: string;
  page?: number;
  snippet?: string;
};

export interface MessageHistory {
  role: "user" | "assistant";
  content: string;
}

// ---------------------------------------------------------------------------
// Main function: Ask a legal question, get a grounded answer
// ---------------------------------------------------------------------------
export async function answerLegalQuestion(
  question: string,
  messageHistory: MessageHistory[] = []
): Promise<{
  answer: string;
  sources: SourceCitation[];
}> {
  const MAX_HISTORY = 10;
  const recentHistory = messageHistory.slice(-MAX_HISTORY);

  // Build the conversation contents for Gemini multi-turn
  const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

  // Add conversation history
  for (const msg of recentHistory) {
    contents.push({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    });
  }

  // Add the current question
  contents.push({
    role: "user",
    parts: [{ text: question }],
  });

  try {
    const response = await getAI().models.generateContent({
      model: MODEL_ID,
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.1,
        // Enable thinking/reasoning for deeper legal analysis
        thinkingConfig: {
          thinkingBudget: 4096,
        },
        // Grounding: use Vertex AI Search data store for RAG
        tools: [
          {
            retrieval: {
              vertexAiSearch: {
                datastore: getDataStoreResource(),
              },
            },
          },
        ],
      },
    });

    const rawText =
      response.text?.trim() ??
      "Maaf, saya belum dapat menemukan jawaban pasti. Silakan ajukan pertanyaan lebih spesifik.";

    // Parse the answer and extract inline references from the AI's response
    const { answer, sources } = parseAnswerAndSources(rawText);

    return { answer, sources };
  } catch (error) {
    console.error("[RAG] Vertex AI completion failed", error);
    return {
      answer:
        "Maaf, sistem sedang mengalami gangguan saat memproses pertanyaan Anda. Silakan coba lagi beberapa saat lagi.",
      sources: [],
    };
  }
}

// ---------------------------------------------------------------------------
// Parse answer text and extract inline <<<REFERENSI>>> JSON block
// ---------------------------------------------------------------------------
function parseAnswerAndSources(rawText: string): {
  answer: string;
  sources: SourceCitation[];
} {
  try {
    // Look for the <<<REFERENSI>>> ... <<<END_REFERENSI>>> block
    const refRegex = /<<<REFERENSI>>>\s*([\s\S]*?)\s*<<<END_REFERENSI>>>/;
    const match = refRegex.exec(rawText);

    if (!match) {
      // No reference block found — return the full text as answer with no sources
      return { answer: rawText.trim(), sources: [] };
    }

    // Extract the clean answer (everything before the reference block)
    const answer = rawText.replace(refRegex, "").trim();

    // Parse the JSON sources
    const jsonStr = match[1]?.trim() ?? "[]";
    let parsedSources: SourceCitation[] = [];

    try {
      const parsed: unknown = JSON.parse(jsonStr);
      if (Array.isArray(parsed)) {
        parsedSources = (parsed as Array<Record<string, unknown>>)
          .filter((item) => item && typeof item.source === "string")
          .map((item) => ({
            source: item.source as string,
            snippet: typeof item.snippet === "string" ? item.snippet : undefined,
          }));
      }
    } catch (jsonError) {
      console.error("[RAG] Failed to parse reference JSON:", jsonError);
    }

    return { answer, sources: parsedSources };
  } catch (error) {
    console.error("[RAG] Failed to parse answer and sources", error);
    return { answer: rawText.trim(), sources: [] };
  }
}
