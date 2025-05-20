import csv
import pandas as pd
import json
import argparse
import hashlib
import base64


def load_and_reformat_data(file_path, chain):
    # Read the TSV file
    df = pd.read_csv(file_path, sep="\t")

    # If the input file is empty (only headers), return an empty DataFrame
    # with the expected output columns
    if df.empty:
        return pd.DataFrame(columns=["cellTag_str", f"clonotypeKey{chain}1", f"clonotypeKey{chain}2", "sampleId"])

    # Convert cellTag from JSON string to Python object
    df["cellTag"] = df["cellTag"].apply(lambda x: json.loads(x) if pd.notna(x) else [])

    # Convert clonotypeKey from a JSON string to a Python object (or empty list if missing)
    df["clonotypeKey"] = df["clonotypeKey"].apply(lambda x: json.loads(x) if pd.notna(x) else [])

    # Extract sample_id from cellTag JSON
    df["sampleId"] = df["cellTag"].apply(lambda x: x[1] if isinstance(x, list) and len(x) > 1 else "")

    # Convert cellTag back to string for sorting (avoids unhashable type error)
    df["cellTag_str"] = df["cellTag"].apply(lambda x: json.dumps(x, separators=(',', ':')))

    # Sort by sample_id, cellTag (string) and descending readCount
    df.sort_values(["sampleId", "cellTag_str", "readCount"], ascending=[True, True, False], inplace=True)

    # Create a rank within each cellTag group (1 = highest readCount, 2 = second highest)
    df["rank"] = df.groupby("cellTag_str").cumcount() + 1

    # Keep only the top two rows per cellTag
    top2 = df[df["rank"] <= 2].copy()

    # Convert clonotypeKey back to a JSON string
    top2["clonotypeKey"] = top2["clonotypeKey"].apply(json.dumps, separators=(',', ':'))

    # Preserve sample_id before pivoting
    top2_sample_ids = top2.groupby("cellTag_str")["sampleId"].first().reset_index()

    # Pivot the DataFrame so that each rank becomes its own column
    pivoted = top2.pivot(index="cellTag_str", columns="rank", values="clonotypeKey").reset_index()

    # Merge sample_id back in
    pivoted = pd.merge(pivoted, top2_sample_ids, on="cellTag_str", how="left")

    # Rename the pivoted columns
    pivoted = pivoted.rename(columns={
        1: f"clonotypeKey{chain}1",
        2: f"clonotypeKey{chain}2"
    })

    # Ensure second clonotype column exists and fill with "NA" if missing
    if f"clonotypeKey{chain}2" not in pivoted.columns:
        pivoted[f"clonotypeKey{chain}2"] = "NA"
    else:
        pivoted[f"clonotypeKey{chain}2"] = pivoted[f"clonotypeKey{chain}2"].fillna("NA")

    return pivoted

def merge_and_group(chainA_df, chainB_df):
    merged_df = pd.merge(chainA_df, chainB_df, on="cellTag_str", how="outer", suffixes=("_A", "_B"))

    # Choose sample_id from A (or B), assuming they're the same or A takes precedence
    merged_df["sampleId"] = merged_df["sampleId_A"].combine_first(merged_df["sampleId_B"])

    # Drop the old sampleId columns if no longer needed
    merged_df.drop(columns=["sampleId_A", "sampleId_B"], inplace=True)

    # Fill NaN values with "NA" for consistency
    merged_df.fillna(
        value={"clonotypeKeyA1": "NA", "clonotypeKeyA2": "NA", "clonotypeKeyB1": "NA", "clonotypeKeyB2": "NA"},
        inplace=True)

    # Create a unique group id (scClonotypeKey) based on clonotype keys
    merged_df["scClonotypeKey"] = merged_df.groupby([
        merged_df["clonotypeKeyA1"],
        merged_df["clonotypeKeyA2"],
        merged_df["clonotypeKeyB1"],
        merged_df["clonotypeKeyB2"]
    ], dropna=False).ngroup()

    # @TODO: normal way in future
    merged_df['clonotypeKeyLabel'] = merged_df['scClonotypeKey'].apply(
        lambda x: base64.b32encode(bytes.fromhex(hashlib.sha256(str(x).encode()).hexdigest()[:24])).decode('utf-8')
    )
    merged_df["clonotypeKeyLabel"] = "C-" + merged_df["clonotypeKeyLabel"].str[:6]

    return merged_df

