import type { NumberPictograph } from "@lingyi-classroom/content/number-pictographs";

/** Static pictographic watercolor backdrop used on number cards in the child catalog. */
export function NumberCardBackdrop({
  art,
  eager = false,
}: {
  art: NumberPictograph;
  eager?: boolean;
}) {
  return (
    <span className="number-card-scene" aria-hidden="true">
      <img
        className="number-card-bg"
        src={"./" + art.image}
        loading={eager ? undefined : "lazy"}
        decoding="async"
        alt=""
      />
    </span>
  );
}
