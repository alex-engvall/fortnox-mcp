import { mkdir, writeFile } from "node:fs/promises";
import { reviewSchema } from "../src/review.js";

// Only synthetic-review DDL; no auth records, credentials or policy changes.
await mkdir(".data", { recursive: true });
await writeFile(".data/review.sql", `${reviewSchema};\n`);
console.log(
  "Prepared .data/review.sql. Apply explicitly before enabling the optional review probe.",
);
