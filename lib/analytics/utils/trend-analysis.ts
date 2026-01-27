/**
 * Trend Analysis and Forecasting Utilities
 * Linear regression, confidence intervals, and 6-month forecasting
 */

import { TrendDataPoint, TrendDirection } from "../types";

// ============================================================================
// LINEAR REGRESSION
// ============================================================================

export interface RegressionResult {
  slope: number;
  intercept: number;
  rSquared: number;
  predictions: number[];
}

/**
 * Calculate simple linear regression
 * Returns slope, intercept, and R² for fit quality
 */
export function linearRegression(
  xValues: number[],
  yValues: number[],
): RegressionResult {
  if (xValues.length !== yValues.length || xValues.length < 2) {
    throw new Error("Arrays must have same length and at least 2 points");
  }

  const n = xValues.length;

  // Calculate means
  const xMean = xValues.reduce((a, b) => a + b, 0) / n;
  const yMean = yValues.reduce((a, b) => a + b, 0) / n;

  // Calculate slope and intercept
  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator += (xValues[i] - xMean) * (yValues[i] - yMean);
    denominator += (xValues[i] - xMean) ** 2;
  }

  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = yMean - slope * xMean;

  // Calculate R²
  const rSquared = calculateRSquared(xValues, yValues, slope, intercept);

  // Generate predictions
  const predictions = xValues.map((x) => slope * x + intercept);

  return {
    slope,
    intercept,
    rSquared,
    predictions,
  };
}

/**
 * Calculate R² (coefficient of determination)
 */
function calculateRSquared(
  xValues: number[],
  yValues: number[],
  slope: number,
  intercept: number,
): number {
  const yMean = yValues.reduce((a, b) => a + b, 0) / yValues.length;

  let ssRes = 0; // Sum of squares of residuals
  let ssTot = 0; // Total sum of squares

  for (let i = 0; i < xValues.length; i++) {
    const yPred = slope * xValues[i] + intercept;
    ssRes += (yValues[i] - yPred) ** 2;
    ssTot += (yValues[i] - yMean) ** 2;
  }

  if (ssTot === 0) return 0;
  return 1 - ssRes / ssTot;
}

// ============================================================================
// CONFIDENCE INTERVALS
// ============================================================================

/**
 * Calculate 95% confidence interval for predictions
 */
export function calculateConfidenceInterval(
  xValues: number[],
  yValues: number[],
  regression: RegressionResult,
  confidenceLevel: number = 0.95,
): {
  lower: number[];
  upper: number[];
} {
  const n = xValues.length;
  if (n < 3) {
    // Not enough data for meaningful confidence intervals
    return {
      lower: regression.predictions,
      upper: regression.predictions,
    };
  }

  // Calculate standard error
  const residuals = yValues.map(
    (y, i) => y - (regression.slope * xValues[i] + regression.intercept),
  );
  const sumSquaredResiduals = residuals.reduce((sum, r) => sum + r ** 2, 0);
  const standardError = Math.sqrt(sumSquaredResiduals / (n - 2));

  // T-value for 95% confidence (approximate)
  const tValue = 1.96; // For large samples, using z-score

  const xMean = xValues.reduce((a, b) => a + b, 0) / n;
  const xVariance = xValues.reduce((sum, x) => sum + (x - xMean) ** 2, 0) / n;

  const lower: number[] = [];
  const upper: number[] = [];

  xValues.forEach((x, i) => {
    const prediction = regression.predictions[i];
    const marginOfError =
      tValue *
      standardError *
      Math.sqrt(1 + 1 / n + (x - xMean) ** 2 / (n * xVariance));

    lower.push(Math.max(0, prediction - marginOfError));
    upper.push(prediction + marginOfError);
  });

  return { lower, upper };
}

// ============================================================================
// FORECASTING
// ============================================================================

/**
 * Forecast values for next N periods
 */
