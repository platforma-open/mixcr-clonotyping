import argparse
import sys
from typing import List, Tuple

import polars as pl
import polars_hash as plh  # Assuming polars_hash registers extensions automatically


def parse_calculate_args(calculate_args: List[List[str]]) -> List[Tuple[List[str], str]]:
    """Parses the --calculate arguments into a list of (input_cols, output_col) tuples."""
    calculations = []
    all_output_names = set()
    for i, calc_arg in enumerate(calculate_args):
        if len(calc_arg) < 2:
            print(
                f"Error: --calculate argument #{i+1} must have at least one input column and one output column name. Got: {calc_arg}",
                file=sys.stderr,
            )
            sys.exit(1)
        output_name = calc_arg[-1]
        input_names = calc_arg[:-1]
        if not input_names:
            print(
                f"Error: --calculate argument #{i+1} must have at least one input column. Got: {calc_arg}",
                file=sys.stderr,
            )
            sys.exit(1)
        if output_name in all_output_names:
            print(
                f"Error: Duplicate output column name '{output_name}' specified in --calculate arguments.",
                file=sys.stderr,
            )
            sys.exit(1)
        all_output_names.add(output_name)
        calculations.append((input_names, output_name))
    return calculations


def main():
    parser = argparse.ArgumentParser(
        description="Add one or more hash columns to a TSV table based on selected columns."
    )
    parser.add_argument(
        "--input-table", required=True, help="Path to the input TSV file."
    )
    parser.add_argument(
        "--output-table", required=True, help="Path to the output TSV file."
    )
    parser.add_argument(
        "--calculate",
        required=True,
        action="append",
        nargs="+",
        metavar=("INPUT_COL", "OUTPUT_COL"),
        help="Specify input columns and the output hash column name. \
              Example: --calculate col_a col_b hash_ab --calculate col_c hash_c. \
              Repeatable for multiple hash columns.",
    )
    parser.add_argument(
        "--delimiter",
        default="_",
        help="Delimiter to join column values before hashing (default: '_').",
    )
    parser.add_argument(
        "--hash-bytes",
        type=int,
        default=12, # Default to 12 bytes
        help="Number of bytes to take from the hash (entropy bytes). Output is Base64 encoded. 0 means use the full hash. (default: 12)",
    )

    args = parser.parse_args()

    # --- Parse Calculation Specs --- 
    try:
        calculation_specs = parse_calculate_args(args.calculate)
    except SystemExit:
        sys.exit(1) # Exit if parsing failed

    if args.hash_bytes < 0:
        print(f"Error: --hash-bytes cannot be negative. Got: {args.hash_bytes}", file=sys.stderr)
        sys.exit(1)
    
    sha256_byte_len = 32
    if args.hash_bytes > sha256_byte_len:
         print(f"Warning: --hash-bytes ({args.hash_bytes}) is greater than the full SHA256 hash length ({sha256_byte_len} bytes). Using the full hash.", file=sys.stderr)
         num_bytes_to_keep = sha256_byte_len
    elif args.hash_bytes == 0:
        num_bytes_to_keep = sha256_byte_len # Explicitly use full hash if 0
    else:
        num_bytes_to_keep = args.hash_bytes


    try:
        # --- Read Data ---
        # Read only the header first to check columns
        df = pl.read_csv(
            args.input_table,
            separator="\t",
            has_header=True,
            infer_schema=False
        )

        # --- Column and Output Name Validation ---
        all_input_columns_needed = set()
        all_output_columns_to_create = set()
        for input_cols, output_name in calculation_specs:
            all_input_columns_needed.update(input_cols)
            if output_name in df.columns:
                 print(
                    f"Warning: Output column '{output_name}' specified in --calculate already exists in the input table. It will be overwritten.",
                    file=sys.stderr,
                )
            # Check for duplicates between generated output names was done in parse_calculate_args
            all_output_columns_to_create.add(output_name)

        missing_input_cols = list(all_input_columns_needed - set(df.columns))
        if missing_input_cols:
            print(
                f"Error: The following input columns required by --calculate arguments were not found in the table '{args.input_table}': {', '.join(sorted(missing_input_cols))}",
                file=sys.stderr,
            )
            sys.exit(1)

        # --- Hashing Logic --- 
        hash_expressions = []
        for input_cols, output_name in calculation_specs:

            # Concatenate specified columns for this calculation, filling nulls with empty strings
            concat_expr = pl.concat_str(
                [pl.col(c).fill_null("") for c in input_cols], separator=args.delimiter
            )

            # Calculate SHA256 hash (returns hex string)
            hash_hex_expr = concat_expr.chash.sha2_256()

            if 0 < num_bytes_to_keep < sha256_byte_len:
                hash_truncated_expr = hash_hex_expr.str.slice(0, length=num_bytes_to_keep * 2)
            else:
                hash_truncated_expr = hash_hex_expr

            hash_base64_expr = hash_truncated_expr.str.decode('hex').bin.encode('base64')

            # Add the aliased expression to the list
            hash_expressions.append(hash_base64_expr.alias(output_name))


        # --- Add Columns and Write Output ---
        df_out = df.with_columns(hash_expressions)

        df_out.write_csv(args.output_table, separator="\t", include_header=True)

        print(f"Successfully processed '{args.input_table}' and saved result to '{args.output_table}'.")

    except pl.exceptions.ComputeError as e:
        print(f"Polars computation error: {e}", file=sys.stderr)
        sys.exit(1)
    except FileNotFoundError:
        print(f"Error: Input file not found: '{args.input_table}'", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"An unexpected error occurred: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
