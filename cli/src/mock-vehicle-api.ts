export interface Vehicle {
  make: string;
  model: string;
  year: number;
}

const mockVehicles: Record<string, Vehicle> = {
  "aaa001": { make: "Volvo",      model: "V70",      year: 2015 },
  "aaa002": { make: "BMW",        model: "3-serie",  year: 2018 },
  "aaa003": { make: "Toyota",     model: "Corolla",  year: 2020 },
  "aaa004": { make: "Volkswagen", model: "Golf",     year: 2017 },
  "aaa005": { make: "Ford",       model: "Focus",    year: 2016 },
};

export function lookupVehicle(regNumber: string): Vehicle | undefined {
  return mockVehicles[regNumber.toLowerCase()];
}
