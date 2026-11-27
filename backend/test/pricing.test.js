const test = require("node:test");
const assert = require("node:assert/strict");
const { calculatePricing, buildSavedPricing } = require("../services/pricing");

test("exact material quantities charge only the portion used", () => {
  const result = calculatePricing({
    materialsConfirmed: true,
    materials: [
      {
        name: "Cotton yarn",
        method: "exact",
        purchaseCostNpr: 500,
        totalQuantity: 500,
        quantityUsed: 150,
        unit: "grams",
      },
    ],
    expensesConfirmed: true,
    expenses: [{ name: "Packaging", amountNpr: 20 }],
    minutesSpent: 90,
    hourlyRateNpr: 100,
    profitMarginPercent: 25,
  });

  assert.equal(result.materialsCostNpr, 150);
  assert.equal(result.additionalExpensesCostNpr, 20);
  assert.equal(result.labourCostNpr, 150);
  assert.equal(result.totalCostNpr, 320);
  assert.equal(result.suggestedPriceNpr, 400);
});

test("an estimated material cost is kept separate from purchase cost", () => {
  const result = calculatePricing({
    materialsConfirmed: true,
    materials: [{ name: "Fabric", method: "estimated", estimatedCostNpr: 45 }],
    expensesConfirmed: true,
    expenses: [],
    minutesSpent: null,
    hourlyRateNpr: 100,
    profitMarginPercent: 0,
  });

  assert.equal(result.materials[0].costNpr, 45);
  assert.equal(result.complete, false);
  assert.equal(result.labourCostNpr, 0);
});

test("a known cost for the amount used is counted directly", () => {
  const result = calculatePricing({
    materialsConfirmed: true,
    materials: [{
      name: "Buttons",
      method: "used",
      usedCostNpr: 30,
    }],
    expensesConfirmed: true,
    expenses: [],
    minutesSpent: null,
    profitMarginPercent: 0,
  });

  assert.equal(result.materials[0].costNpr, 30);
  assert.equal(result.materials[0].usedCostNpr, 30);
  assert.equal(result.materialsCostNpr, 30);
});

test("an AI-estimated material stays labeled and uses deterministic arithmetic", () => {
  const result = calculatePricing({
    materialsConfirmed: true,
    materials: [{
      name: "Cotton yarn",
      method: "estimated",
      estimatedCostNpr: 120,
      costSource: "ai",
      usedQuantityDescription: "one small bundle",
    }],
    expensesConfirmed: true,
    expenses: [],
    minutesSpent: 60,
    hourlyRateNpr: 50,
    profitMarginPercent: 20,
  });

  assert.equal(result.materials[0].costSource, "ai");
  assert.equal(result.materials[0].usedQuantityDescription, "one small bundle");
  assert.equal(result.totalCostNpr, 170);
  assert.equal(result.suggestedPriceNpr, 204);
});

test("optional missing, null, and blank expenses do not block calculation", () => {
  const result = calculatePricing({
    materialsConfirmed: true,
    materials: [],
    expensesConfirmed: true,
    expenses: [null, undefined, { name: "Packaging", amountNpr: "" }, {
      name: "Electricity",
      amountNpr: "12",
    }],
    minutesSpent: null,
    profitMarginPercent: 0,
  });

  assert.deepEqual(result.expenses, [{ name: "Electricity", amountNpr: 12 }]);
  assert.equal(result.additionalExpensesCostNpr, 12);
});

test("an absent optional-expenses array is treated as no additional cost", () => {
  const result = calculatePricing({
    materialsConfirmed: true,
    materials: [],
    expensesConfirmed: true,
    minutesSpent: null,
    profitMarginPercent: 0,
  });

  assert.deepEqual(result.expenses, []);
  assert.equal(result.additionalExpensesCostNpr, 0);
});

test("rejects quantities used that exceed the amount purchased", () => {
  assert.throws(
    () => calculatePricing({
      materials: [{
        name: "Yarn",
        method: "exact",
        purchaseCostNpr: 100,
        totalQuantity: 10,
        quantityUsed: 11,
      }],
      materialsConfirmed: true,
      expenses: [],
      expensesConfirmed: true,
    }),
    /cannot exceed/,
  );
});

test("accepted price must match the server-calculated suggestion", () => {
  const input = {
    materialsConfirmed: true,
    materials: [],
    expensesConfirmed: true,
    expenses: [],
    minutesSpent: 60,
    hourlyRateNpr: 100,
    profitMarginPercent: 0,
    finalDecision: "accepted",
  };
  assert.throws(() => buildSavedPricing(input, 99), /must match/);
  assert.equal(buildSavedPricing(input, 100).finalDecision, "accepted");
});

test("uses the higher configurable starter labor rate and profit add-on when omitted", () => {
  const previousHourlyRate = process.env.PRICING_HOURLY_RATE_NPR;
  const previousProfitMargin = process.env.PRICING_PROFIT_MARGIN_PERCENT;
  delete process.env.PRICING_HOURLY_RATE_NPR;
  delete process.env.PRICING_PROFIT_MARGIN_PERCENT;

  try {
    const result = calculatePricing({
      materialsConfirmed: true,
      materials: [{ name: "Fabric", method: "all", purchaseCostNpr: 100 }],
      expensesConfirmed: true,
      expenses: [],
      minutesSpent: 60,
    });

    assert.equal(result.hourlyRateNpr, 150);
    assert.equal(result.profitMarginPercent, 35);
    assert.equal(result.totalCostNpr, 250);
    assert.equal(result.suggestedPriceNpr, 338);
  } finally {
    if (previousHourlyRate === undefined) delete process.env.PRICING_HOURLY_RATE_NPR;
    else process.env.PRICING_HOURLY_RATE_NPR = previousHourlyRate;
    if (previousProfitMargin === undefined) delete process.env.PRICING_PROFIT_MARGIN_PERCENT;
    else process.env.PRICING_PROFIT_MARGIN_PERCENT = previousProfitMargin;
  }
});

test("rejects negative expense amounts", () => {
  assert.throws(
    () => calculatePricing({
      materialsConfirmed: true,
      materials: [],
      expensesConfirmed: true,
      expenses: [{ name: "Box", amountNpr: -1 }],
    }),
    /valid amount/,
  );
});

test("requires explicit confirmation of materials and other costs", () => {
  assert.throws(
    () => calculatePricing({ materials: [], expenses: [] }),
    /Confirm the materials/,
  );
  assert.throws(
    () => calculatePricing({
      materialsConfirmed: true,
      materials: [],
      expenses: [],
    }),
    /Confirm whether you had any other costs/,
  );
});

test("rejects missing or non-numeric material costs instead of treating them as zero", () => {
  for (const purchaseCostNpr of [null, "", [], true]) {
    assert.throws(
      () => calculatePricing({
        materialsConfirmed: true,
        materials: [{ name: "Buttons", method: "all", purchaseCostNpr }],
        expensesConfirmed: true,
        expenses: [],
      }),
      /required|number/,
    );
  }
});
