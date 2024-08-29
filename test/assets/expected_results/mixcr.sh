#!/bin/bash

set -e

mixcr exportPreset --preset-name milab-human-dna-xcr-7genes-multiplex preset.json
mixcr analyze milab-human-dna-xcr-7genes-multiplex ../small_data_R1.fastq.gz ../small_data_R2.fastq.gz result
