const BASE = "";

export type Scenario = {
  id: string;
  name: string;
  description?: string;
};

export type DecodeRequest = {
  scenarioId: string;
  text: string;
};

export type DecodeResponse = {
  literal: string;
  subtext: string;
  urgency: string;
  tone: string;
  why: string;
};

export async function getScenarios(): Promise<Scenario[]> {
  const res = await fetch(`${BASE}/api/scenarios`);
  if (!res.ok) throw new Error(`GET /api/scenarios failed: ${res.status}`);
  return res.json() as Promise<Scenario[]>;
}

export async function postDecode(req: DecodeRequest): Promise<DecodeResponse> {
  const res = await fetch(`${BASE}/api/decode`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`POST /api/decode failed: ${res.status}`);
  return res.json() as Promise<DecodeResponse>;
}
