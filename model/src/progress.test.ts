import { test } from 'vitest';
import { ProgressPattern } from './progress';

test.for([
  {
    input: 'Applying correction & sorting alignments by UMI: 0%',
    expected: {
      stage: 'Applying correction & sorting alignments by UMI',
      progress: '0',
      eta: undefined,
    },
  },
  {
    input: 'Alignment: 0%',
    expected: {
      stage: 'Alignment',
      progress: '0',
      eta: undefined,
    },
  },
  {
    input: 'Alignment: 60.4%  ETA: 00:00:01',
    expected: {
      stage: 'Alignment',
      progress: '60.4',
      eta: '00:00:01',
    },
  },
  {
    input: 'Alignment: 100%  ETA: 00:00:00',
    expected: {
      stage: 'Alignment',
      progress: '100',
      eta: '00:00:00',
    },
  },
  {
    input: 'Final sorting: 95.2%',
    expected: {
      stage: 'Final sorting',
      progress: '95.2',
      eta: undefined,
    },
  },
  {
    input: 'Initialization: progress unknown',
    expected: {
      stage: 'Initialization',
      progress: undefined,
      eta: undefined,
    },
  },
])('parsing progress for: $input', ({ input, expected }, { expect }) => {
  const match = input.match(ProgressPattern);
  expect(match).toBeDefined();
  if (!match) throw Error('Match expected');
  const { stage, progress, eta } = match.groups!;
  expect({ stage, progress, eta }).toMatchObject(expected);
});
