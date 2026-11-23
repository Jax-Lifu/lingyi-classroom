/** Relative weights in the story: different cargoes can bring the same hull back to its mark. */
export const elephantWeight = 6;
export const stoneWeights = [1, 2, 3] as const;
export type StoneWeight = (typeof stoneWeights)[number];

export function cargoWeight(stones: readonly StoneWeight[]): number {
  return stones.reduce<number>((sum, stone) => sum + stone, 0);
}

export function cargoArrangement(stones: readonly StoneWeight[]): string {
  return [...stones].sort((a, b) => a - b).join("+");
}
