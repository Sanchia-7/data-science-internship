// import type { SalaryRecord } from "./data-utils"

// export interface PredictionFeatures {
//   work_year: number
//   experience_level: string
//   employment_type: string
//   job_title: string
//   company_size: string
//   remote_ratio: number
//   company_location: string
// }

// export interface PredictionResult {
//   predicted_salary: number
//   confidence_score: number
//   salary_range: {
//     min: number
//     max: number
//   }
//   market_insights: {
//     percentile: number
//     comparison_to_average: number
//     trend: "increasing" | "decreasing" | "stable"
//   }
// }

// // Simple linear regression implementation
// class LinearRegression {
//   private weights: number[] = []
//   private bias = 0

//   fit(X: number[][], y: number[]) {
//     const n = X.length
//     const features = X[0].length

//     // Initialize weights
//     this.weights = new Array(features).fill(0)
//     this.bias = 0

//     const learningRate = 0.0001
//     const epochs = 1000

//     for (let epoch = 0; epoch < epochs; epoch++) {
//       let totalError = 0
//       const weightGradients = new Array(features).fill(0)
//       let biasGradient = 0

//       for (let i = 0; i < n; i++) {
//         const prediction = this.predict([X[i]])[0]
//         const error = prediction - y[i]
//         totalError += error * error

//         // Calculate gradients
//         for (let j = 0; j < features; j++) {
//           weightGradients[j] += error * X[i][j]
//         }
//         biasGradient += error
//       }

//       // Update weights and bias
//       for (let j = 0; j < features; j++) {
//         this.weights[j] -= (learningRate * weightGradients[j]) / n
//       }
//       this.bias -= (learningRate * biasGradient) / n
//     }
//   }

//   predict(X: number[][]): number[] {
//     return X.map((row) => {
//       let prediction = this.bias
//       for (let i = 0; i < row.length; i++) {
//         prediction += this.weights[i] * row[i]
//       }
//       return Math.max(0, prediction) // Ensure non-negative salary
//     })
//   }
// }

// export class SalaryPredictor {
//   private model: LinearRegression
//   private featureEncoders: Map<string, Map<string, number>>
//   private scaler: { mean: number[]; std: number[] }
//   private trainedData: SalaryRecord[]

//   constructor() {
//     this.model = new LinearRegression()
//     this.featureEncoders = new Map()
//     this.scaler = { mean: [], std: [] }
//     this.trainedData = []
//   }

//   private encodeFeatures(data: SalaryRecord[]): number[][] {
//     // Create encoders for categorical variables
//     const categoricalFeatures = ["experience_level", "employment_type", "job_title", "company_size", "company_location"]

//     categoricalFeatures.forEach((feature) => {
//       const uniqueValues = [...new Set(data.map((record) => record[feature as keyof SalaryRecord] as string))]
//       const encoder = new Map()
//       uniqueValues.forEach((value, index) => {
//         encoder.set(value, index)
//       })
//       this.featureEncoders.set(feature, encoder)
//     })

//     // Convert records to feature vectors
//     const features = data.map((record) => [
//       record.work_year,
//       this.featureEncoders.get("experience_level")?.get(record.experience_level) || 0,
//       this.featureEncoders.get("employment_type")?.get(record.employment_type) || 0,
//       this.featureEncoders.get("job_title")?.get(record.job_title) || 0,
//       this.featureEncoders.get("company_size")?.get(record.company_size) || 0,
//       record.remote_ratio,
//       this.featureEncoders.get("company_location")?.get(record.company_location) || 0,
//     ])

//     // Normalize features
//     const numFeatures = features[0].length
//     this.scaler.mean = new Array(numFeatures).fill(0)
//     this.scaler.std = new Array(numFeatures).fill(1)

//     // Calculate mean
//     for (let i = 0; i < numFeatures; i++) {
//       this.scaler.mean[i] = features.reduce((sum, row) => sum + row[i], 0) / features.length
//     }