def save_results(merged_df, output_clonotype_file, output_cell_file, args):
    # Calculate number of samples per scClonotypeKey
    sample_counts = merged_df.groupby("scClonotypeKey")["sampleId"].nunique().reset_index()
    sample_counts.rename(columns={"sampleId": "sampleCount"}, inplace=True)

    clonotype_records = merged_df[
        ["scClonotypeKey", "clonotypeKeyLabel", "clonotypeKeyA1", "clonotypeKeyA2", "clonotypeKeyB1", "clonotypeKeyB2"]
    ].drop_duplicates()

    # Merge the sample counts into clonotype records
    clonotype_records = pd.merge(clonotype_records, sample_counts, on="scClonotypeKey", how="left")

    # Count cells by scClonotypeKey and sample_id
    cell_counts = merged_df.groupby(["scClonotypeKey", "sampleId"]).size().reset_index(name="count")

    # Reorder columns as requested and rename
    cell_counts = cell_counts[["sampleId", "scClonotypeKey", "count"]]
    cell_counts = cell_counts.rename(columns={"count": "uniqueCellCount"})
    cell_counts["uniqueCellFraction"] = cell_counts.groupby("sampleId")["uniqueCellCount"].transform(lambda x: x / x.sum())

    # Apply filtering if the flag is set
    if args.only_full_clonotypes:
        # Keep only clonotypes where both primary chains are present ("NA" indicates absence)
        clonotype_records = clonotype_records[
            (clonotype_records["clonotypeKeyA1"] != "NA") &
            (clonotype_records["clonotypeKeyB1"] != "NA")
        ]
        # Filter cell_counts to only include scClonotypeKeys present in the filtered clonotype_records
        valid_sc_clonotype_keys = clonotype_records["scClonotypeKey"].unique()
        cell_counts = cell_counts[cell_counts["scClonotypeKey"].isin(valid_sc_clonotype_keys)]

    # Save to files
    clonotype_records.to_csv(output_clonotype_file, sep="\t", index=False, quoting=csv.QUOTE_NONE)
    cell_counts.to_csv(output_cell_file, sep="\t", index=False, quoting=csv.QUOTE_NONE)

def main():
    parser = argparse.ArgumentParser(description="Group VDJ 10x single cell data")
    parser.add_argument("--chainA", required=True, help="Path to the Chain A input file")
    parser.add_argument("--chainB", required=True, help="Path to the Chain B input file")
    parser.add_argument("--output_clonotypes", required=True, help="Path to output clonotypes file")
    parser.add_argument("--output_cells", required=True, help="Path to output cell tags file")
    parser.add_argument("--only_full_clonotypes", action="store_true", help="Output only clonotypes with both primary chains defined")
    args = parser.parse_args()

    chainA_df = load_and_reformat_data(args.chainA, "A")
    chainB_df = load_and_reformat_data(args.chainB, "B")

    # If both input tables are empty (only headers), output empty tables (only headers)
    if chainA_df.empty and chainB_df.empty:
        clonotype_columns = ["scClonotypeKey", "clonotypeKeyLabel", "clonotypeKeyA1", "clonotypeKeyA2", "clonotypeKeyB1", "clonotypeKeyB2", "sampleCount"]
        cell_columns = ["sampleId", "scClonotypeKey", "uniqueCellCount", "uniqueCellFraction"]
        pd.DataFrame(columns=clonotype_columns).to_csv(args.output_clonotypes, sep="\t", index=False, quoting=csv.QUOTE_NONE)
        pd.DataFrame(columns=cell_columns).to_csv(args.output_cells, sep="\t", index=False, quoting=csv.QUOTE_NONE)
        return

    merged_df = merge_and_group(chainA_df, chainB_df)
    save_results(merged_df, args.output_clonotypes, args.output_cells, args)

if __name__ == "__main__":
    main()