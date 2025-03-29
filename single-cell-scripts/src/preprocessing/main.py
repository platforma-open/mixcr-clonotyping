import os
import json
import pandas as pd
import argparse

def main(files, output_chainA, output_chainB):
    # Initialize lists to collect rows for final DataFrames
    data_a = []
    data_b = []

    for file_path in files:
        filename = os.path.basename(file_path)
        parts = filename.split("_")
        if len(parts) < 4:
            continue  # skip invalid file names
        chain = parts[2]
        sample_id = parts[3].replace(".tsv", "")

        df = pd.read_csv(file_path, sep="\t")

        # Filter productive CDR3
        df_filtered = df[df['isProductiveCDR3'] == True].copy()

        # Add sample_id to cellTag
        def modify_cell_tag(cell_tag):
            try:
                tag_list = json.loads(cell_tag)
                tag_list.append(sample_id)
                return json.dumps(tag_list)
            except Exception:
                return json.dumps([sample_id])

        df_filtered['cellTag'] = df_filtered['cellTag'].apply(modify_cell_tag)

        # Keep only required columns
        df_filtered = df_filtered[['cellTag', 'clonotypeKey', 'readCount']]

        # Add to the respective list
        if chain == 'a':
            data_a.append(df_filtered)
        elif chain == 'b':
            data_b.append(df_filtered)

    # Concatenate all and reset index
    final_a = pd.concat(data_a, ignore_index=True) if data_a else pd.DataFrame(columns=["cellTag", "clonotypeKey", "readCount"])
    final_b = pd.concat(data_b, ignore_index=True) if data_b else pd.DataFrame(columns=["cellTag", "clonotypeKey", "readCount"])

    # Save
    final_a.to_csv(output_chainA, sep="\t", index=False)
    final_b.to_csv(output_chainB, sep="\t", index=False)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Process specific by_cell_*.tsv files for productive CDR3 filtering.")
    parser.add_argument(
        'files',
        nargs='+',
        help="List of input by_cell_*.tsv files"
    )
    parser.add_argument("--output_chainA", required=True, help="Path to the Chain A output file")
    parser.add_argument("--output_chainB", required=True, help="Path to the Chain B output file")
    args = parser.parse_args()
    main(args.files, args.output_chainA, args.output_chainB)