//     // Calculate standard deviation
//     for (let i = 0; i < numFeatures; i++) {
//       const variance =
//         features.reduce((sum, row) => sum + Math.pow(row[i] - this.scaler.mean[i], 2), 0) / features.length
//       this.scaler.std[i] = Math.sqrt(variance) || 1
//     }

//     // Normalize
//     return features.map((row) => row.map((value, i) => (value - this.scaler.mean[i]) / this.scaler.std[i]))
//   }

//   private normalizeFeatures(features: number[]): number[] {
//     return features.map((value, i) => (value - this.scaler.mean[i]) / this.scaler.std[i])
//   }

//   train(data: SalaryRecord[]) {
//     this.trainedData = data
//     const X = this.encodeFeatures(data)
//     const y = data.map((record) => record.salary_in_usd)

//     this.model.fit(X, y)
//   }

//   predict(features: PredictionFeatures): PredictionResult {
//     // Encode the input features
//     const encodedFeatures = [
//       features.work_year,
//       this.featureEncoders.get("experience_level")?.get(features.experience_level) || 0,
//       this.featureEncoders.get("employment_type")?.get(features.employment_type) || 0,
//       this.featureEncoders.get("job_title")?.get(features.job_title) || 0,
//       this.featureEncoders.get("company_size")?.get(features.company_size) || 0,
//       features.remote_ratio,
//       this.featureEncoders.get("company_location")?.get(features.company_location) || 0,
//     ]

//     const normalizedFeatures = this.normalizeFeatures(encodedFeatures)
//     const prediction = this.model.predict([normalizedFeatures])[0]

//     // Calculate confidence and range based on similar records
//     const similarRecords = this.findSimilarRecords(features)
//     const salaries = similarRecords.map((r) => r.salary_in_usd)

//     const avgSalary = salaries.length > 0 ? salaries.reduce((a, b) => a + b, 0) / salaries.length : prediction
//     const stdDev =
//       salaries.length > 1
//         ? Math.sqrt(salaries.reduce((sum, salary) => sum + Math.pow(salary - avgSalary, 2), 0) / (salaries.length - 1))
//         : prediction * 0.2

//     // Calculate market insights
//     const allSalaries = this.trainedData.map((r) => r.salary_in_usd).sort((a, b) => a - b)
//     const percentile = (allSalaries.filter((s) => s <= prediction).length / allSalaries.length) * 100

//     const overallAverage = allSalaries.reduce((a, b) => a + b, 0) / allSalaries.length
//     const comparisonToAverage = ((prediction - overallAverage) / overallAverage) * 100

//     // Determine trend based on recent years
//     const recentTrend = this.calculateTrend(features.job_title, features.experience_level)

//     return {
//       predicted_salary: Math.round(prediction),
//       confidence_score: Math.min(95, Math.max(60, 100 - (stdDev / avgSalary) * 100)),
//       salary_range: {
//         min: Math.round(Math.max(0, prediction - stdDev)),
//         max: Math.round(prediction + stdDev),
//       },
//       market_insights: {
//         percentile: Math.round(percentile),
//         comparison_to_average: Math.round(comparisonToAverage),
//         trend: recentTrend,
//       },
//     }
//   }

//   private findSimilarRecords(features: PredictionFeatures): SalaryRecord[] {
//     return this.trainedData
//       .filter(
//         (record) =>
//           record.job_title === features.job_title &&
//           record.experience_level === features.experience_level &&
//           Math.abs(record.work_year - features.work_year) <= 2,
//       )
//       .slice(0, 50) // Limit to 50 most recent similar records
//   }

//   private calculateTrend(jobTitle: string, experienceLevel: string): "increasing" | "decreasing" | "stable" {
//     const relevantRecords = this.trainedData
//       .filter((r) => r.job_title === jobTitle && r.experience_level === experienceLevel)
//       .sort((a, b) => a.work_year - b.work_year)

//     if (relevantRecords.length < 2) return "stable"

//     const recentYears = relevantRecords.slice(-3)
//     const earlierYears = relevantRecords.slice(0, -3)

//     if (recentYears.length === 0 || earlierYears.length === 0) return "stable"

