import * as fs from "node:fs";
import * as path from "node:path";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { fileURLToPath } from "node:url";

/**
 * Interactively configure FineBI connection by prompting the user
 * and saving the results to a .env file.
 */
export async function runInit() {
  const rl = readline.createInterface({ input, output });
  try {
    console.log("Welcome to FineBI CLI Initialization/Configuration!");
    console.log("This will guide you through setting up your FineBI connection details.\n");

    const baseUrl = await rl.question("FineBI Base URL (e.g., https://bi.example.com): ");
    const username = await rl.question("FineBI Username: ");
    const password = await rl.question("FineBI Password: ");

    const envContent = `FINEBI_BASE_URL=${baseUrl.trim()}
FINEBI_USERNAME=${username.trim()}
FINEBI_PASSWORD=${password.trim()}
`;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const envPath = path.join(__dirname, "../.env");
    fs.writeFileSync(envPath, envContent, "utf-8");

    console.log(`\nSuccessfully saved configuration to ${envPath}`);
    console.log("You can now use the FineBI commands.");
  } catch (err) {
    console.error("\nInitialization failed:", err);
    process.exit(1);
  } finally {
    rl.close();
  }
}
