import { describe, it, expect } from "vitest";
import { lookupVehicle } from "./mock-vehicle-api.js";

describe("lookupVehicle", () => {
  it("returns vehicle data for a known reg number", () => {
    const vehicle = lookupVehicle("aaa001");
    expect(vehicle).toEqual({ make: "Volvo", model: "V70", year: 2015 });
  });

  it("is case-insensitive", () => {
    expect(lookupVehicle("AAA001")).toEqual({ make: "Volvo", model: "V70", year: 2015 });
  });

  it("returns undefined for an unknown reg number", () => {
    expect(lookupVehicle("xyz999")).toBeUndefined();
  });

  it("returns different vehicles for different reg numbers", () => {
    const a = lookupVehicle("aaa002");
    const b = lookupVehicle("aaa003");
    expect(a?.make).toBe("BMW");
    expect(b?.make).toBe("Toyota");
  });
});
