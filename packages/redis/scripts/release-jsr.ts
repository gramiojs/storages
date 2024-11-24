import { execSync } from "node:child_process";
import fs from "node:fs";

const version = JSON.parse(execSync("npm pkg get version").toString());

const jsrConfig = JSON.parse(String(fs.readFileSync("deno.json")));

jsrConfig.version = Object.values(version)[0];

fs.writeFileSync("deno.json", JSON.stringify(jsrConfig, null, 4));

// try {
// 	execSync("bun x @teidesu/slow-types-compiler@latest fix --entry deno.json");
// } catch (error) {
// 	console.error(error);
// }

console.log("Prepared to release on JSR!");
