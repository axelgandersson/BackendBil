#!/usr/bin/env node
import * as p from "@clack/prompts";
import { getToken } from "./auth.js";
import { loginCommand } from "./commands/login.js";
import { logoutCommand } from "./commands/logout.js";
import { listCarsCommand, addCarCommand } from "./commands/cars.js";

async function main(): Promise<void> {
  p.intro("Bil-CLI — din personliga bilbevakare");

  const token = await getToken();
  if (!token) {
    p.log.warn("Du är inte inloggad.");
    const loggedIn = await loginCommand();
    if (!loggedIn) {
      p.outro("Avslutar.");
      process.exit(0);
    }
  }

  while (true) {
    const action = await p.select({
      message: "Vad vill du göra?",
      options: [
        { value: "list",   label: "Visa sparade bilar" },
        { value: "add",    label: "Lägg till bil" },
        { value: "logout", label: "Logga ut" },
        { value: "quit",   label: "Avsluta" },
      ],
    });

    if (p.isCancel(action) || action === "quit") {
      p.outro("Hejdå!");
      process.exit(0);
    }

    if (action === "list")   await listCarsCommand();
    if (action === "add")    await addCarCommand();
    if (action === "logout") {
      await logoutCommand();
      p.outro("Hejdå!");
      process.exit(0);
    }
  }
}

main().catch((err: unknown) => {
  console.error("Oväntat fel:", err);
  process.exit(1);
});
