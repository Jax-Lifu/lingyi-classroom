export interface NumberPictograph {
  amount: number;
  mnemonic?: string;
  tint: string;
  image: string;
}

const singlePictographs: readonly NumberPictograph[] = [
  { amount: 0, mnemonic: "像鸡蛋", tint: "#fbf3df", image: "art/numbers/num-0.webp" },
  { amount: 1, mnemonic: "像铅笔", tint: "#fcf4dc", image: "art/numbers/num-1.webp" },
  { amount: 2, mnemonic: "像小鸭", tint: "#f1f6ef", image: "art/numbers/num-2.webp" },
  { amount: 3, mnemonic: "像耳朵", tint: "#fcf1e4", image: "art/numbers/num-3.webp" },
  { amount: 4, mnemonic: "像小旗", tint: "#f8f3e8", image: "art/numbers/num-4.webp" },
  { amount: 5, mnemonic: "像秤钩", tint: "#f7f3df", image: "art/numbers/num-5.webp" },
  { amount: 6, mnemonic: "像哨子", tint: "#eff5ee", image: "art/numbers/num-6.webp" },
  { amount: 7, mnemonic: "像镰刀", tint: "#f2f5e4", image: "art/numbers/num-7.webp" },
  { amount: 8, mnemonic: "像葫芦", tint: "#fbf2dc", image: "art/numbers/num-8.webp" },
  { amount: 9, mnemonic: "像勺子", tint: "#f9f1e2", image: "art/numbers/num-9.webp" },
  { amount: 10, mnemonic: "铅笔和鸡蛋", tint: "#f9f3e0", image: "art/numbers/num-10.webp" },
];

const pairedPictographs: readonly NumberPictograph[] = Array.from(
  { length: 10 },
  (_, index) => {
    const amount = 11 + index;
    return {
      amount,
      tint: "#faf4e2",
      image: `art/numbers/num-${amount}.webp`,
    };
  },
);

export const numberPictographs: Readonly<Record<number, NumberPictograph>> =
  Object.fromEntries(
    [...singlePictographs, ...pairedPictographs].map((entry) => [
      entry.amount,
      entry,
    ]),
  );

export function numberPictographFor(
  amount: number,
): NumberPictograph | undefined {
  return numberPictographs[amount];
}
