# MiXCR Clonotyping

Extract TCR and BCR clonotypes from raw sequencing data. This Platforma block runs MiXCR end to end — alignment against germline gene databases, error correction, receptor assembly, and clonotype grouping — turning FASTQ into a quantified repertoire with full QC. It is the first analysis step in most immune repertoire projects.

Open-source analysis block for Platforma, the biologics discovery platform by MiLaboratories. For the full no-code workflow, see [platforma.bio](https://platforma.bio/).

## What it does

Reads coming off a sequencer are not clonotypes. Getting from one to the other means aligning each read to V, D, J, and C germline genes, correcting PCR and sequencing errors so artifacts are not counted as diversity, assembling the receptor sequence across reads, and grouping identical receptors into clonotypes with quantified abundance. MiXCR does all of that, and this block runs it inside Platforma with the results wired into every downstream analysis.

Configuration starts from a MiXCR preset matching your library chemistry, which sets sensible defaults for the whole pipeline. From there you specify what the data is: species, material type (DNA or RNA), which receptors to extract, and where your primers sit — the 5' and 3' boundary settings tell MiXCR which alignment edges are floating, which matters for correct assembly of primer-bounded amplicons.

You choose the feature clonotypes are assembled by, from CDR3 alone to the full variable region (FR1–FR4) or any range between. That choice propagates: assembling by CDR3 is faster and works with short amplicons, while assembling by the full region is what downstream mutation analysis and SHM tree building require.

UMIs and cell barcodes are extracted with a MiXCR tag pattern, so abundances can be counted per unique molecule rather than per read. Error correction strength is configurable. For display-derived libraries, stop codons can be translated as the residue your suppressor strain incorporates — amber, ochre, or opal, each with its own replacement — so those clonotypes are not discarded as non-productive. A custom reference library can be supplied from a file or from the [MiXCR Library Builder](https://github.com/platforma-open/mixcr-library-builder) block when germline references do not fit.

Results include a per-sample alignment summary that breaks failures down by cause, a QC report table across all samples, per-sample MiXCR reports and logs, and raw TSV export. Preview mode runs the configuration without processing everything, and a per-sample read limit lets you test settings quickly.

## Inputs & outputs

* **Input:** raw sequencing data from [Samples & Data](https://github.com/platforma-open/samples-and-data) — bulk, single-cell, RNA-seq, or Sanger — plus a MiXCR preset and library description.
* **Output:** a quantified clonotype dataset with per-sample abundances, V/D/J/C gene assignments, and region sequences, consumable by every downstream Platforma block; a QC report table; per-sample reports, logs, and alignment charts; raw TSV export.

## Specifications

| | |
|---|---|
| Block title in app | MiXCR Clonotyping |
| Engine | [MiXCR](https://mixcr.com/) — germline-database alignment, error correction, assembly, clonotyping |
| Data types | Bulk, single-cell, RNA-seq, Sanger |
| Species | Homo sapiens, Mus musculus, Alpaca, Lama glama, Macaca fascicularis, Macaca mulatta, Rabbit, Rat, Sheep, Chicken, Spalax |
| Material type | DNA or RNA |
| Assembling feature | CDR3, VDJRegion (FR1–FR4), or any range such as `CDR1–CDR3`, `FR2–FR4`, `FR3–CDR3` |
| Primer boundaries | Configurable 5' and 3' alignment boundaries, including C-primer libraries |
| UMI / barcodes | MiXCR tag pattern, for UMI-corrected abundances |
| Stop codon handling | Amber (TAG), Ochre (TAA), Opal/Umber (TGA), each with a configurable replacement residue |
| Reference library | Built-in germline references, or a custom library from file or MiXCR Library Builder |
| Other settings | Error correction strength, per-sample read limit, preview mode, per-sample memory and CPU |

## Use cases

* **Repertoire profiling:** quantify TCR or BCR clonotypes from bulk sequencing to characterize diversity and composition.
* **Single-cell VDJ:** extract paired-chain clonotypes from single-cell libraries.
* **Antibody discovery:** build the clonotype dataset that clustering, enrichment, developability, and lead selection all run on.
* **UMI-corrected quantification:** extract UMIs so clonotype frequencies reflect molecules rather than amplification.
* **Kit-based workflows:** start from the MiXCR preset matching your commercial kit rather than configuring the pipeline by hand.
* **Non-human species:** profile repertoires in mouse, alpaca, macaque, rabbit, rat, sheep, chicken, and more.
* **SHM lineage work:** assemble by the full variable region so [MiXCR SHM Trees](https://github.com/platforma-open/mixcr-shm-trees) can build lineage trees from the result.

## How it compares to other Platforma blocks

* **MiXCR Clonotyping** aligns to germline gene databases to discover clonotypes in natural repertoires.
* **[MiXCR Amplicon Alignment](https://github.com/platforma-open/mixcr-amplicon-alignment)** aligns to a reference construct you supply — for synthetic libraries built on a known scaffold.
* **[MiXCR scFv Alignment](https://github.com/platforma-open/mixcr-scfv-clonotyping)** handles scFv constructs where heavy and light chains sit in a single amplicon.
* **[Import V(D)J Data](https://github.com/platforma-open/import-vdj-data)** skips clonotyping entirely, loading clonotype tables produced elsewhere.

## FAQ

### Which preset should I use?

The one matching your library chemistry — commercial kits have named presets, and the preset sets defaults across the whole pipeline. Getting this right matters more than any individual setting, since it encodes the assumptions about how the library was built.

### Which assembling feature should I choose?

CDR3 is fastest and works with short amplicons, but limits downstream analysis. The full variable region (FR1–FR4) is required for mutation analysis, SHM tree building, humanness scoring, and structure prediction. If your amplicon covers the full region, assemble by it — several downstream blocks will otherwise reject the dataset.

### How do I get UMI-corrected counts?

Supply a MiXCR tag pattern describing where the UMI sits in your reads. Abundances are then counted per unique molecule instead of per read, which removes amplification bias. See the [MiXCR tag pattern reference](https://mixcr.com/mixcr/reference/ref-tag-pattern/).

### Why are there stop codon settings?

Display libraries are often propagated in suppressor strains that read a stop codon as an amino acid. Without this setting those clonotypes are discarded as non-productive. Selecting the codon and its replacement residue keeps them in the analysis.

### My alignment rate is low — what should I check?

The per-sample alignment summary breaks failures down by cause. Low scores or missing gene hits usually mean the preset, species, or primer boundaries do not match the library. Failures on "no barcode" point at a tag pattern that does not match the actual read layout.

### Can I use my own reference library?

Yes. Supply a custom library from a file, or build one with the MiXCR Library Builder block — useful for species or engineered constructs the built-in germline references do not cover.

### Do I need a MiXCR license?

Yes. MiXCR requires a license key, which is [free for academic scientists, PhD students, and non-profit R&D centers](https://platforma.bio/academic-access); commercial use requires a business license. Keys are available at [platforma.bio/getlicense](https://platforma.bio/getlicense).

## Citation

MiXCR is developed by MiLaboratories Inc. If you use this block in your research, please cite:

> Bolotin, D. A., Poslavsky, S., Mitrophanov, I., Shugay, M., Mamedov, I. Z., Putintseva, E. V., & Chudakov, D. M. (2015). MiXCR: software for comprehensive adaptive immunity profiling. *Nature Methods* **12**(5), 380–381. [https://doi.org/10.1038/nmeth.3364](https://doi.org/10.1038/nmeth.3364)

> Bolotin, D. A., Poslavsky, S., Davydov, A. N., et al. (2017). Antigen receptor repertoire profiling from RNA-seq data. *Nature Biotechnology* **35**(10), 908–911. [https://doi.org/10.1038/nbt.3979](https://doi.org/10.1038/nbt.3979)

## Part of the Platforma ecosystem

This block is part of [Platforma](https://platforma.bio/) by [MiLaboratories](https://github.com/milaboratory), built on [MiXCR](https://mixcr.com/). Explore the other open-source blocks at [github.com/platforma-open](https://github.com/platforma-open) and the docs for V(D)J analysis at [docs.platforma.bio/biology-guides/vdj-analysis](https://docs.platforma.bio/biology-guides/vdj-analysis/).
