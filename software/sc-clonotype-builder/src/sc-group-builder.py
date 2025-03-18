import csv

import pandas as pd
import json
import argparse


def is_functional_cdr3(cdr3):
    # Check if CDR3 sequence is functional: No '*', '_', and must start with C.
    return isinstance(cdr3, str) and "*" not in cdr3 and "_" not in cdr3 and cdr3.startswith("C")


def load_and_reformat_data(file_path, chain):
    df = pd.read_csv(file_path, sep="\t")

    # Parse JSON fields and CDR3 aa sequence
    df["clonotypeKey"] = df["clonotypeKey"].apply(lambda x: json.loads(x) if pd.notna(x) else [])
    df["aaSeqCDR3"] = df["aaSeqCDR3"].apply(lambda x: x if pd.notna(x) else "")

    # Remove non-functional CDR3 sequences before grouping
    df = df[df["aaSeqCDR3"].apply(is_functional_cdr3)]

    # Expand to two clonotype columns per chain, keeping C gene for output
    df = df.groupby("cellTag")["clonotypeKey"].apply(list).reset_index()
    df[[f"clonotypeKey{chain}1", f"clonotypeKey{chain}2"]] = pd.DataFrame(
        df["clonotypeKey"].apply(
            lambda x: [json.dumps(i) if isinstance(i, list) and i else "NA" for i in (x + [[], []])[:2]]).tolist(),
        index=df.index
    )
    df.drop(columns=["clonotypeKey"], inplace=True)

    return df


def merge_and_group(chainA_df, chainB_df):
    merged_df = pd.merge(chainA_df, chainB_df, on="cellTag", how="outer")

    # Fill NaN values with "NA" for consistency
    merged_df.fillna(
        value={"clonotypeKeyA1": "NA", "clonotypeKeyA2": "NA", "clonotypeKeyB1": "NA", "clonotypeKeyB2": "NA"},
        inplace=True)

    # Create a unique group id (scClonotypeKey) based on clonotype keys without C gene
    merged_df["scClonotypeKey"] = merged_df.groupby([
        merged_df["clonotypeKeyA1"].apply(lambda x: tuple(json.loads(x)[:3]) if x != "NA" else "NA"),
        merged_df["clonotypeKeyA2"].apply(lambda x: tuple(json.loads(x)[:3]) if x != "NA" else "NA"),
        merged_df["clonotypeKeyB1"].apply(lambda x: tuple(json.loads(x)[:3]) if x != "NA" else "NA"),
        merged_df["clonotypeKeyB2"].apply(lambda x: tuple(json.loads(x)[:3]) if x != "NA" else "NA")
    ], dropna=False).ngroup()

    return merged_df


def save_results(merged_df, output_clonotype_file, output_cell_file):
    clonotype_records = merged_df[
        ["scClonotypeKey", "clonotypeKeyA1", "clonotypeKeyA2", "clonotypeKeyB1", "clonotypeKeyB2"]].drop_duplicates()

    cell_records = merged_df[["scClonotypeKey", "cellTag"]]

    clonotype_records.to_csv(output_clonotype_file, sep="\t", index=False, quoting=csv.QUOTE_NONE)
    cell_records.to_csv(output_cell_file, sep="\t", index=False, quoting=csv.QUOTE_NONE)


def main():
    parser = argparse.ArgumentParser(description="Group VDJ 10x single cell data")
    parser.add_argument("--chainA", required=True, help="Path to the Chain A input file")
    parser.add_argument("--chainB", required=True, help="Path to the Chain B input file")
    parser.add_argument("--output_clonotypes", required=True, help="Path to output clonotypes file")
    parser.add_argument("--output_cells", required=True, help="Path to output cell tags file")
    args = parser.parse_args()

    chainA_df = load_and_reformat_data(args.chainA, "A")
    chainB_df = load_and_reformat_data(args.chainB, "B")
    merged_df = merge_and_group(chainA_df, chainB_df)
    save_results(merged_df, args.output_clonotypes, args.output_cells)


if __name__ == "__main__":
    main()

