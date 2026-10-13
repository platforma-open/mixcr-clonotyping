import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

// A sample analysed before an update is recovered only while :mixcr-analyze keeps the identity
// of the published block (2.23.13): the same hash override and exactly the same declared
// outputs. A pure template locks its declared outputs before its body runs, and an output name
// with no stored result runs the body, so a fifth output re-runs every old sample even though
// the four old fields still read as recovered.
const PUBLISHED_HASH_OVERRIDE = "D70EDB25-6FF6-4615-966D-B79B04B5751C";
const PUBLISHED_OUTPUTS = ["qc", "reports", "log", "clns"];

function template(name: string): string {
  return readFileSync(new URL(`../../workflow/src/${name}.tpl.tengo`, import.meta.url), "utf8");
}

function declaredOutputs(source: string): string[] {
  const m = source.match(/self\.defineOutputs\(([^)]*)\)/);
  expect(m, "defineOutputs").not.toBeNull();
  return [...m![1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
}

function hashOverride(source: string): string | undefined {
  return source.match(/^\/\/tengo:hash_override (\S+)$/m)?.[1];
}

describe(":mixcr-analyze keeps the published analysis identity", () => {
  test("same hash override", () => {
    expect(hashOverride(template("mixcr-analyze"))).toEqual(PUBLISHED_HASH_OVERRIDE);
  });

  test("exactly the published outputs", () => {
    expect(declaredOutputs(template("mixcr-analyze"))).toEqual(PUBLISHED_OUTPUTS);
  });
});
