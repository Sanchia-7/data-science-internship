// Utility functions for model integration

export interface ModelFeatures {
  ram: number
  storage: number
  inches: number
  cpu_freq: number
  weight: number
  touchscreen: boolean
  ips: boolean
  retina: boolean
  company: string
  cpu_company: string
  gpu_company: string
  storage_type: string
}

export function prepareModelFeatures(specs: ModelFeatures): number[] {
  // Convert categorical variables to numerical (one-hot encoding or label encoding)
  // Adjust this based on how your model was trained

  const companyEncoding: { [key: string]: number } = {
    Apple: 0,
    Dell: 1,
    HP: 2,
    Lenovo: 3,
    Asus: 4,
    Acer: 5,
    Microsoft: 6,
    MSI: 7,
    Razer: 8,
    Samsung: 9,
  }

  const cpuCompanyEncoding: { [key: string]: number } = {
    Intel: 0,
    AMD: 1,
    Apple: 2,
  }

  const gpuCompanyEncoding: { [key: string]: number } = {
    Intel: 0,
    AMD: 1,
    Nvidia: 2,
    Apple: 3,
  }

  const storageTypeEncoding: { [key: string]: number } = {
    HDD: 0,
    SSD: 1,
    "Flash Storage": 2,
    Hybrid: 3,
  }

  return [
    specs.ram,
    specs.storage,
    specs.inches,
    specs.cpu_freq,
    specs.weight,
    specs.touchscreen ? 1 : 0,
    specs.ips ? 1 : 0,
    specs.retina ? 1 : 0,
    companyEncoding[specs.company] || 0,
    cpuCompanyEncoding[specs.cpu_company] || 0,
    gpuCompanyEncoding[specs.gpu_company] || 0,
    storageTypeEncoding[specs.storage_type] || 0,
  ]
}

export function validateModelInput(specs: ModelFeatures): string[] {
  const errors: string[] = []

  if (specs.ram < 1 || specs.ram > 128) {
    errors.push("RAM must be between 1 and 128 GB")
  }

  if (specs.storage < 32 || specs.storage > 8192) {
    errors.push("Storage must be between 32 GB and 8 TB")
  }

  if (specs.inches < 10 || specs.inches > 20) {
    errors.push("Screen size must be between 10 and 20 inches")
  }

  if (specs.cpu_freq < 0.5 || specs.cpu_freq > 6) {
    errors.push("CPU frequency must be between 0.5 and 6 GHz")
  }

  if (specs.weight < 0.3 || specs.weight > 10) {
    errors.push("Weight must be between 0.3 and 10 kg")
  }

  return errors
}