//     const recentAvg = recentYears.reduce((sum, r) => sum + r.salary_in_usd, 0) / recentYears.length
//     const earlierAvg = earlierYears.reduce((sum, r) => sum + r.salary_in_usd, 0) / earlierYears.length

//     const changePercent = ((recentAvg - earlierAvg) / earlierAvg) * 100

//     if (changePercent > 5) return "increasing"
//     if (changePercent < -5) return "decreasing"
//     return "stable"
//   }
// }








import type { SalaryRecord } from "./data-utils"

export interface PredictionFeatures {
  work_year: number
  experience_level: string
  employment_type: string
  job_title: string
  company_size: string
  remote_ratio: number
  company_location: string
}

export interface PredictionResult {
  predicted_salary: number
  confidence_score: number
  salary_range: {
    min: number
    max: number
  }
  market_insights: {
    percentile: number
    comparison_to_average: number
    trend: "increasing" | "decreasing" | "stable"
  }
}

class LinearRegression {
  private weights: number[] = []
  private bias = 0

  fit(X: number[][], y: number[]) {
    const n = X.length
    const features = X[0].length
    this.weights = new Array(features).fill(0)
    this.bias = 0

    const learningRate = 0.0001
    const epochs = 1000

    for (let epoch = 0; epoch < epochs; epoch++) {
      const weightGradients = new Array(features).fill(0)
      let biasGradient = 0

      for (let i = 0; i < n; i++) {
        const prediction = this.predict([X[i]])[0]
        const error = prediction - y[i]
        for (let j = 0; j < features; j++) {
          weightGradients[j] += error * X[i][j]
        }
        biasGradient += error
      }

      for (let j = 0; j < features; j++) {
        this.weights[j] -= (learningRate * weightGradients[j]) / n
      }
      this.bias -= (learningRate * biasGradient) / n
    }
  }

  predict(X: number[][]): number[] {
    return X.map((row) => {
      let prediction = this.bias
      for (let i = 0; i < row.length; i++) {
        prediction += this.weights[i] * row[i]
      }
      return Math.max(0, prediction)
    })
  }
}

export class SalaryPredictor {
  private model: LinearRegression
  private featureEncoders: Map<string, Map<string, number>>
  private scaler: { mean: number[]; std: number[] }
  private trainedData: SalaryRecord[]

  constructor() {
    this.model = new LinearRegression()
    this.featureEncoders = new Map()
    this.scaler = { mean: [], std: [] }
    this.trainedData = []
  }

  private encodeFeatures(data: SalaryRecord[]): number[][] {
    const categoricalFeatures = [
      "experience_level", "employment_type", "job_title", "company_size", "company_location"
    ]

    categoricalFeatures.forEach((feature) => {
      const uniqueValues = [...new Set(data.map((record) => record[feature as keyof SalaryRecord] as string))]
      const encoder = new Map()
      uniqueValues.forEach((value, index) => {
        encoder.set(value, index)
      })
      encoder.set("UNKNOWN", uniqueValues.length)
      this.featureEncoders.set(feature, encoder)
    })

    const features = data.map((record) => [
      record.work_year,
      this.featureEncoders.get("experience_level")?.get(record.experience_level) ?? 0,
      this.featureEncoders.get("employment_type")?.get(record.employment_type) ?? 0,
      this.featureEncoders.get("job_title")?.get(record.job_title) ?? 0,
      this.featureEncoders.get("company_size")?.get(record.company_size) ?? 0,
      record.remote_ratio,
      this.featureEncoders.get("company_location")?.get(record.company_location) ?? 0,
    ])

    const numFeatures = features[0].length
    this.scaler.mean = new Array(numFeatures).fill(0)
    this.scaler.std = new Array(numFeatures).fill(1)

    for (let i = 0; i < numFeatures; i++) {
      this.scaler.mean[i] = features.reduce((sum, row) => sum + row[i], 0) / features.length
      const variance = features.reduce((sum, row) => sum + Math.pow(row[i] - this.scaler.mean[i], 2), 0) / features.length
      this.scaler.std[i] = Math.sqrt(variance) || 1
    }

    return features.map((row) => row.map((value, i) => (value - this.scaler.mean[i]) / this.scaler.std[i]))
  }

