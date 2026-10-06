import fs from "node:fs";
import path from "node:path";
import openapiTS, { astToString } from "openapi-typescript";
import { getOpenApiSpec } from "../src/lib/openapi";

async function generate(): Promise<void> {
  const spec = getOpenApiSpec();
  const ast = await openapiTS(
    spec as unknown as Parameters<typeof openapiTS>[0]
  );
  const tsContent = `/**
 * AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY.
 * Generated from src/lib/openapi.ts by openapi-typescript.
 * Run "npm run typegen" to regenerate.
 */

${astToString(ast)}
`;

  const outputPath = path.resolve(
    process.cwd(),
    "src/generated/api-schema.d.ts"
  );
  fs.writeFileSync(outputPath, tsContent, "utf-8");
  console.log(`Successfully generated ${outputPath}`);
}

generate().catch((err) => {
  console.error("Error generating API types:", err);
  process.exit(1);
});
