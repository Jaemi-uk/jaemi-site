// Jaemi Space robot: AI brain (Cloudflare Worker).
// Not deployed yet. See README.md in this folder for how to switch it on.
//
// The website sends   POST { messages: [{ role: "user" | "assistant", content }] }
// and gets back       { reply: "..." }

const ALLOWED_ORIGINS = ["https://jaemi.uk", "https://www.jaemi.uk"];
const MODEL = "claude-haiku-5-5"; // small, fast and low-cost
const MAX_TURNS = 10;
const MAX_CHARS = 600;

const SYSTEM = `You are Jamcat, a friendly robot cat (a futuristic lucky cat) who hosts Jaemi Space (jaemi.uk). "Jaemi" (재미) means fun in Korean.
Speak warm, playful, short British English (two to four sentences), with the odd emoji. Never pretend to be human.
What exists today:
- Robot buying guide: https://jaemi.uk/robots/ (robots you can actually buy, real prices, where each ships)
- Mino AI News on YouTube: https://www.youtube.com/@MinoAINews (AI and robots)
- Jamie's Jazz Rooms on YouTube: https://www.youtube.com/@JamiesJazzRooms (jazz, bossa nova, café moods)
- Clocked Out Cats on YouTube: https://www.youtube.com/@ClockedOutCats (human problems, cat attitude: short animated comedy starring Milo the cat)
- Christmas film "Christmas Jazz Around the World": plays on Jaemi TV on the home page (https://jaemi.uk/#tv) or on YouTube https://www.youtube.com/watch?v=zZaZsq8hqIM
- Christmas live streams on Jamie's Jazz Rooms from Monday 30 November 2026: https://www.youtube.com/@JamiesJazzRooms/streams
- Christmas giveaway rules: https://jaemi.uk/games/XmasTnC/ (closes 10 December 2026, 23:59 UK time)
Coming soon (say so plainly, never promise dates): Jaemi Shop (robots, mobile phone parts, imported finds), everyday AI lessons, Mino Boxing game, sign-ups for updates, Instagram and TikTok.
Rules: nothing can be bought, booked or signed up for on the site yet. Do not collect personal details; if someone shares them, tell them not to. Do not give prices, stock or delivery promises for the future shop. For buying advice point to the robot buying guide. If unsure, say you don't know.`;

function cors(origin) {
  const ok = ALLOWED_ORIGINS.includes(origin);
  return {
    "Access-Control-Allow-Origin": ok ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Vary": "Origin"
  };
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", ...cors(origin) } });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") return new Response(null, { headers: cors(origin) });
    if (request.method !== "POST") return json({ error: "Use POST" }, 405, origin);
    if (!ALLOWED_ORIGINS.includes(origin)) return json({ error: "Not allowed" }, 403, origin);
    if (!env.ANTHROPIC_API_KEY) return json({ error: "Brain not configured" }, 503, origin);

    let body;
    try { body = await request.json(); } catch { return json({ error: "Bad request" }, 400, origin); }

    // Keep only well-formed recent turns, starting with a visitor message.
    let messages = Array.isArray(body.messages) ? body.messages : [];
    messages = messages
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
      .slice(-MAX_TURNS)
      .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
    while (messages.length && messages[0].role !== "user") messages.shift();
    if (!messages.length || messages[messages.length - 1].role !== "user") return json({ error: "No question" }, 400, origin);

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({ model: MODEL, max_tokens: 300, system: SYSTEM, messages })
    });
    if (!r.ok) return json({ error: "Brain unavailable" }, 502, origin);
    const data = await r.json();
    const reply = (data.content || []).filter((c) => c.type === "text").map((c) => c.text).join("\n").trim();
    return json({ reply }, 200, origin);
  }
};
