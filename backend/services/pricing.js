const DEFAULT_HOURLY_RATE_NPR = 150;
const DEFAULT_PROFIT_MARGIN_PERCENT = 35;

const configuredNumber = (name, fallback, min, max) => {
  if (process.env[name] === undefined || process.env[name].trim() === "") return fallback;
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value >= min && value <= max ? value : fallback;
};

const roundMoney = (value) => {
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
  if (!Number.isFinite(rounded)) throw new Error("Cost is too large to calculate");
  return rounded;
};

const readAmount = (value, label, { optional = false, min = 0 } = {}) => {
  const missing =
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "");
  if (missing) {
    if (optional) return null;
    throw new Error(`${label} is required`);
  }
  if (typeof value !== "number" && typeof value !== "string") {
    throw new Error(`${label} must be a number`);
  }
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < min) {
    throw new Error(`${label} must be a valid amount of ${min} or more`);
  }
  return amount;
};

exports.getPricingDefaults = () => ({
  hourlyRateNpr: configuredNumber(
    "PRICING_HOURLY_RATE_NPR",
    DEFAULT_HOURLY_RATE_NPR,
    0,
    100000,
  ),
  profitMarginPercent: configuredNumber(
    "PRICING_PROFIT_MARGIN_PERCENT",
    DEFAULT_PROFIT_MARGIN_PERCENT,
    0,
    200,
  ),
});

