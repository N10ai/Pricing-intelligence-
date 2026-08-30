/* Pricing Intelligence — semantic freight extraction adapter.
   Browser-safe: uses an optional backend endpoint; never embeds provider API keys.
   Expected backend response: { shipment: <FreightSemanticResult> }
*/

window.FreightAI = (() => {
  const FIELD_NAMES = [
    'intent','mode','origin','originType','pickup','destination','destinationType','delivery',
    'service','incoterm','pieces','packageType','grossWeightKg','dimensions','commodity','readyDate',
    'dangerousGoods','temperatureControlled','stackable','serviceLevel','customerReference','notes'
  ];

  const EXTRACTION_CONTRACT = {
    version: '1.0',
    instructions: [
      'Act as a senior international freight forwarding pricing agent.',
      'Extract only facts supported by the message or conservative logistics inferences.',
      'Never invent shipment facts, rates, dimensions, weights, DG status, Incoterms, dates, airports or ports.',
      'For each field return value, confidence 0..1, source explicit|normalized|inferred|unknown, evidence, and reason.',
      'Preserve uncertainty. Unknown is better than a plausible guess.',
      'Differentiate pickup/delivery locations from gateway airports/ports.',
      'Normalize common freight abbreviations: plt/skid=pallet, ctn=carton, pcs=pieces; convert lb to kg when explicit.',
      'Detect intent such as rfq, rate_confirmation, booking_request, counteroffer, acceptance, status_request, vendor_quote.',
      'Return warnings for contradictions, suspicious cargo data, possible DG, oversize, temperature control, or ambiguous routing.',
      'Return clarification candidates ordered by operational importance.'
    ],
    fieldShape: { value: null, confidence: 0, source: 'unknown', evidence: '', reason: '' },
    output: {
      intent: {}, fields: {}, warnings: [], clarifications: [], semanticSummary: ''
    }
  };

  function endpoint() {
    return localStorage.getItem('pi_ai_endpoint') || '';
  }

  function setEndpoint(url) {
    if (url) localStorage.setItem('pi_ai_endpoint', url.replace(/\/$/, ''));
    else localStorage.removeItem('pi_ai_endpoint');
  }

  function normalizeField(field) {
    if (!field || typeof field !== 'object' || Array.isArray(field)) {
      return { value: field ?? null, confidence: field == null ? 0 : .7, source: field == null ? 'unknown' : 'explicit', evidence: '', reason: '' };
    }
    return {
      value: field.value ?? null,
      confidence: Math.max(0, Math.min(1, Number(field.confidence) || 0)),
      source: ['explicit','normalized','inferred','unknown','user'].includes(field.source) ? field.source : 'unknown',
      evidence: String(field.evidence || ''),
      reason: String(field.reason || '')
    };
  }

  function validateSemanticResult(result) {
    const r = result && result.shipment ? result.shipment : result;
    if (!r || typeof r !== 'object') throw new Error('Invalid semantic extraction response');
    const fields = {};
    FIELD_NAMES.forEach(name => fields[name] = normalizeField((r.fields || {})[name]));
    return {
      intent: normalizeField(r.intent || fields.intent),
      fields,
      warnings: Array.isArray(r.warnings) ? r.warnings.slice(0, 20) : [],
      clarifications: Array.isArray(r.clarifications) ? r.clarifications.slice(0, 20) : [],
      semanticSummary: String(r.semanticSummary || '')
    };
  }

  async function extract(rawText, context = {}) {
    const url = endpoint();
    if (!url) return { available: false, reason: 'no_endpoint' };
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(url + '/api/extract-rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText, context, contract: EXTRACTION_CONTRACT }),
        signal: controller.signal
      });
      if (!response.ok) throw new Error('Semantic extractor returned ' + response.status);
      return { available: true, result: validateSemanticResult(await response.json()) };
    } catch (error) {
      return { available: false, reason: error.name === 'AbortError' ? 'timeout' : 'request_failed', error: String(error.message || error) };
    } finally {
      clearTimeout(timer);
    }
  }

  return { EXTRACTION_CONTRACT, extract, endpoint, setEndpoint, validateSemanticResult };
})();