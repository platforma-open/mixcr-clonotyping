import { assertParamsObject } from "@platforma-sdk/block-kind";
import {
  isImportFileHandleIndex,
  isPlRef,
  type ImportFileHandle,
  type ImportFileHandleIndex,
} from "@platforma-sdk/model";
import { isBoolean, isPlainObject, isString } from "es-toolkit";
import type {
  BlockParams,
  CloneClusteringMode,
  Preset,
  RunMode,
  StopCodonReplacements,
  StopCodonType,
} from "./types";

/**
 * The contract at runtime, for params that arrive from a template file rather
 * than from typed code.
 *
 * Each field the contract names is read and checked; a key it does not name is
 * dropped by never being read, so it needs no rejection here. Params written
 * against a different version of the contract are caught by the version in the
 * template entry's `{name}@{selector}` reference, not by a key-set check.
 */
export function parseInitializationParams(value: unknown): BlockParams {
  assertParamsObject(value);

  const params: Record<string, unknown> = {};
  for (const [field, { is, must }] of Object.entries(CONTRACT)) {
    const raw = value[field];
    if (raw === undefined) continue;
    if (!is(raw)) throw new Error(`'${field}' must be ${must}.`);
    params[field] = raw;
  }
  // Every value placed here passed its own field's guard, and `CONTRACT` is
  // proven exhaustive over `BlockParams` by the `satisfies` below.
  return params as BlockParams;
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

type Guard<T> = (value: unknown) => value is T;

/** A guard plus how to finish the sentence "'field' must be …". */
type Check<T> = { readonly is: Guard<T>; readonly must: string };

function check<T>(is: Guard<T>, must: string): Check<T> {
  return { is, must };
}

/** `Number.isInteger` already rejects non-numbers; this only adds the narrowing. */
const isInteger: Guard<number> = (v): v is number => Number.isInteger(v);

function oneOf<T extends string>(...allowed: readonly T[]): Guard<T> {
  return (v): v is T => allowed.includes(v as T);
}

function arrayOf<T>(item: Guard<T>): Guard<T[]> {
  return (v): v is T[] => Array.isArray(v) && v.every((e) => item(e));
}

/**
 * `isImportFileHandleIndex` is a prefix test, so handing it a checked string is
 * safe; the cast only gets the string past a signature that expects the union.
 */
const isIndexFileHandle: Guard<ImportFileHandleIndex> = (v): v is ImportFileHandleIndex =>
  isString(v) && isImportFileHandleIndex(v as ImportFileHandle);

const STOP_CODON_TYPES = ["amber", "ochre", "opal"] as const;

const isPreset: Guard<Preset> = (v): v is Preset =>
  isPlainObject(v) &&
  (v.type === "name" ? isString(v.name) : v.type === "file" && isIndexFileHandle(v.file));

const isStopCodonReplacements: Guard<StopCodonReplacements> = (v): v is StopCodonReplacements =>
  isPlainObject(v) && STOP_CODON_TYPES.every((k) => v[k] === undefined || isString(v[k]));

const REF = "a reference to another block's output";
const INDEX_HANDLE =
  "an 'index://' file handle — an 'upload://' handle names a local import and does not resolve on another machine";

/**
 * The contract, field by field, at runtime.
 *
 * The `satisfies` clause is the drift guard: it demands an entry for every key
 * `BlockParams` declares, and types each guard against that key's own type. Add
 * a field to the contract and this stops compiling until the check exists —
 * which matters here because every field is optional, so a parser that simply
 * forgot one would otherwise return a valid `BlockParams` and say nothing.
 */
const CONTRACT = {
  input: check(isPlRef, REF),
  inputLibrary: check(isPlRef, REF),
  libraryFile: check(isIndexFileHandle, INDEX_HANDLE),
  isLibraryFileGzipped: check(isBoolean, "a boolean"),

  preset: check(isPreset, "{ type: 'name', name } or { type: 'file', file }"),
  presetCommonName: check(isString, "a string"),
  isGenericPreset: check(isBoolean, "a boolean"),
  species: check(isString, "a string"),
  customSpecies: check(isString, "a string"),
  materialType: check(isString, "a string"),
  leftAlignmentMode: check(isString, "a string"),
  rightAlignmentMode: check(isString, "a string"),
  tagPattern: check(isString, "a string"),
  assembleClonesBy: check(isString, "a string"),
  imputeGermline: check(isBoolean, "a boolean"),
  chains: check(arrayOf(isString), "an array of strings"),
  scHeavyOnly: check(isBoolean, "a boolean"),
  cloneClusteringMode: check(
    oneOf<CloneClusteringMode>("relaxed", "default", "off"),
    "one of: relaxed, default, off",
  ),
  exportMinQuality: check(isBoolean, "a boolean"),
  stopCodonTypes: check(
    arrayOf(oneOf<StopCodonType>(...STOP_CODON_TYPES)),
    "an array of: amber, ochre, opal",
  ),
  stopCodonReplacements: check(
    isStopCodonReplacements,
    "an object of optional amber / ochre / opal strings",
  ),

  runMode: check(oneOf<RunMode>("dry", "full"), "one of: dry, full"),
  limitInput: check(isInteger, "an integer"),
  perProcessMemGB: check(isInteger, "an integer"),
  perProcessCPUs: check(isInteger, "an integer"),

  defaultBlockLabel: check(isString, "a string"),
  customBlockLabel: check(isString, "a string"),
  title: check(isString, "a string"),
} satisfies { [K in keyof BlockParams]-?: Check<NonNullable<BlockParams[K]>> };