export function forecastMetric(
  historicalData: TrendDataPoint[],
  periodsAhead: number = 6,
): {
  forecast: TrendDataPoint[];
  confidence: {
    lower: TrendDataPoint[];
    upper: TrendDataPoint[];
  };
  regression: RegressionResult;
} {
  if (historicalData.length < 3) {
    throw new Error("Need at least 3 historical data points for forecasting");
  }

  // Convert dates to numeric values (days since first date)
  const firstDate = new Date(historicalData[0].date);
  const xValues = historicalData.map((d) => {
    const date = new Date(d.date);
    return Math.floor(
      (date.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24),
    );
  });
  const yValues = historicalData.map((d) => d.value);

  // Perform regression
  const regression = linearRegression(xValues, yValues);

  // Calculate confidence intervals for historical data
  const confidenceIntervals = calculateConfidenceInterval(
    xValues,
    yValues,
    regression,
  );

  // Generate forecast
  const lastX = xValues[xValues.length - 1];
  const lastDate = new Date(historicalData[historicalData.length - 1].date);

  // Determine period increment (assumes monthly data)
  const periodIncrementDays = 30;

  const forecast: TrendDataPoint[] = [];
  const lowerBound: TrendDataPoint[] = [];
  const upperBound: TrendDataPoint[] = [];

  for (let i = 1; i <= periodsAhead; i++) {
    const x = lastX + i * periodIncrementDays;
    const predictedValue = regression.slope * x + regression.intercept;

    const forecastDate = new Date(lastDate);
    forecastDate.setMonth(forecastDate.getMonth() + i);

    // Confidence interval widens for future predictions
    const standardError = calculateStandardError(xValues, yValues, regression);
    const marginOfError = 1.96 * standardError * Math.sqrt(1 + i * 0.2);

    forecast.push({
      date: forecastDate.toISOString().split("T")[0],
      value: Math.max(0, predictedValue),
      isForecast: true,
    });

    lowerBound.push({
      date: forecastDate.toISOString().split("T")[0],
      value: Math.max(0, predictedValue - marginOfError),
      isForecast: true,
    });

    upperBound.push({
      date: forecastDate.toISOString().split("T")[0],
      value: predictedValue + marginOfError,
      isForecast: true,
    });
  }

  return {
    forecast,
    confidence: {
      lower: lowerBound,
      upper: upperBound,
    },
    regression,
  };
}

/**
 * Calculate standard error of regression
 */
function calculateStandardError(
  xValues: number[],
  yValues: number[],
  regression: RegressionResult,
): number {
  const n = xValues.length;
  const residuals = yValues.map(
    (y, i) => y - (regression.slope * xValues[i] + regression.intercept),
  );
  const sumSquaredResiduals = residuals.reduce((sum, r) => sum + r ** 2, 0);
  return Math.sqrt(sumSquaredResiduals / (n - 2));
}

// ============================================================================
// MOVING AVERAGES
// ============================================================================

/**
 * Calculate simple moving average
 */
export function calculateMovingAverage(
  data: TrendDataPoint[],
  windowSize: number,
): TrendDataPoint[] {
  if (data.length < windowSize) {
    return data;
  }

  const result: TrendDataPoint[] = [];

  for (let i = windowSize - 1; i < data.length; i++) {
    const window = data.slice(i - windowSize + 1, i + 1);
    const average = window.reduce((sum, d) => sum + d.value, 0) / windowSize;

    result.push({
      date: data[i].date,
      value: average,
      isForecast: false,
    });
  }

  return result;
}

/**
 * Calculate exponential moving average
 */
export function calculateExponentialMovingAverage(
  data: TrendDataPoint[],
  smoothingFactor: number = 0.3,
): TrendDataPoint[] {
  if (data.length === 0) return [];

  const result: TrendDataPoint[] = [data[0]];
  let ema = data[0].value;

  for (let i = 1; i < data.length; i++) {
    ema = smoothingFactor * data[i].value + (1 - smoothingFactor) * ema;
    result.push({
      date: data[i].date,
      value: ema,
      isForecast: false,
    });
  }

  return result;
}

// ============================================================================
// TREND DETECTION
// ============================================================================

/**
 * Detect overall trend direction
 */
export function detectTrendDirection(data: TrendDataPoint[]): TrendDirection {
  if (data.length < 2) return TrendDirection.STABLE;

  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));

  const firstAvg =
    firstHalf.reduce((sum, d) => sum + d.value, 0) / firstHalf.length;
  const secondAvg =
    secondHalf.reduce((sum, d) => sum + d.value, 0) / secondHalf.length;

  const percentChange = ((secondAvg - firstAvg) / firstAvg) * 100;

  if (Math.abs(percentChange) < 3) return TrendDirection.STABLE;
  if (percentChange > 0) return TrendDirection.IMPROVING;
  return TrendDirection.DECLINING;
}

