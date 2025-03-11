import { ProgressPattern } from '@platforma-open/milaboratories.mixcr-clonotyping-2.model';

type ParsedProgress = {
  raw?: string;
  stage?: string;
  percentage?: string;
  eta?: string;
  etaLabel?: string;
};

// Progress string examples:
// 'Final sorting: 95.2%'
// 'Building pre-clones from tag groups: 92.9%  ETA: 00:00:00'
// 'Initialization: progress unknown'
// 'Applying correction & sorting alignments by UMI'
// 'Alignment: 60.4%  ETA: 00:00:01'
// 'Exporting clones: 11.1%'
// 'Queued'
// 'Done'
export function parseProgressString(progressString: string | undefined | null): ParsedProgress {
  const raw = progressString ?? 'Unknown';

  const res: ParsedProgress = {
    raw,
  };

  if (!raw) {
    return res;
  }

  const match = raw.match(ProgressPattern);

  if (match) {
    const { stage, progress, eta } = match.groups!;
    res.stage = stage;
    res.percentage = progress;
    res.eta = eta;
  } else {
    res.stage = raw;
  }

  if (res.eta) {
    res.etaLabel = `ETA: ${res.eta}`;
  }

  return res;
}
