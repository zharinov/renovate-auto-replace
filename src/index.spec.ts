import { generatePatchSets, getAllPatches } from './index';
import type { Blob, Replace } from './types';

describe('getAllPatches', () => {
  it('extracts all patches', () => {
    const blobs: Blob[] = [
      { key: 'file-1', content: 'foobar' },
      { key: 'file-2', content: 'barbaz' },
    ];

    const replacements: Replace[] = [
      { key: 'foo', from: 'foo', to: 'FOO' },
      { key: 'bar', from: 'bar', to: 'BAR' },
      { key: 'baz', from: 'baz', to: 'BAZ' },
    ];

    const res = getAllPatches(blobs, replacements);

    expect(res).toEqual([
      [{ blob: 'file-1', from: 'foo', to: 'FOO', start: 0, end: 3 }],
      [
        { blob: 'file-1', from: 'bar', to: 'BAR', start: 3, end: 6 },
        { blob: 'file-2', from: 'bar', to: 'BAR', start: 0, end: 3 },
      ],
      [{ blob: 'file-2', from: 'baz', to: 'BAZ', start: 3, end: 6 }],
    ]);
  });
});

describe('generatePatchSets', () => {
  it('generates patch sets', () => {
    const blobs: Blob[] = [
      { key: 'file-1', content: 'foobar' },
      { key: 'file-2', content: 'barbaz' },
    ];

    const replacements: Replace[] = [
      { key: 'foo', from: 'foo', to: 'FOO' },
      { key: 'bar', from: 'bar', to: 'BAR' },
      { key: 'baz', from: 'baz', to: 'BAZ' },
    ];

    const res = generatePatchSets(blobs, replacements);

    expect(res).toEqual([
      {
        'file-1': [
          { blob: 'file-1', from: 'foo', to: 'FOO', start: 0, end: 3 },
          { blob: 'file-1', from: 'bar', to: 'BAR', start: 3, end: 6 },
        ],
        'file-2': [
          { blob: 'file-2', from: 'baz', to: 'BAZ', start: 3, end: 6 },
        ],
      },
      {
        'file-1': [
          { blob: 'file-1', from: 'foo', to: 'FOO', start: 0, end: 3 },
        ],
        'file-2': [
          { blob: 'file-2', from: 'bar', to: 'BAR', start: 0, end: 3 },
          { blob: 'file-2', from: 'baz', to: 'BAZ', start: 3, end: 6 },
        ],
      },
    ]);
  });
});
