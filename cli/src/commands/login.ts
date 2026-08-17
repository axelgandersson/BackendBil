import * as p from "@clack/prompts";
import axios from "axios";
import api from "../api.js";
import { saveToken } from "../auth.js";

export async function loginCommand(): Promise<boolean> {
  p.intro("Logga in");

  const email = await p.text({
    message: "E-post",
    validate: (v) => (!v ? "E-post krävs" : undefined),
  });
  if (p.isCancel(email)) return false;

  const password = await p.password({
    message: "Lösenord",
    validate: (v) => (!v ? "Lösenord krävs" : undefined),
  });
  if (p.isCancel(password)) return false;

  const spinner = p.spinner();
  spinner.start("Loggar in...");

  try {
    const res = await api.post<{ token: string }>("/auth/login", { email, password });
    await saveToken(res.data.token);
    spinner.stop("Inloggad!");
    return true;
  } catch (err) {
    spinner.stop();
    if (axios.isAxiosError(err)) {
      if (!err.response) {
        p.log.error("Kunde inte nå servern — är backend igång?");
      } else {
        p.log.error((err.response.data as { error?: string }).error ?? "Inloggning misslyckades");
      }
    }
    return false;
  }
}
