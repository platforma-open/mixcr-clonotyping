import { describe, expect, test } from "vitest";
import { kind } from "./index";

const parse = (params: unknown) => kind.parseInitializationParams(params);

describe("templates written by earlier versions of the kind", () => {
  test("a defaultBlockLabel key is ignored, not rejected", () => {
    const parsed = parse({
      chains: ["IG"],
      defaultBlockLabel: "Sample run 3 - IG",
      customBlockLabel: "My clonotyping",
    });
    expect(parsed).toEqual({ chains: ["IG"], customBlockLabel: "My clonotyping" });
    expect(parsed).not.toHaveProperty("defaultBlockLabel");
  });
});
