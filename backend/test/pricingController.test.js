const test = require("node:test");
const assert = require("node:assert/strict");
const pricingController = require("../controllers/pricingController");

const invokeDetection = async ({ apiKey, fetchImpl }) => {
  const previousKey = process.env.GEMINI_API_KEY;
  const previousModel = process.env.GEMINI_VISION_MODEL;
  const previousFetch = global.fetch;
  const result = { status: 200, body: null };
  const response = {
    status(status) {
      result.status = status;
      return this;
    },
    json(body) {
      result.body = body;
      return this;
    },
  };

  if (apiKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = apiKey;
  process.env.GEMINI_VISION_MODEL = "test-vision-model";
  if (fetchImpl) global.fetch = fetchImpl;

  try {
    await pricingController.detectMaterials({
      file: {
        mimetype: "image/jpeg",
        buffer: Buffer.from("sample product photo"),
      },
    }, response);
    return result;
  } finally {
    if (previousKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousKey;
    if (previousModel === undefined) delete process.env.GEMINI_VISION_MODEL;
    else process.env.GEMINI_VISION_MODEL = previousModel;
    global.fetch = previousFetch;
  }
};

const invokeMaterialEstimate = async ({ apiKey, fetchImpl, body }) => {
  const previousKey = process.env.GEMINI_API_KEY;
  const previousModel = process.env.GEMINI_VISION_MODEL;
  const previousFetch = global.fetch;
  const result = { status: 200, body: null };
  const response = {
    status(status) {
      result.status = status;
      return this;
    },
    json(responseBody) {
      result.body = responseBody;
      return this;
    },
  };

  if (apiKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = apiKey;
  process.env.GEMINI_VISION_MODEL = "test-vision-model";
  if (fetchImpl) global.fetch = fetchImpl;

  try {
    await pricingController.estimateMaterialCost({ body }, response);
    return result;
  } finally {
    if (previousKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousKey;
    if (previousModel === undefined) delete process.env.GEMINI_VISION_MODEL;
    else process.env.GEMINI_VISION_MODEL = previousModel;
    global.fetch = previousFetch;
  }
};

const successfulEstimateResponse = (estimate) => ({
  ok: true,
  json: async () => ({
    status: "completed",
    steps: [{
      type: "model_output",
      content: [{ type: "text", text: JSON.stringify(estimate) }],
    }],
  }),
});

test("material detection sends the uploaded image to the Gemini Interactions API", async () => {
  let requestUrl;
  let requestOptions;
  const result = await invokeDetection({
    apiKey: "test-api-key",
    fetchImpl: async (url, options) => {
      requestUrl = url;
      requestOptions = options;
      return {
        ok: true,
        json: async () => ({
          status: "completed",
          steps: [{
            type: "model_output",
            content: [{
              type: "text",
              text: JSON.stringify({
                materials: [{
                  name: "Cotton yarn",
                  confidence: "high",
                  reason: "Crochet stitches are visible",
                }],
              }),
            }],
          }],
        }),
      };
    },
  });

  assert.equal(requestUrl, "https://generativelanguage.googleapis.com/v1beta/interactions");
  assert.equal(requestOptions.headers["x-goog-api-key"], "test-api-key");
  const request = JSON.parse(requestOptions.body);
  assert.equal(request.model, "test-vision-model");
  assert.equal(request.store, false);
  assert.equal(request.input[1].data, Buffer.from("sample product photo").toString("base64"));
  assert.equal(request.input[1].mime_type, "image/jpeg");
  assert.equal(request.response_format.mime_type, "application/json");
  assert.deepEqual(result, {
    status: 200,
    body: {
      success: true,
      materials: [{
        name: "Cotton yarn",
        confidence: "high",
        reason: "Crochet stitches are visible",
      }],
    },
  });
});

test("material detection returns a clear fallback when no Gemini key is configured", async () => {
  const result = await invokeDetection({ apiKey: undefined });
  assert.equal(result.status, 503);
  assert.match(result.body.message, /set your own price/i);
});

test("material detection explains temporary Gemini capacity errors", async () => {
  const result = await invokeDetection({
    apiKey: "test-api-key",
    fetchImpl: async () => ({ ok: false, status: 503 }),
  });
  assert.equal(result.status, 502);
  assert.match(result.body.message, /busy right now/i);
});

test("material price estimates are approximate and validated before returning", async () => {
  let requestOptions;
  const result = await invokeMaterialEstimate({
    apiKey: "test-api-key",
    body: {
      materialName: "Cotton yarn",
      usageMethod: "estimated",
      usedQuantityDescription: "one small bundle",
    },
    fetchImpl: async (_url, options) => {
      requestOptions = options;
      return successfulEstimateResponse({
        estimate_available: true,
        low_npr: 80,
        high_npr: 180,
        suggested_npr: 120,
        explanation: "Approximate cost for a small amount.",
      });
    },
  });

  const request = JSON.parse(requestOptions.body);
  assert.equal(request.model, "test-vision-model");
  assert.equal(request.store, false);
  assert.match(request.input[0].text, /one small bundle/);
  assert.equal(result.status, 200);
  assert.deepEqual(result.body.estimate, {
    lowNpr: 80,
    highNpr: 180,
    suggestedNpr: 120,
    explanation: "Approximate cost for a small amount.",
    source: "ai",
    approximate: true,
    note: "AI approximation only; no verified current Nepal price reference is connected.",
  });
});

test("material price estimation validates user input and offers manual fallback without AI", async () => {
  const missingKey = await invokeMaterialEstimate({
    apiKey: undefined,
    body: { materialName: "Yarn", usageMethod: "estimated" },
  });
  assert.equal(missingKey.status, 503);
  assert.match(missingKey.body.message, /enter your own estimate/i);

  const invalidInput = await invokeMaterialEstimate({
    apiKey: "test-api-key",
    body: { materialName: "Yarn", usageMethod: "unknown" },
  });
  assert.equal(invalidInput.status, 400);
});

test("material price estimation rejects invalid quantity details before calling AI", async () => {
  let calledProvider = false;
  const result = await invokeMaterialEstimate({
    apiKey: "test-api-key",
    body: {
      materialName: "Yarn",
      usageMethod: "estimated",
      quantityUsed: -2,
    },
    fetchImpl: async () => {
      calledProvider = true;
      return successfulEstimateResponse({});
    },
  });

  assert.equal(result.status, 400);
  assert.equal(calledProvider, false);
});

test("material price estimation rejects invalid model ranges", async () => {
  const result = await invokeMaterialEstimate({
    apiKey: "test-api-key",
    body: { materialName: "Yarn", usageMethod: "estimated" },
    fetchImpl: async () => successfulEstimateResponse({
      estimate_available: true,
      low_npr: 120,
      high_npr: 180,
      suggested_npr: 200,
      explanation: "Not a valid range.",
    }),
  });

  assert.equal(result.status, 502);
  assert.match(result.body.message, /enter your own amount/i);
});