  private normalizeFeatures(features: number[]): number[] {
    return features.map((value, i) => (value - this.scaler.mean[i]) / this.scaler.std[i])
  }

  train(data: SalaryRecord[]) {
    this.trainedData = data
    const X = this.encodeFeatures(data)
    const y = data.map((record) => record.salary_in_usd)
    this.model.fit(X, y)
  }

  predict(features: PredictionFeatures): PredictionResult {
  const getEncoded = (feature: string, value: string) =>
    this.featureEncoders.get(feature)?.get(value) ??
    this.featureEncoders.get(feature)?.get("UNKNOWN") ??
    0

  const encodedFeatures = [
    features.work_year,
    getEncoded("experience_level", features.experience_level),
    getEncoded("employment_type", features.employment_type),
    getEncoded("job_title", features.job_title),
    getEncoded("company_size", features.company_size),
    features.remote_ratio,
    getEncoded("company_location", features.company_location),
  ]

  const normalizedFeatures = this.normalizeFeatures(encodedFeatures)
  const monthlyPrediction = this.model.predict([normalizedFeatures])[0]

  const annualPrediction = monthlyPrediction * 12

  // Similar records — assume salary_in_usd is monthly, convert to annual
  const similarRecords = this.findSimilarRecords(features)
  const salaries = similarRecords.map((r) => r.salary_in_usd * 12)

  const avgSalary = salaries.length > 0 ? salaries.reduce((a, b) => a + b, 0) / salaries.length : annualPrediction
  const stdDev =
    salaries.length > 1
      ? Math.sqrt(salaries.reduce((sum, s) => sum + Math.pow(s - avgSalary, 2), 0) / (salaries.length - 1))
      : annualPrediction * 0.2

  // Market-wide salaries (annualized)
  const allSalaries = this.trainedData.map((r) => r.salary_in_usd * 12).sort((a, b) => a - b)
  const percentile = (allSalaries.filter((s) => s <= annualPrediction).length / allSalaries.length) * 100
  const overallAverage = allSalaries.reduce((a, b) => a + b, 0) / allSalaries.length
  const comparisonToAverage = ((annualPrediction - overallAverage) / overallAverage) * 100
  const recentTrend = this.calculateTrend(features.job_title, features.experience_level)

  return {
    predicted_salary: Math.round(annualPrediction),
    confidence_score: Math.min(95, Math.max(60, 100 - (stdDev / avgSalary) * 100)),
    salary_range: {
      min: Math.round(Math.max(0, annualPrediction - stdDev)),
      max: Math.round(annualPrediction + stdDev),
    },
    market_insights: {
      percentile: Math.round(percentile),
      comparison_to_average: Math.round(comparisonToAverage),
      trend: recentTrend,
    },
  }
}


  private findSimilarRecords(features: PredictionFeatures): SalaryRecord[] {
  return this.trainedData
    .filter((record) =>
      record.job_title === features.job_title &&
      Math.abs(record.work_year - features.work_year) <= 2
    )
    .slice(0, 50)
}


  private calculateTrend(jobTitle: string, experienceLevel: string): "increasing" | "decreasing" | "stable" {
    const relevantRecords = this.trainedData
      .filter((r) => r.job_title === jobTitle && r.experience_level === experienceLevel)
      .sort((a, b) => a.work_year - b.work_year)

    if (relevantRecords.length < 2) return "stable"

    const recentYears = relevantRecords.slice(-3)
    const earlierYears = relevantRecords.slice(0, -3)
    if (recentYears.length === 0 || earlierYears.length === 0) return "stable"

    const recentAvg = recentYears.reduce((sum, r) => sum + r.salary_in_usd, 0) / recentYears.length
    const earlierAvg = earlierYears.reduce((sum, r) => sum + r.salary_in_usd, 0) / earlierYears.length
    const changePercent = ((recentAvg - earlierAvg) / earlierAvg) * 100

    if (changePercent > 5) return "increasing"
    if (changePercent < -5) return "decreasing"
    return "stable"
  }
}
