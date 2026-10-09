import { describe, expect, test } from "vitest";
import { dropEmptyOverrides } from "./step-resources";

describe("dropEmptyOverrides", () => {
  test("drops unset fields and empty steps", () => {
    expect(
      dropEmptyOverrides({ assemble: { memFloor: 32, memSlope: undefined }, align: {} }),
    ).toEqual({
      assemble: { memFloor: 32 },
    });
    expect(dropEmptyOverrides({ align: { memFloor: undefined } })).toBeUndefined();
  });
});
