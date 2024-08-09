const { readFileSync, unlinkSync, mkdirSync, cpSync, rmSync } = require("fs");
const { join } = require("path");
const { execSync } = require("child_process");
const { DOMParser } = require('xmldom');
const xpath = require('xpath');

const validArgs = ["main", "steel-ui"];
const arg = process.argv[2];

if (!arg) {
    console.error("Error: Missing required argument. Please provide 'main' or 'steel-ui' as an argument.");
    process.exit(1);
}

if (!validArgs.includes(arg)) {
    console.error(`Error: Invalid argument '${arg}'. Acceptable values are 'main' or 'steel-ui'.`);
    process.exit(1);
}

const baseDir = join(__dirname, `../src/${arg}`);
const xmlFilePath = join(baseDir, "ModInfo.xml");

// Rest of the script
const xmlRaw = readFileSync(xmlFilePath, "utf8");
const doc = new DOMParser().parseFromString(xmlRaw, 'text/xml');
const versionNode = xpath.select1("/xml/Version/@value", doc);
const modNameNode = xpath.select1("/xml/Name/@value", doc);

const version = versionNode.value;
const modName = modNameNode.value;

const artifact = `${modName}_${version}.7z`;
const distDir = join(__dirname, "..", "dist");

try {
    rmSync(distDir, { recursive: true });
} catch (e) {
    // directory does not exist
}

try {
    unlinkSync(artifact);
} catch (e) {
    // artifact does not exist
}

const modDistDir = join(distDir, modName);
const srcDir = baseDir; // Use the argument-based directory here

mkdirSync(modDistDir, { recursive: true });

cpSync(srcDir, modDistDir, { recursive: true });

execSync(`.\\node_modules\\7z-bin\\win32\\7z.exe a "${artifact}" "${modDistDir}"`);
