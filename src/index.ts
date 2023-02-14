import type { Blob, Patch, PatchSet, Replace } from './types';

export function collectPatchesForBlob(
  accumulator: Patch[][],
  blob: Blob,
  replacements: Replace[]
): void {
  const { content } = blob;
  for (let charIdx = 0; charIdx < content.length; charIdx += 1) {
    const contentSlice = content.slice(charIdx);
    for (let replIdx = 0; replIdx < replacements.length; replIdx += 1) {
      const replace: Replace = replacements[replIdx]!;
      if (contentSlice.startsWith(replace.from)) {
        const patch: Patch = Object.freeze({
          blob: blob.key,
          start: charIdx,
          end: charIdx + replace.from.length,
          from: replace.from,
          to: replace.to,
        });
        accumulator[replIdx]!.push(patch);
      }
    }
  }
}

export function getAllPatches(
  blobs: Blob[],
  replacements: Replace[]
): Patch[][] {
  const replaceKeyToPatches = Array.from<Replace, Patch[]>(
    replacements,
    () => []
  );
  for (const content of blobs) {
    collectPatchesForBlob(replaceKeyToPatches, content, replacements);
  }
  return replaceKeyToPatches;
}

export function getWeight(patchSet: PatchSet): number {
  let result = 0;

  let minOffset = 0;
  let maxOffset = 0;

  for (const patches of Object.values(patchSet)) {
    for (const patch of patches) {
      minOffset = Math.min(minOffset, patch.start);
      maxOffset = Math.max(maxOffset, patch.end);
    }

    result += maxOffset - minOffset;
  }

  return result;
}

function makePatchSet(patches: Patch[]): PatchSet {
  const result: PatchSet = {};

  for (const patch of patches) {
    result[patch.blob] ??= [];
    result[patch.blob]!.push(patch);
  }

  for (const patches of Object.values(result)) {
    patches.sort((a, b) => a.start - b.start);
  }

  return result;
}

export function generatePatchSets(
  blobs: Blob[],
  replacements: Replace[]
): PatchSet[] {
  const result: PatchSet[] = [];

  const registry = getAllPatches(blobs, replacements);

  const patchIndices = Array<number>(registry.length).fill(0);
  const patchMaxIndices = registry.map((patches) => patches.length);

  let stop = false;
  while (!stop) {
    const patches = patchIndices.map((idx, i) => registry[i]![idx]!);
    result.push(makePatchSet(patches));

    stop = true;
    for (let idx = 0; idx < patchIndices.length; idx += 1) {
      const patchIndex = patchIndices[idx]!;
      const patchMaxIndex = patchMaxIndices[idx]!;

      if (patchIndex < patchMaxIndex - 1) {
        patchIndices[idx] += 1;
        stop = false;
        break;
      }

      patchIndices[idx] = 0;
    }
  }

  return result;
}
