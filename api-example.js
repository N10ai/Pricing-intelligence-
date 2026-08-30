/*
SERVER-SIDE EXAMPLE / CONTRACT — do not load this file in the browser.

Pricing Intelligence must call an LLM from a server/edge function so provider API keys are never exposed in GitHub Pages.
Implement POST /api/extract-rfq on your preferred backend (Supabase Edge Function, Cloudflare Worker, Render, etc.).

Request body:
{
  rawText: "customer email...",
  context: { customer?, priorLane?, companyRules? },
  contract: <FreightAI.EXTRACTION_CONTRACT>
}

System instruction concept:
"You are a senior international freight-forwarding pricing agent. Read the entire message and return ONLY JSON matching the supplied contract. Never invent freight facts. Separate explicit facts from normalized values and inferences. Every field needs confidence, evidence, source and reason. Identify contradictions and operational risks. Ask only clarifications that materially block pricing or safe execution."

Required response example:
{
  "shipment": {
    "intent": {"value":"rfq","confidence":0.99,"source":"explicit","evidence":"send best air rate","reason":"Customer requests pricing"},
    "fields": {
      "mode":{"value":"Air","confidence":0.99,"source":"explicit","evidence":"air","reason":"Mode explicitly stated"},
      "origin":{"value":"MIA","confidence":0.98,"source":"explicit","evidence":"MIA / LIM","reason":"IATA origin stated"},
      "pickup":{"value":"Doral, FL","confidence":0.98,"source":"explicit","evidence":"pickup Doral FL","reason":"Pickup location stated"},
      "destination":{"value":"LIM","confidence":0.98,"source":"explicit","evidence":"MIA / LIM","reason":"IATA destination stated"},
      "service":{"value":"Door-Airport","confidence":0.93,"source":"inferred","evidence":"pickup Doral FL; delivery LIM airport","reason":"Pickup requested and airport delivery specified"},
      "pieces":{"value":3,"confidence":0.99,"source":"explicit","evidence":"3 plt","reason":"Piece count stated"},
      "packageType":{"value":"pallet","confidence":0.99,"source":"normalized","evidence":"plt","reason":"Freight abbreviation normalized"},
      "grossWeightKg":{"value":1850,"confidence":0.99,"source":"explicit","evidence":"1850 kgs total","reason":"Gross weight stated"},
      "dimensions":{"value":null,"confidence":0,"source":"unknown","evidence":"","reason":"Not provided"},
      "commodity":{"value":"lighting fixtures","confidence":0.98,"source":"explicit","evidence":"lighting fixtures","reason":"Commodity stated"},
      "readyDate":{"value":"tomorrow","confidence":0.95,"source":"explicit","evidence":"ready tomorrow","reason":"Relative ready date stated"},
      "dangerousGoods":{"value":null,"confidence":0,"source":"unknown","evidence":"","reason":"No DG declaration; do not assume non-DG"}
    },
    "warnings": [],
    "clarifications": [{"field":"dimensions","priority":"blocking","question":"What are the dimensions of each pallet?","reason":"Required to calculate air chargeable weight."}],
    "semanticSummary":"Air RFQ from Doral via MIA to LIM airport for 3 pallets of lighting fixtures, 1,850 kg, ready tomorrow. Dimensions are missing."
  }
}

IMPORTANT production behavior:
1. Validate the LLM JSON against a strict server-side schema.
2. Reject unknown keys / malformed numeric values.
3. Do not allow the model to calculate final freight rates or margins.
4. Run deterministic unit conversion, volumetric weight, chargeable weight, routing and commercial calculations after extraction.
5. Persist the raw message and extraction provenance for auditability.
*/