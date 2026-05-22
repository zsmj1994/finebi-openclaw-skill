import * as fs from "node:fs";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { getDefaultConfigDir, getDefaultEnvPath } from "./helpers.js";

/**
 * Interactively configure FineBI connection by prompting the user
 * and saving the results to the user-level .env file.
 */
export async function runInit() {
  const rl = readline.createInterface({ input, output });
  try {
    console.log("Welcome to FineBI CLI Initialization/Configuration!");
    console.log("This will guide you through setting up your FineBI connection details.\n");

    const baseUrl = await rl.question("FineBI Base URL (e.g., https://bi.example.com): ");
    const accessToken = await rl.question("FineBI Access Token: ");

    const envContent = `FINEBI_BASE_URL=${baseUrl.trim()}
FINE_ACCESS_TOKEN=${accessToken.trim()}
`;

    const envPath = getDefaultEnvPath();
    fs.mkdirSync(getDefaultConfigDir(), { recursive: true });
    fs.writeFileSync(envPath, envContent, "utf-8");

    console.log(`\nSuccessfully saved configuration to ${envPath}`);
    console.log("You can now use the FineBI commands from any directory.");
  } catch (err) {
    console.error("\nInitialization failed:", err);
    process.exit(1);
  } finally {
    rl.close();
  }
}
