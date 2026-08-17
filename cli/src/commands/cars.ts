import * as p from "@clack/prompts";
import axios from "axios";
import api from "../api.js";
import { lookupVehicle } from "../mock-vehicle-api.js";

type CarStatus = "WATCHING" | "INTERESTED" | "CONTACTED" | "PASSED";

interface Car {
  id: number;
  make: string;
  model: string;
  year: number;
  askingPrice: string | null;
  mileage: number | null;
  regNumber: string | null;
  url: string | null;
  status: CarStatus;
  _count: { notes: number };
}

function handleApiError(err: unknown): void {
  if (axios.isAxiosError(err)) {
    if (!err.response) {
      p.log.error("Kunde inte nå servern — är backend igång?");
    } else {
      p.log.error((err.response.data as { error?: string }).error ?? "Något gick fel");
    }
  }
}

export async function listCarsCommand(): Promise<void> {
  const spinner = p.spinner();
  spinner.start("Hämtar bilar...");

  let cars: Car[];
  try {
    const res = await api.get<Car[]>("/cars");
    cars = res.data;
    spinner.stop();
  } catch (err) {
    spinner.stop();
    handleApiError(err);
    return;
  }

  if (cars.length === 0) {
    p.log.info("Du har inga sparade bilar än.");
    return;
  }

  console.log(`\n  ${cars.length} bil${cars.length === 1 ? "" : "ar"} sparade\n`);
  console.log("  #  Märke         Modell         År    Pris            Status");
  console.log("  " + "-".repeat(72));
  cars.forEach((car, i) => {
    const price = car.askingPrice
      ? `${Number(car.askingPrice).toLocaleString("sv-SE")} kr`
      : "-";
    const num   = String(i + 1).padEnd(4);
    const make  = car.make.padEnd(14);
    const model = car.model.padEnd(15);
    const year  = String(car.year).padEnd(6);
    const priceCol = price.padEnd(16);
    console.log(`  ${num}${make}${model}${year}${priceCol}${car.status}`);
  });
  console.log();

  const choice = await p.select({
    message: "Välj en bil för att hantera den",
    options: [
      ...cars.map((car, i) => ({
        value: String(i),
        label: `${i + 1}. ${car.make} ${car.model} (${car.year}) — ${car.status}`,
      })),
      { value: "back", label: "← Tillbaka" },
    ],
  });

  if (p.isCancel(choice) || choice === "back") return;

  await carMenuCommand(cars[Number(choice)]);
}

function showCarDetails(car: Car): void {
  console.log();
  console.log(`  ${car.make} ${car.model} (${car.year})`);
  console.log(`  ${"─".repeat(40)}`);
  console.log(`  Status:    ${car.status}`);
  if (car.regNumber) console.log(`  Regnr:     ${car.regNumber}`);
  if (car.askingPrice) console.log(`  Pris:      ${Number(car.askingPrice).toLocaleString("sv-SE")} kr`);
  if (car.mileage)    console.log(`  Miltal:    ${car.mileage.toLocaleString("sv-SE")} km`);
  if (car.url)        console.log(`  Annons:    ${car.url}`);
  if (car._count.notes > 0) console.log(`  Noteringar: ${car._count.notes} st`);
  console.log();
}

async function carMenuCommand(car: Car): Promise<void> {
  showCarDetails(car);

  const action = await p.select({
    message: "Vad vill du göra?",
    options: [
      { value: "status", label: "Ändra status" },
      { value: "delete", label: "Ta bort bil" },
      { value: "back",   label: "← Tillbaka" },
    ],
  });

  if (p.isCancel(action) || action === "back") return;

  if (action === "status") await updateStatusCommand(car);
  if (action === "delete") await deleteCarCommand(car);
}