/**
 * Calculate trend strength (0-1, where 1 is strongest)
 */
export function calculateTrendStrength(regression: RegressionResult): number {
  return Math.abs(regression.rSquared);
}

// ============================================================================
// DRIVER IDENTIFICATION
// ============================================================================

export interface Driver {
  driver: string;
  impact: string;
  correlation: number;
}

/**
 * Identify factors correlated with metric changes
 */
export function identifyDrivers(
  metricValues: number[],
  potentialDrivers: Record<string, number[]>,
): Driver[] {
  const drivers: Driver[] = [];

  Object.entries(potentialDrivers).forEach(([driverName, driverValues]) => {
    if (driverValues.length !== metricValues.length) return;

    const correlation = calculateCorrelation(metricValues, driverValues);

    if (Math.abs(correlation) > 0.3) {
      // Only include meaningful correlations
      let impact: string;
      if (correlation > 0.7) impact = "Strong positive";
      else if (correlation > 0.3) impact = "Moderate positive";
      else if (correlation < -0.7) impact = "Strong negative";
      else impact = "Moderate negative";

      drivers.push({
        driver: driverName,
        impact,
        correlation: Number(correlation.toFixed(3)),
      });
    }
  });

  return drivers.sort(
    (a, b) => Math.abs(b.correlation) - Math.abs(a.correlation),
  );
}

/**
 * Calculate Pearson correlation coefficient
 */
function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;

  const n = x.length;
  const xMean = x.reduce((a, b) => a + b, 0) / n;
  const yMean = y.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let xDenom = 0;
  let yDenom = 0;

  for (let i = 0; i < n; i++) {
    numerator += (x[i] - xMean) * (y[i] - yMean);
    xDenom += (x[i] - xMean) ** 2;
    yDenom += (y[i] - yMean) ** 2;
  }

  if (xDenom === 0 || yDenom === 0) return 0;
  return numerator / Math.sqrt(xDenom * yDenom);
}

// ============================================================================
// FORECAST RISKS
// ============================================================================

/**
 * Identify risks to forecast accuracy
 */
export function identifyForecastRisks(
  regression: RegressionResult,
  data: TrendDataPoint[],
): string[] {
  const risks: string[] = [];

  // Low R² indicates poor fit
  if (regression.rSquared < 0.5) {
    risks.push(
      "Low R² value indicates high variability - forecast may be unreliable",
    );
  }

  // Limited historical data
  if (data.length < 6) {
    risks.push("Limited historical data - forecast confidence is low");
  }

  // High volatility
  const values = data.map((d) => d.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  const coefficientOfVariation = Math.sqrt(variance) / mean;

  if (coefficientOfVariation > 0.3) {
    risks.push("High data volatility may affect forecast accuracy");
  }

  // Recent trend reversal
  const recentData = data.slice(-3);
  const earlierData = data.slice(-6, -3);
  if (recentData.length >= 3 && earlierData.length >= 3) {
    const recentTrend = detectTrendDirection(recentData);
    const earlierTrend = detectTrendDirection(earlierData);

    if (recentTrend !== earlierTrend) {
      risks.push("Recent trend reversal detected - extrapolation may not hold");
    }
  }

  if (risks.length === 0) {
    risks.push("No major risks identified - forecast appears reliable");
  }

  return risks;
}

/**
 * Calculate forecast accuracy from past predictions
 */
export function calculateForecastAccuracy(
  actualValues: number[],
  predictedValues: number[],
): {
  mape: number; // Mean Absolute Percentage Error
  rmse: number; // Root Mean Squared Error
} {
  if (
    actualValues.length !== predictedValues.length ||
    actualValues.length === 0
  ) {
    return { mape: 0, rmse: 0 };
  }

  const n = actualValues.length;
  let sumAbsPercentError = 0;
  let sumSquaredError = 0;

  for (let i = 0; i < n; i++) {
    const error = actualValues[i] - predictedValues[i];
    sumSquaredError += error ** 2;

    if (actualValues[i] !== 0) {
      sumAbsPercentError += Math.abs(error / actualValues[i]);
    }
  }

  const mape = (sumAbsPercentError / n) * 100;
  const rmse = Math.sqrt(sumSquaredError / n);

  return {
    mape: Number(mape.toFixed(2)),
    rmse: Number(rmse.toFixed(2)),
  };
}
