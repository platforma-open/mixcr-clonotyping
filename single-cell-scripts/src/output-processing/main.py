import pandas as pd
import argparse
import json
import os
import csv


def create_empty_mapping_dfs(main_df):
    """Create empty mapping DataFrames based on main_df to obtain expected headers"""
    mapping_a1 = main_df[['scClonotypeKey', 'clonotypeKeyA1']].rename(
        columns={'clonotypeKeyA1': 'clonotypeKey'}
    )
    mapping_a2 = main_df[['scClonotypeKey', 'clonotypeKeyA2']].rename(
        columns={'clonotypeKeyA2': 'clonotypeKey'}
    )
    mapping_b1 = main_df[['scClonotypeKey', 'clonotypeKeyB1']].rename(
        columns={'clonotypeKeyB1': 'clonotypeKey'}
    )
    mapping_b2 = main_df[['scClonotypeKey', 'clonotypeKeyB2']].rename(
        columns={'clonotypeKeyB2': 'clonotypeKey'}
    )
    return mapping_a1, mapping_a2, mapping_b1, mapping_b2


def create_mapping_dfs(main_df):
    """Create mapping DataFrames from main_df, dropping rows with missing keys"""
    mapping_a1 = main_df[['scClonotypeKey', 'clonotypeKeyA1']].rename(
        columns={'clonotypeKeyA1': 'clonotypeKey'}
    ).dropna()
    mapping_a2 = main_df[['scClonotypeKey', 'clonotypeKeyA2']].rename(
        columns={'clonotypeKeyA2': 'clonotypeKey'}
    ).dropna()
    mapping_b1 = main_df[['scClonotypeKey', 'clonotypeKeyB1']].rename(
        columns={'clonotypeKeyB1': 'clonotypeKey'}
    ).dropna()
    mapping_b2 = main_df[['scClonotypeKey', 'clonotypeKeyB2']].rename(
        columns={'clonotypeKeyB2': 'clonotypeKey'}
    ).dropna()
    return mapping_a1, mapping_a2, mapping_b1, mapping_b2


def save_results(a_result_1, a_result_2, b_result_1, b_result_2, args):
    """Save results to output files"""
    a_result_1.to_csv(args.output_A1, sep='\t', index=False, quoting=csv.QUOTE_NONE)
    a_result_2.to_csv(args.output_A2, sep='\t', index=False, quoting=csv.QUOTE_NONE)
    b_result_1.to_csv(args.output_B1, sep='\t', index=False, quoting=csv.QUOTE_NONE)
    b_result_2.to_csv(args.output_B2, sep='\t', index=False, quoting=csv.QUOTE_NONE)


def process_empty_tables(main_df, properties_a, properties_b, args):
    """Process case when all input tables are empty"""
    mapping_a1, mapping_a2, mapping_b1, mapping_b2 = create_empty_mapping_dfs(main_df)

    # Perform merge operations (they will yield empty DataFrames with the expected headers)
    a_result_1 = properties_a.merge(mapping_a1, on='clonotypeKey')
    a_result_2 = properties_a.merge(mapping_a2, on='clonotypeKey')
    b_result_1 = properties_b.merge(mapping_b1, on='clonotypeKey')
    b_result_2 = properties_b.merge(mapping_b2, on='clonotypeKey')

    save_results(a_result_1, a_result_2, b_result_1, b_result_2, args)


def process_non_empty_tables(main_df, properties_a, properties_b, args):
    """Process case when input tables contain data"""
    # Create mapping DataFrames from main_df
    mapping_a1, mapping_a2, mapping_b1, mapping_b2 = create_mapping_dfs(main_df)

    # Merge based on full clonotypeKey string
    a_result_1 = properties_a.merge(mapping_a1, on='clonotypeKey')
    a_result_2 = properties_a.merge(mapping_a2, on='clonotypeKey')
    b_result_1 = properties_b.merge(mapping_b1, on='clonotypeKey')
    b_result_2 = properties_b.merge(mapping_b2, on='clonotypeKey')

    save_results(a_result_1, a_result_2, b_result_1, b_result_2, args)


def main(args):
    """Main function to process input tables and generate output files"""
    # Load tables
    main_df = pd.read_csv(args.main_table, sep='\t', dtype=str)
    properties_a = pd.read_csv(args.properties_a, sep='\t', dtype=str)
    properties_b = pd.read_csv(args.properties_b, sep='\t', dtype=str)

    # Process based on whether tables are empty
    if main_df.empty and properties_a.empty and properties_b.empty:
        process_empty_tables(main_df, properties_a, properties_b, args)
    else:
        process_non_empty_tables(main_df, properties_a, properties_b, args)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Match clonotype keys and generate output tables."
    )

    parser.add_argument(
        "--main_table",
        required=True,
        help="Path to the main table file (TSV)."
    )
    parser.add_argument(
        "--properties_a",
        required=True,
        help="Path to properties_a.tsv."
    )
    parser.add_argument(
        "--properties_b",
        required=True,
        help="Path to properties_b.tsv."
    )
    parser.add_argument(
        "--output_A1",
        required=True,
        help="Save result for primary clones chain A."
    )
    parser.add_argument(
        "--output_A2",
        required=True,
        help="Save result for secondary clones chain A."
    )
    parser.add_argument(
        "--output_B1",
        required=True,
        help="Save result for primary clones chain B."
    )
    parser.add_argument(
        "--output_B2",
        required=True,
        help="Save result for secondary clones chain B."
    )

    args = parser.parse_args()
    main(args)