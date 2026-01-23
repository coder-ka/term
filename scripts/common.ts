import estrella from "estrella";

export async function buildAll(
  { isNodeMode }: { isNodeMode: boolean } = { isNodeMode: false }
) {
  return Promise.all([
    estrella.build({
      entryPoints: ["./src/index.ts"],
      bundle: true,
      outfile: "./dist/index.cjs",
      platform: isNodeMode ? "node" : undefined,
      format: "cjs",
    }),
    estrella.build({
      entryPoints: ["./src/index.ts"],
      bundle: true,
      outfile: "./dist/index.mjs",
      platform: isNodeMode ? "node" : undefined,
      format: "esm",
    }),
    estrella.build({
      entryPoints: ["./src/bin.ts"],
      bundle: true,
      outfile: "./dist/bin.cjs",
      platform: isNodeMode ? "node" : undefined,
      format: "cjs",
    }),
  ]);
}
