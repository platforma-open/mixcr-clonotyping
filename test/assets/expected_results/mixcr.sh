#!/bin/bash

set -e

mixcr exportPreset --preset-name milab-human-dna-xcr-7genes-multiplex -f preset.json

# --add-step assembleContigs 
mixcr analyze milab-human-dna-xcr-7genes-multiplex -f ../small_data_R1.fastq.gz ../small_data_R2.fastq.gz result > log.txt
