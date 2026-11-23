import type { Texture } from "three";

/** The watercolor stays visible until the current backdrop has reached a live GL frame. */
export class StageHandoff {
  private background?: Texture;
  private visible = false;
  failed = false;

  constructor(private readonly showCanvas: (visible: boolean) => void) {}

  useBackground(texture: Texture) {
    if (this.background === texture) return;
    this.background = texture;
    if (this.visible) {
      this.visible = false;
      this.showCanvas(false);
    }
  }

  uses(texture: Texture) { return this.background === texture; }

  afterRender(gl: Pick<WebGLRenderingContext, "isContextLost">) {
    const image = this.background?.image as HTMLImageElement | undefined;
    if (!this.failed && !this.visible && image?.naturalWidth && !gl.isContextLost()) {
      this.visible = true;
      this.showCanvas(true);
    }
  }

  fail() {
    this.failed = true;
    this.visible = false;
    this.showCanvas(false);
  }
}