async function updateStatusCommand(car: Car): Promise<void> {
  const status = await p.select({
    message: "Välj ny status",
    options: [
      { value: "WATCHING",   label: "WATCHING — Bevakar" },
      { value: "INTERESTED", label: "INTERESTED — Intresserad" },
      { value: "CONTACTED",  label: "CONTACTED — Kontaktad säljaren" },
      { value: "PASSED",     label: "PASSED — Tackat nej" },
    ],
  });

  if (p.isCancel(status)) return;

  const spinner = p.spinner();
  spinner.start("Uppdaterar status...");
  try {
    await api.put(`/cars/${car.id}`, { status });
    spinner.stop(`Status uppdaterad till ${status as string}`);
  } catch (err) {
    spinner.stop();
    handleApiError(err);
  }
}

async function deleteCarCommand(car: Car): Promise<void> {
  const confirmed = await p.confirm({
    message: `Ta bort ${car.make} ${car.model} (${car.year})? Detta går inte att ångra.`,
    initialValue: false,
  });

  if (p.isCancel(confirmed) || !confirmed) {
    p.log.info("Avbrutet.");
    return;
  }

  const spinner = p.spinner();
  spinner.start("Tar bort...");
  try {
    await api.delete(`/cars/${car.id}`);
    spinner.stop("Bil borttagen.");
  } catch (err) {
    spinner.stop();
    handleApiError(err);
  }
}

export async function addCarCommand(): Promise<void> {
  p.intro("Lägg till bil");

  const regNumber = await p.text({
    message: "Registreringsnummer (valfritt — tryck Enter för att hoppa över)",
    placeholder: "t.ex. aaa001",
  });
  if (p.isCancel(regNumber)) return;

  let make = "";
  let model = "";
  let year = 0;

  if (regNumber) {
    const vehicle = lookupVehicle(regNumber);
    if (vehicle) {
      p.log.success(`Hittade: ${vehicle.make} ${vehicle.model} (${vehicle.year})`);
      const confirmed = await p.confirm({ message: "Stämmer detta?", initialValue: true });
      if (p.isCancel(confirmed)) return;
      if (confirmed) {
        make  = vehicle.make;
        model = vehicle.model;
        year  = vehicle.year;
      }
    } else {
      p.log.warn("Inget fordon hittades för det regnumret. Fyll i uppgifterna manuellt.");
    }
  }

  if (!make) {
    const v = await p.text({ message: "Märke", validate: (s) => (!s ? "Märke krävs" : undefined) });
    if (p.isCancel(v)) return;
    make = v;
  }

  if (!model) {
    const v = await p.text({ message: "Modell", validate: (s) => (!s ? "Modell krävs" : undefined) });
    if (p.isCancel(v)) return;
    model = v;
  }

  if (!year) {
    const v = await p.text({
      message: "År",
      validate: (s) => {
        const n = Number(s);
        if (!s || isNaN(n) || n < 1886 || n > new Date().getFullYear() + 1)
          return "Ange ett giltigt år (t.ex. 2018)";
      },
    });
    if (p.isCancel(v)) return;
    year = Number(v);
  }

  const priceInput = await p.text({
    message: "Pris i kr (valfritt — tryck Enter för att hoppa över)",
    placeholder: "t.ex. 85000",
  });
  if (p.isCancel(priceInput)) return;

  const mileageInput = await p.text({
    message: "Miltal i km (valfritt — tryck Enter för att hoppa över)",
    placeholder: "t.ex. 12000",
  });
  if (p.isCancel(mileageInput)) return;

  const urlInput = await p.text({
    message: "Annons-URL (valfritt — tryck Enter för att hoppa över)",
    placeholder: "https://www.blocket.se/annons/...",
  });
  if (p.isCancel(urlInput)) return;

  const body: Record<string, unknown> = { make, model, year };
  if (regNumber)    body.regNumber   = regNumber;
  if (priceInput)   body.askingPrice = Number(priceInput);
  if (mileageInput) body.mileage     = Number(mileageInput);
  if (urlInput)     body.url         = urlInput;

  const spinner = p.spinner();
  spinner.start("Sparar bil...");
  try {
    await api.post("/cars", body);
    spinner.stop(`${make} ${model} (${year}) sparad!`);
  } catch (err) {
    spinner.stop();
    handleApiError(err);
  }
}