exports.calculatePricing = (input) => {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Pricing details are required");
  }

  const defaults = exports.getPricingDefaults();
  const sourceMaterials = input.materials;
  const sourceExpenses = input.expenses == null ? [] : input.expenses;
  if (input.materialsConfirmed !== true) {
    throw new Error("Confirm the materials used before calculating a price");
  }
  if (input.expensesConfirmed !== true) {
    throw new Error("Confirm whether you had any other costs");
  }
  if (!Array.isArray(sourceMaterials) || sourceMaterials.length > 20) {
    throw new Error("Add no more than 20 materials");
  }
  if (!Array.isArray(sourceExpenses) || sourceExpenses.length > 10) {
    throw new Error("Add no more than 10 other costs");
  }

  const materials = sourceMaterials.map((material, index) => {
    if (!material || typeof material.name !== "string" || !material.name.trim()) {
      throw new Error(`Material ${index + 1} needs a name`);
    }
    if (material.name.trim().length > 100) {
      throw new Error("Material names must be 100 characters or fewer");
    }
    if (!["all", "half", "used", "estimated", "exact"].includes(material.method)) {
      throw new Error(`Choose how much of material ${index + 1} you used`);
    }
    if (
      material.method === "estimated" &&
      material.costSource !== undefined &&
      !["seller", "ai"].includes(material.costSource)
    ) {
      throw new Error(`The price source for ${material.name.trim()} is invalid`);
    }

    const clean = {
      name: material.name.trim(),
      method: material.method,
      costSource: material.method === "estimated" ? material.costSource || "seller" : "seller",
      purchaseCostNpr: null,
      usedCostNpr: null,
      estimatedCostNpr: null,
      totalQuantity: null,
      quantityUsed: null,
      usedQuantityDescription: "",
      unit: "",
      costNpr: 0,
    };

    if (material.method === "used") {
      clean.usedCostNpr = readAmount(
        material.usedCostNpr,
        `Cost of the amount of ${clean.name} used`,
      );
      clean.costNpr = clean.usedCostNpr;
    } else if (material.method === "estimated") {
      clean.estimatedCostNpr = readAmount(
        material.estimatedCostNpr,
        `Estimated cost for ${clean.name}`,
      );
      if (typeof material.usedQuantityDescription === "string") {
        clean.usedQuantityDescription = material.usedQuantityDescription.trim().slice(0, 100);
      }
      clean.costNpr = clean.estimatedCostNpr;
    } else {
      clean.purchaseCostNpr = readAmount(
        material.purchaseCostNpr,
        `Purchase cost for ${clean.name}`,
      );
      if (material.method === "all") clean.costNpr = clean.purchaseCostNpr;
      if (material.method === "half") clean.costNpr = clean.purchaseCostNpr / 2;
      if (material.method === "exact") {
        clean.totalQuantity = readAmount(
          material.totalQuantity,
          `Total amount of ${clean.name}`,
          { min: Number.EPSILON },
        );
        clean.quantityUsed = readAmount(
          material.quantityUsed,
          `Amount of ${clean.name} used`,
          { min: Number.EPSILON },
        );
        if (clean.quantityUsed > clean.totalQuantity) {
          throw new Error(`Amount used for ${clean.name} cannot exceed the amount purchased`);
        }
        if (typeof material.unit === "string") clean.unit = material.unit.trim().slice(0, 30);
        clean.costNpr = clean.purchaseCostNpr * (clean.quantityUsed / clean.totalQuantity);
      }
    }
    clean.costNpr = roundMoney(clean.costNpr);
    return clean;
  });

  const expenses = sourceExpenses.flatMap((expense, index) => {
    if (expense === null || expense === undefined) return [];
    if (typeof expense !== "object" || Array.isArray(expense)) {
      throw new Error(`Other cost ${index + 1} is invalid`);
    }
    const amountIsMissing =
      expense.amountNpr === undefined ||
      expense.amountNpr === null ||
      (typeof expense.amountNpr === "string" && expense.amountNpr.trim() === "");
    if (amountIsMissing) return [];
    if (typeof expense.name !== "string" || !expense.name.trim()) {
      throw new Error(`Other cost ${index + 1} needs a name`);
    }
    if (expense.name.trim().length > 100) {
      throw new Error("Other cost names must be 100 characters or fewer");
    }
    return [{
      name: expense.name.trim(),
      amountNpr: roundMoney(readAmount(expense.amountNpr, `Cost for ${expense.name.trim()}`)),
    }];
  });

  const minutesSpent = readAmount(input.minutesSpent, "Time spent", {
    optional: true,
    min: 0,
  });
  if (minutesSpent !== null && minutesSpent > 10080) {
    throw new Error("Time spent cannot be more than 7 days");
  }
  if (input.timeEstimated !== undefined && typeof input.timeEstimated !== "boolean") {
    throw new Error("Time estimate choice is invalid");
  }

  const hourlyRateNpr = readAmount(
    input.hourlyRateNpr === undefined ? defaults.hourlyRateNpr : input.hourlyRateNpr,
    "Hourly rate",
  );
  const profitMarginPercent = readAmount(
    input.profitMarginPercent === undefined
      ? defaults.profitMarginPercent
      : input.profitMarginPercent,
    "Profit amount",
  );
  if (hourlyRateNpr > 100000) throw new Error("Hourly rate is too high");
  if (profitMarginPercent > 200) throw new Error("Profit percentage cannot exceed 200");

  const materialsCostNpr = roundMoney(materials.reduce((sum, item) => sum + item.costNpr, 0));
  const additionalExpensesCostNpr = roundMoney(
    expenses.reduce((sum, item) => sum + item.amountNpr, 0),
  );
  const labourCostNpr =
    minutesSpent === null ? 0 : roundMoney((minutesSpent / 60) * hourlyRateNpr);
  const totalCostNpr = roundMoney(
    materialsCostNpr + additionalExpensesCostNpr + labourCostNpr,
  );
  const profitAmountNpr = roundMoney(totalCostNpr * (profitMarginPercent / 100));
  const suggestedPriceNpr = Math.ceil(totalCostNpr + profitAmountNpr);
  if (!Number.isFinite(suggestedPriceNpr)) throw new Error("Suggested price is too large to calculate");

  return {
    materials,
    expenses,
    materialsConfirmed: true,
    expensesConfirmed: true,
    minutesSpent,
    timeEstimated: input.timeEstimated === true,
    hourlyRateNpr,
    profitMarginPercent,
    materialsCostNpr,
    additionalExpensesCostNpr,
    labourCostNpr,
    totalCostNpr,
    profitAmountNpr,
    suggestedPriceNpr,
    complete: minutesSpent !== null,
    finalDecision: input.finalDecision,
  };
};

exports.buildSavedPricing = (input, finalPrice) => {
  const pricing = exports.calculatePricing(input);
  const decision = input.finalDecision;
  const sellerPrice = readAmount(finalPrice, "Selling price");
  if (!["accepted", "changed"].includes(decision)) {
    throw new Error("Choose whether you accepted or changed the suggested price");
  }
  if (decision === "accepted" && Math.abs(sellerPrice - pricing.suggestedPriceNpr) > 0.01) {
    throw new Error("The accepted price must match the suggested price");
  }
  return { ...pricing, finalDecision: decision };
};
