#!/bin/bash

set -e

mixcr listPresetSpecificationsForUI presets.json

mixcr exportPreset --preset-name milab-human-dna-xcr-7genes-multiplex -f preset-7genes.json
mixcr presetSpecificationsForBack preset-7genes.json preset-7genes-ui.json

mixcr exportPreset --preset-name 10x-sc-5gex --species hsa -f preset-10x-5gex.json
mixcr presetSpecificationsForBack preset-10x-5gex.json preset-10x-5gex-ui.json

mixcr exportPreset --preset-name 10x-sc-xcr-vdj --species hsa -f preset-10x-vdj.json
mixcr presetSpecificationsForBack preset-10x-vdj.json preset-10x-vdj-ui.json

# --add-step assembleContigs 
mixcr analyze milab-human-dna-xcr-7genes-multiplex -f ../small_data_R1.fastq.gz ../small_data_R2.fastq.gz result > log.txt
