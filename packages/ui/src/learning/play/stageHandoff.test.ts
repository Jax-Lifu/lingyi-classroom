import { Texture } from "three";
import { expect, it, vi } from "vitest";
import { StageHandoff } from "./stageHandoff";

it("waits for the active backdrop and a live rendered frame; late loads cannot revive a failed canvas", () => {
  const show = vi.fn();
  const handoff = new StageHandoff(show);
  const gl = { isContextLost: () => false };
  const old = new Texture(), next = new Texture();
  handoff.useBackground(old);
  handoff.afterRender(gl);
  expect(show).not.toHaveBeenCalled();
  handoff.useBackground(next);
  old.image = { naturalWidth: 100 };
  handoff.afterRender(gl);
  expect(show).not.toHaveBeenCalled();
  next.image = { naturalWidth: 100 };
  handoff.afterRender({ isContextLost: () => true });
  expect(show).not.toHaveBeenCalled();
  handoff.afterRender(gl);
  handoff.afterRender(gl);
  expect(show.mock.calls).toEqual([[true]]);
  handoff.fail();
  handoff.afterRender(gl);
  expect(show.mock.calls).toEqual([[true], [false]]);
});
