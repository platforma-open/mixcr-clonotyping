#!/bin/bash

pfconv importCsv \
       --params=../../../workflow/src/pvconf_params.json \
       --output=pframe \
       result.clones_TRA.tsv
