export interface Blob {
  key: string;
  content: string;
}

export interface Replace {
  key: string;
  from: string;
  to: string;
}

export interface Patch {
  blob: Blob['key'];
  from: string;
  to: string;
  start: number;
  end: number;
}

export type PatchSet = Record<Blob['key'], Patch[]>;
