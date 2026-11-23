import data from "./data/play-strokes.json";
export interface StrokeGlyph {
  strokes: string[];
  medians: number[][][];
}
export const strokeGlyphs: Readonly<Record<string, StrokeGlyph>> = data;
