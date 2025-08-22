# Overview

This block analyzes sequencing data to identify and quantify the T-cell and B-cell receptor clonotypes in your samples. It is a crucial first step for many immunology studies, allowing to explore the diversity and composition of the adaptive immune system.

The block takes raw sequencing data (bulk, single cell, RNA-Seq, Sanger etc.) and uses the MiXCR tool to perform V(D)J clonotyping, which involves alignment, error correction, assembling the receptor gene sequences and grouping them into clonotypes.

The outputs dataset can then be used in downstream blocks for deeper analysis, such as comparing clonality metrics between sample groups, tracking clonotypes over time, or building a TCR/antibody lead list.

MiXCR is developed by MiLaboratories Inc. For more information, please see the [MiXCR website](https://mixcr.com/) and cite the following publication if you use this block in your research:

> Bolotin, D., Poslavsky, S., Mitrophanov, I. et al. MiXCR: software for comprehensive adaptive immunity profiling. _Nat Methods_ **12**, 380–381 (2015) [https://doi.org/10.1038/nmeth.3364](https://doi.org/10.1038/nmeth.3364)
