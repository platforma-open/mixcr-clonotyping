import { describe, expect, test } from "vitest";
import { dropEmptyOverrides, parseGrant, parseHeapBytes } from "./step-resources";

describe("parseGrant", () => {
  test("reads the grant out of the line the JVM echoes", () => {
    const line =
      "Picked up JAVA_TOOL_OPTIONS: -Dplatforma.grant=[==RESOURCES==]cpu=24;ramMiB=38912 -XX:+PrintCommandLineFlags";
    expect(parseGrant(line)).toEqual({ cpu: 24, ramMiB: 38912 });
  });
  test("returns undefined with no line, or an unfilled one", () => {
    expect(parseGrant(undefined)).toBeUndefined();
    expect(parseGrant("[==RESOURCES==]cpu={system.cpu};ramMiB=1")).toBeUndefined();
  });
});

describe("parseHeapBytes", () => {
  test("reads MaxHeapSize", () => {
    expect(parseHeapBytes("-XX:InitialHeapSize=1 -XX:MaxHeapSize=34359738368 -XX:+UseG1GC")).toBe(
      34359738368,
    );
    expect(parseHeapBytes(undefined)).toBeUndefined();
  });
});

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
