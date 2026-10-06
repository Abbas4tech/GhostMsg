import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
// biome-ignore lint/style/noExportedImports: false
import { z } from "zod";

extendZodWithOpenApi(z);

export { z };
