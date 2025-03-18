#!/usr/bin/env bash

python ../src/sc-group-builder.py --chainA chainA_test1.tsv --chainB chainB_test1.tsv --output_clonotype test1_clonotypes.tsv --output_cells test1_cellTag.tsv
python ../src/sc-group-builder.py --chainA chainA_test2.tsv --chainB chainB_test2.tsv --output_clonotype test2_clonotypes.tsv --output_cells test2_cellTag.tsv
python ../src/sc-group-builder.py --chainA chainA_test3.tsv --chainB chainB_test3.tsv --output_clonotype test3_clonotypes.tsv --output_cells test3_cellTag.tsv