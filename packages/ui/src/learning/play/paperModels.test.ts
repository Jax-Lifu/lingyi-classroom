import * as THREE from "three";
import { expect, it, vi } from "vitest";
import { createPaperActor, makePaperMaterials, projectActorLabel } from "./paperModels";
import { actor } from "./types";

it("anchors single and double digits to the projected sign face as the camera and scale change", () => {
  const ctx = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  const kit = makePaperMaterials();
  try {
    for (const [label, size] of [["2", 1], ["10", 2]] as const) {
      const model = createPaperActor(actor("tag-" + label, "sign", 21, 83, 18, { label }), kit, vi.fn(), vi.fn());
      const camera = new THREE.OrthographicCamera(-2, 2, 2, -2, .1, 100);
      camera.position.set(0, .8, 8);
      camera.lookAt(0, 0, 0);
      camera.updateMatrixWorld();
      model.root.scale.setScalar(size);
      model.root.rotation.y = .1;
      model.root.updateMatrixWorld(true);
      const pos = new THREE.Vector3();
      const height = projectActorLabel(model, camera, 400, pos, new THREE.Vector3())!;
      const top = model.signFace!.localToWorld(new THREE.Vector3(0, .5, .5)).project(camera);
      const bottom = model.signFace!.localToWorld(new THREE.Vector3(0, -.5, .5)).project(camera);
      expect(pos.y).toBeCloseTo((top.y + bottom.y) / 2);
      expect(height).toBeCloseTo((top.y - bottom.y) * 200);
      expect(pos.y).toBeGreaterThan(model.pose.getWorldPosition(new THREE.Vector3()).project(camera).y);
      model.dispose();
    }
  } finally {
    kit.dispose();
    ctx.mockRestore();
  }
});
