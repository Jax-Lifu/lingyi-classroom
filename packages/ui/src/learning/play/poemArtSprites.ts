import * as THREE from "three";

const INK = "rgba(54, 68, 58, 0.36)";

function makeCanvasTexture(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    draw(ctx, width, height);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export function makeGlowTexture(
  innerColor = "rgba(255, 250, 224, 1)",
  midColor = "rgba(255, 226, 152, 0.52)",
  outerColor = "rgba(255, 210, 120, 0)",
): THREE.CanvasTexture {
  return makeCanvasTexture(256, 256, (ctx, w, h) => {
    const grad = ctx.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2);
    grad.addColorStop(0, innerColor);
    grad.addColorStop(0.32, midColor);
    grad.addColorStop(1, outerColor);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  });
}

export function makeLiBaiTexture(): THREE.CanvasTexture {
  return makeCanvasTexture(260, 380, (ctx) => {
    ctx.fillStyle = "rgba(35, 56, 44, 0.14)";
    ctx.beginPath();
    ctx.ellipse(130, 352, 54, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Flowing wide sleeves & warm ivory-celadon scholar robe
    const robeGrad = ctx.createLinearGradient(85, 118, 175, 348);
    robeGrad.addColorStop(0, "#f6f2e6");
    robeGrad.addColorStop(0.65, "#eae4d4");
    robeGrad.addColorStop(1, "#cfd9d2");
    ctx.fillStyle = robeGrad;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.0;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(108, 122);
    ctx.quadraticCurveTo(64, 180, 56, 232);
    ctx.quadraticCurveTo(84, 240, 96, 220);
    ctx.lineTo(78, 344);
    ctx.quadraticCurveTo(130, 356, 184, 342);
    ctx.lineTo(164, 218);
    ctx.quadraticCurveTo(192, 234, 206, 214);
    ctx.quadraticCurveTo(196, 160, 152, 122);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(118, 163, 156, 0.24)";
    ctx.beginPath();
    ctx.moveTo(118, 130);
    ctx.quadraticCurveTo(100, 230, 92, 344);
    ctx.lineTo(148, 344);
    ctx.quadraticCurveTo(144, 220, 140, 130);
    ctx.closePath();
    ctx.fill();

    // Soft jade-indigo waist sash & trailing ribbons
    ctx.fillStyle = "#366972";
    ctx.beginPath();
    ctx.roundRect(102, 198, 56, 14, 6);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(138, 212);
    ctx.quadraticCurveTo(154, 260, 146, 304);
    ctx.lineTo(132, 298);
    ctx.quadraticCurveTo(136, 258, 126, 212);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#f4cba8";
    ctx.beginPath();
    ctx.ellipse(132, 92, 22, 24, -0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#333f4d";
    ctx.beginPath();
    ctx.ellipse(130, 68, 24, 15, -0.08, Math.PI * 0.9, Math.PI * 2.1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(108, 72);
    ctx.quadraticCurveTo(86, 84, 78, 96);
    ctx.lineWidth = 2.6;
    ctx.stroke();
    ctx.lineWidth = 2.0;

    ctx.fillStyle = "rgba(44, 58, 48, 0.85)";
    ctx.beginPath();
    ctx.arc(140, 90, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(138, 98, 4.5, 0.1, Math.PI * 0.8);
    ctx.stroke();
  });
}

export function makePoetBowTexture(): THREE.CanvasTexture {
  return makeCanvasTexture(260, 360, (ctx) => {
    // Soft moonlit floor shadow
    ctx.fillStyle = "rgba(18, 28, 48, 0.22)";
    ctx.beginPath();
    ctx.ellipse(130, 336, 54, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.8;

    // Outer flowing Tang moon-white/indigo-mist scholar gown with natural wide cape sleeves
    const robeGrad = ctx.createLinearGradient(88, 125, 168, 330);
    robeGrad.addColorStop(0, "#eef3f8");
    robeGrad.addColorStop(0.55, "#cad9e8");
    robeGrad.addColorStop(1, "#8ca7c4");
    ctx.fillStyle = robeGrad;
    ctx.beginPath();
    ctx.moveTo(106, 132);
    ctx.quadraticCurveTo(72, 168, 66, 224);
    ctx.quadraticCurveTo(86, 232, 92, 222);
    ctx.quadraticCurveTo(82, 284, 80, 326);
    ctx.quadraticCurveTo(132, 338, 184, 324);
    ctx.quadraticCurveTo(182, 282, 170, 222);
    ctx.quadraticCurveTo(186, 232, 198, 218);
    ctx.quadraticCurveTo(192, 164, 154, 132);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Soft overlapping collar V-fold
    ctx.strokeStyle = "rgba(62, 84, 112, 0.45)";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(114, 134);
    ctx.lineTo(132, 164);
    ctx.lineTo(148, 134);
    ctx.stroke();

    // Draped clasped wide sleeves in gentle contemplation
    ctx.fillStyle = "rgba(155, 178, 206, 0.72)";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(86, 180);
    ctx.quadraticCurveTo(130, 172, 174, 180);
    ctx.quadraticCurveTo(178, 214, 130, 218);
    ctx.quadraticCurveTo(82, 214, 86, 180);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Flowing celadon-indigo silk belt tails (subtle & graceful)
    ctx.fillStyle = "rgba(64, 96, 136, 0.68)";
    ctx.beginPath();
    ctx.moveTo(124, 216);
    ctx.quadraticCurveTo(120, 266, 115, 306);
    ctx.lineTo(127, 308);
    ctx.quadraticCurveTo(133, 266, 134, 216);
    ctx.closePath();
    ctx.fill();

    // Thoughtful slightly bowed head & cheek glow
    ctx.fillStyle = "#f2cbb0";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(130, 108, 21, 22, 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Tang silk scholar cap & soft trailing ribbons
    ctx.fillStyle = "#2b3646";
    ctx.beginPath();
    ctx.ellipse(131, 86, 23, 14, 0.12, Math.PI * 0.92, Math.PI * 2.12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "rgba(43, 54, 70, 0.7)";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(110, 90);
    ctx.quadraticCurveTo(96, 104, 92, 118);
    ctx.stroke();

    // Soft downward serene eyes
    ctx.strokeStyle = "rgba(56, 62, 68, 0.65)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(122, 111, 3.6, 0.15, Math.PI - 0.15);
    ctx.arc(138, 112, 3.6, 0.15, Math.PI - 0.15);
    ctx.stroke();
  });
}

export function makeFishermanTexture(): THREE.CanvasTexture {
  return makeCanvasTexture(280, 320, (ctx) => {
    ctx.lineJoin = "round";

    ctx.strokeStyle = "rgba(108, 79, 44, 0.85)";
    ctx.lineWidth = 3.6;
    ctx.beginPath();
    ctx.moveTo(154, 198);
    ctx.quadraticCurveTo(212, 128, 266, 86);
    ctx.stroke();

    ctx.strokeStyle = "rgba(232, 242, 248, 0.78)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(266, 86);
    ctx.lineTo(264, 286);
    ctx.stroke();

    const cloakGrad = ctx.createLinearGradient(76, 138, 174, 274);
    cloakGrad.addColorStop(0, "#d6b576");
    cloakGrad.addColorStop(1, "#a8834a");
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.8;
    ctx.fillStyle = cloakGrad;
    ctx.beginPath();
    ctx.moveTo(116, 138);
    ctx.quadraticCurveTo(72, 200, 66, 270);
    ctx.quadraticCurveTo(124, 286, 182, 268);
    ctx.quadraticCurveTo(176, 198, 144, 138);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "rgba(122, 92, 48, 0.5)";
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 7; i++) {
      const x = 84 + i * 13;
      ctx.beginPath();
      ctx.moveTo(x, 174 + (i % 2) * 8);
      ctx.lineTo(x - 4, 262);
      ctx.stroke();
    }

    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.8;
    ctx.fillStyle = "#e8bc96";
    ctx.beginPath();
    ctx.arc(130, 120, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#d9bc7a";
    ctx.beginPath();
    ctx.moveTo(64, 114);
    ctx.quadraticCurveTo(130, 56, 196, 114);
    ctx.quadraticCurveTo(130, 128, 64, 114);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(255, 255, 255, 0.52)";
    ctx.beginPath();
    ctx.moveTo(86, 98);
    ctx.quadraticCurveTo(130, 62, 178, 100);
    ctx.quadraticCurveTo(130, 88, 86, 98);
    ctx.closePath();
    ctx.fill();
  });
}

export function makeFarmerTexture(): THREE.CanvasTexture {
  return makeCanvasTexture(280, 320, (ctx) => {
    ctx.lineJoin = "round";

    ctx.strokeStyle = "rgba(112, 77, 42, 0.85)";
    ctx.lineWidth = 4.4;
    ctx.beginPath();
    ctx.moveTo(118, 162);
    ctx.lineTo(222, 286);
    ctx.stroke();
    ctx.strokeStyle = INK;
    ctx.fillStyle = "#62737e";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(204, 278, 36, 14, 3);
    ctx.fill();
    ctx.stroke();

    const tunicGrad = ctx.createLinearGradient(74, 134, 154, 274);
    tunicGrad.addColorStop(0, "#5c8aa8");
    tunicGrad.addColorStop(1, "#3f657d");
    ctx.fillStyle = tunicGrad;
    ctx.beginPath();
    ctx.moveTo(92, 134);
    ctx.quadraticCurveTo(64, 186, 70, 274);
    ctx.lineTo(156, 274);
    ctx.quadraticCurveTo(158, 194, 136, 134);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#edc972";
    ctx.beginPath();
    ctx.ellipse(122, 106, 56, 20, 0.14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(124, 94, 26, 18, 0.14, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
}

export function makePavilionTexture(): THREE.CanvasTexture {
  return makeCanvasTexture(360, 320, (ctx) => {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.8;
    ctx.lineJoin = "round";

    ctx.fillStyle = "#d9d0be";
    ctx.beginPath();
    ctx.roundRect(44, 268, 272, 26, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#ba5348";
    for (const x of [76, 126, 224, 274]) {
      ctx.beginPath();
      ctx.roundRect(x, 154, 12, 114, 3);
      ctx.fill();
      ctx.stroke();
    }

    ctx.fillStyle = "#9c4d36";
    ctx.beginPath();
    ctx.roundRect(62, 232, 236, 12, 3);
    ctx.fill();
    ctx.stroke();

    const drawRoof = (y: number, halfW: number, height: number) => {
      const roofGrad = ctx.createLinearGradient(180, y, 180, y + height);
      roofGrad.addColorStop(0, "#4e767c");
      roofGrad.addColorStop(1, "#35555a");
      ctx.fillStyle = roofGrad;
      ctx.beginPath();
      ctx.moveTo(180 - halfW, y + height);
      ctx.quadraticCurveTo(180 - halfW * 0.45, y + height * 0.65, 180, y);
      ctx.quadraticCurveTo(180 + halfW * 0.45, y + height * 0.65, 180 + halfW, y + height);
      ctx.quadraticCurveTo(180, y + height + 12, 180 - halfW, y + height);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = "rgba(232, 196, 104, 0.8)";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(180 - halfW + 10, y + height - 2);
      ctx.quadraticCurveTo(180, y + height * 0.45, 180 + halfW - 10, y + height - 2);
      ctx.stroke();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.8;
    };

    drawRoof(92, 148, 66);
    drawRoof(42, 102, 52);

    ctx.fillStyle = "#e8be5a";
    ctx.beginPath();
    ctx.arc(180, 34, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
}

export function makeWoodenSkiffTexture(): THREE.CanvasTexture {
  return makeCanvasTexture(420, 220, (ctx) => {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.8;
    ctx.lineJoin = "round";

    ctx.fillStyle = "rgba(25, 58, 56, 0.2)";
    ctx.beginPath();
    ctx.ellipse(210, 174, 152, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#345c5d";
    ctx.beginPath();
    ctx.moveTo(126, 128);
    ctx.quadraticCurveTo(192, 54, 258, 126);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "rgba(130, 172, 170, 0.6)";
    ctx.lineWidth = 2.0;
    for (const dx of [-34, -10, 14, 38]) {
      ctx.beginPath();
      ctx.moveTo(192 + dx, 84);
      ctx.lineTo(190 + dx, 124);
      ctx.stroke();
    }

    const hullGrad = ctx.createLinearGradient(210, 110, 210, 174);
    hullGrad.addColorStop(0, "#c2814c");
    hullGrad.addColorStop(1, "#8f562b");
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.8;
    ctx.fillStyle = hullGrad;
    ctx.beginPath();
    ctx.moveTo(34, 114);
    ctx.quadraticCurveTo(195, 142, 388, 108);
    ctx.quadraticCurveTo(354, 168, 294, 174);
    ctx.lineTo(116, 174);
    ctx.quadraticCurveTo(64, 166, 34, 114);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "rgba(200, 163, 99, 0.85)";
    ctx.lineWidth = 4.2;
    ctx.beginPath();
    ctx.moveTo(268, 122);
    ctx.lineTo(352, 198);
    ctx.stroke();
  });
}

export function makeRoosterTexture(): THREE.CanvasTexture {
  return makeCanvasTexture(300, 300, (ctx) => {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.8;
    ctx.lineJoin = "round";

    ctx.fillStyle = "rgba(35, 56, 44, 0.14)";
    ctx.beginPath();
    ctx.ellipse(152, 266, 56, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#d9922b";
    ctx.lineWidth = 5.5;
    ctx.beginPath();
    ctx.moveTo(136, 206);
    ctx.lineTo(134, 258);
    ctx.moveTo(164, 206);
    ctx.lineTo(170, 258);
    ctx.stroke();

    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.8;
    const plumes = [
      { cx: 52, cy: 110, col: "#2e7365" },
      { cx: 42, cy: 138, col: "#3d8c73" },
      { cx: 64, cy: 158, col: "#2a5664" },
    ];
    for (const pl of plumes) {
      ctx.fillStyle = pl.col;
      ctx.beginPath();
      ctx.moveTo(96, 168);
      ctx.quadraticCurveTo(44, pl.cy - 28, pl.cx, pl.cy + 20);
      ctx.quadraticCurveTo(72, pl.cy + 28, 108, 184);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.fillStyle = "#fffcf2";
    ctx.beginPath();
    ctx.moveTo(90, 168);
    ctx.quadraticCurveTo(100, 128, 164, 134);
    ctx.quadraticCurveTo(188, 90, 210, 88);
    ctx.quadraticCurveTo(234, 92, 232, 122);
    ctx.quadraticCurveTo(228, 182, 180, 214);
    ctx.quadraticCurveTo(122, 224, 90, 168);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#dc4848";
    ctx.beginPath();
    ctx.moveTo(192, 86);
    ctx.quadraticCurveTo(186, 48, 206, 62);
    ctx.quadraticCurveTo(216, 42, 228, 66);
    ctx.quadraticCurveTo(246, 56, 234, 88);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(226, 122, 8, 14, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#f2b838";
    ctx.beginPath();
    ctx.moveTo(232, 98);
    ctx.lineTo(258, 102);
    ctx.lineTo(232, 114);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(44, 58, 48, 0.85)";
    ctx.beginPath();
    ctx.arc(218, 98, 4.2, 0, Math.PI * 2);
    ctx.fill();
  });
}

export function makeLotusBudTexture(): THREE.CanvasTexture {
  return makeCanvasTexture(220, 280, (ctx) => {
    ctx.lineJoin = "round";

    ctx.strokeStyle = "#4c8f56";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(110, 266);
    ctx.quadraticCurveTo(106, 198, 114, 126);
    ctx.stroke();

    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.6;
    const leafGrad = ctx.createLinearGradient(86, 20, 148, 134);
    leafGrad.addColorStop(0, "#8bc774");
    leafGrad.addColorStop(1, "#5c9e4c");
    ctx.fillStyle = leafGrad;
    ctx.beginPath();
    ctx.moveTo(114, 134);
    ctx.quadraticCurveTo(72, 104, 86, 46);
    ctx.quadraticCurveTo(106, 18, 122, 24);
    ctx.quadraticCurveTo(156, 72, 114, 134);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#f49eab";
    ctx.beginPath();
    ctx.moveTo(112, 122);
    ctx.quadraticCurveTo(132, 88, 142, 48);
    ctx.quadraticCurveTo(158, 80, 126, 126);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });
}

export function makeDragonflyTexture(): THREE.CanvasTexture {
  return makeCanvasTexture(240, 200, (ctx) => {
    ctx.strokeStyle = "rgba(68, 92, 88, 0.34)";
    ctx.lineWidth = 1.5;
    ctx.lineJoin = "round";

    const drawWing = (cx: number, cy: number, rx: number, ry: number, angle: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.fillStyle = "rgba(228, 250, 255, 0.72)";
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };
    drawWing(80, 76, 54, 15, -0.32);
    drawWing(160, 76, 54, 15, 0.32);
    drawWing(84, 102, 46, 13, 0.24);
    drawWing(156, 102, 46, 13, -0.24);

    ctx.fillStyle = "#de6672";
    ctx.beginPath();
    ctx.roundRect(114, 88, 12, 86, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#329478";
    ctx.beginPath();
    ctx.ellipse(120, 80, 12, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(44, 62, 54, 0.85)";
    ctx.beginPath();
    ctx.arc(112, 68, 5.5, 0, Math.PI * 2);
    ctx.arc(128, 68, 5.5, 0, Math.PI * 2);
    ctx.fill();
  });
}

export function makePlumBranchTexture(): THREE.CanvasTexture {
  return makeCanvasTexture(420, 320, (ctx) => {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Painterly ink-wash tapered gnarly plum branch
    const barkGrad = ctx.createLinearGradient(20, 270, 390, 75);
    barkGrad.addColorStop(0, "#463128");
    barkGrad.addColorStop(0.6, "#66483a");
    barkGrad.addColorStop(1, "#7d5c4d");
    ctx.strokeStyle = barkGrad;
    ctx.lineWidth = 13;
    ctx.beginPath();
    ctx.moveTo(22, 272);
    ctx.quadraticCurveTo(132, 202, 214, 166);
    ctx.quadraticCurveTo(306, 132, 386, 78);
    ctx.stroke();

    ctx.lineWidth = 7.5;
    ctx.beginPath();
    ctx.moveTo(156, 194);
    ctx.quadraticCurveTo(192, 114, 248, 52);
    ctx.moveTo(256, 148);
    ctx.quadraticCurveTo(318, 162, 374, 142);
    ctx.stroke();

    ctx.lineWidth = 4.2;
    ctx.beginPath();
    ctx.moveTo(298, 118);
    ctx.quadraticCurveTo(312, 74, 344, 46);
    ctx.stroke();

    // Soft frost highlight on upper branch ridge
    ctx.strokeStyle = "rgba(255, 255, 255, 0.62)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(42, 256);
    ctx.quadraticCurveTo(138, 194, 210, 160);
    ctx.stroke();

    // Delicate radial-gradient Guofeng watercolor plum blossoms (no black marker circles!)
    const drawPlum = (x: number, y: number, r: number, blush = false) => {
      for (let i = 0; i < 5; i++) {
        const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
        const px = x + Math.cos(a) * r * 0.64;
        const py = y + Math.sin(a) * r * 0.64;
        const pGrad = ctx.createRadialGradient(x, y, r * 0.12, px, py, r * 0.72);
        pGrad.addColorStop(0, blush ? "#f29ab0" : "#ffdbe4");
        pGrad.addColorStop(1, blush ? "#fff0f4" : "#fffcf9");
        ctx.fillStyle = pGrad;
        ctx.strokeStyle = "rgba(184, 108, 124, 0.34)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(px, py, r * 0.54, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.fillStyle = "#e05a74";
      ctx.beginPath();
      ctx.arc(x, y, r * 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffe596";
      for (let s = 0; s < 5; s++) {
        const ang = (s * Math.PI * 2) / 5;
        ctx.beginPath();
        ctx.arc(x + Math.cos(ang) * r * 0.3, y + Math.sin(ang) * r * 0.3, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawBud = (x: number, y: number, r: number) => {
      ctx.fillStyle = "#ea738c";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };

    drawPlum(126, 206, 22, true);
    drawPlum(218, 112, 24, false);
    drawPlum(258, 56, 18, true);
    drawPlum(304, 128, 25, false);
    drawPlum(372, 82, 20, true);
    drawPlum(352, 152, 18, false);
    drawBud(342, 46, 6.5);
    drawBud(174, 146, 5.5);
  });
}

export function makeCourtyardWallTexture(): THREE.CanvasTexture {
  return makeCanvasTexture(420, 240, (ctx) => {
    ctx.lineJoin = "round";

    // Soft ash-cream painted plaster wall ("墙角") fading right & upward
    const wallGrad = ctx.createLinearGradient(0, 40, 390, 220);
    wallGrad.addColorStop(0, "rgba(232, 232, 226, 0.94)");
    wallGrad.addColorStop(0.65, "rgba(218, 222, 218, 0.88)");
    wallGrad.addColorStop(1, "rgba(210, 218, 216, 0.0)");
    ctx.fillStyle = wallGrad;
    ctx.beginPath();
    ctx.moveTo(0, 62);
    ctx.lineTo(298, 72);
    ctx.quadraticCurveTo(335, 130, 380, 240);
    ctx.lineTo(0, 240);
    ctx.closePath();
    ctx.fill();

    // Dark-tile roof coping along wall top with snow layer
    ctx.fillStyle = "rgba(86, 98, 108, 0.85)";
    ctx.beginPath();
    ctx.moveTo(0, 50);
    ctx.lineTo(312, 62);
    ctx.lineTo(304, 78);
    ctx.lineTo(0, 68);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
    ctx.beginPath();
    ctx.moveTo(0, 36);
    ctx.quadraticCurveTo(155, 42, 314, 56);
    ctx.quadraticCurveTo(290, 68, 155, 58);
    ctx.lineTo(0, 56);
    ctx.closePath();
    ctx.fill();
  });
}

export function makeWillowCurtainTexture(): THREE.CanvasTexture {
  return makeCanvasTexture(380, 320, (ctx) => {
    const strands = [46, 94, 146, 200, 254, 310];
    strands.forEach((sx, idx) => {
      const len = 210 + (idx % 3) * 36;
      const sway = (idx % 2 === 0 ? 1 : -1) * 26;
      ctx.strokeStyle = "rgba(86, 132, 74, 0.58)";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(sx, 12);
      ctx.quadraticCurveTo(sx + sway, len * 0.55, sx + sway * 1.4, len);
      ctx.stroke();

      for (let y = 38; y < len - 12; y += 26) {
        const t = y / len;
        const px = sx + sway * (1.2 * t);
        const side = ((y / 26) | 0) % 2 === 0 ? 1 : -1;
        ctx.save();
        ctx.translate(px, y);
        ctx.rotate(side * 0.65);
        ctx.fillStyle =
          (y + idx) % 2 === 0 ? "rgba(132, 186, 94, 0.8)" : "rgba(104, 162, 76, 0.78)";
        ctx.strokeStyle = "rgba(56, 86, 56, 0.22)";
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.ellipse(side * 12, 4, 14, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    });
  });
}

export function makeSwallowKiteTexture(): THREE.CanvasTexture {
  return makeCanvasTexture(260, 280, (ctx) => {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.8;
    ctx.lineJoin = "round";

    ctx.fillStyle = "#e86458";
    ctx.beginPath();
    ctx.moveTo(122, 166);
    ctx.quadraticCurveTo(90, 212, 108, 254);
    ctx.lineTo(124, 246);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#f2be52";
    ctx.beginPath();
    ctx.moveTo(138, 166);
    ctx.quadraticCurveTo(166, 212, 148, 254);
    ctx.lineTo(134, 246);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#fff6e3";
    ctx.beginPath();
    ctx.moveTo(130, 56);
    ctx.quadraticCurveTo(212, 74, 232, 118);
    ctx.quadraticCurveTo(176, 134, 152, 170);
    ctx.lineTo(130, 148);
    ctx.lineTo(108, 170);
    ctx.quadraticCurveTo(84, 134, 28, 118);
    ctx.quadraticCurveTo(48, 74, 130, 56);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#e26858";
    ctx.beginPath();
    ctx.arc(130, 104, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
}

export function makeLanternTexture(): THREE.CanvasTexture {
  return makeCanvasTexture(200, 260, (ctx) => {
    const grad = ctx.createRadialGradient(100, 132, 10, 100, 132, 92);
    grad.addColorStop(0, "rgba(255, 222, 130, 0.72)");
    grad.addColorStop(1, "rgba(255, 190, 90, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 200, 260);

    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.8;

    ctx.beginPath();
    ctx.moveTo(100, 16);
    ctx.lineTo(100, 62);
    ctx.stroke();

    ctx.fillStyle = "#f27441";
    ctx.beginPath();
    ctx.ellipse(100, 130, 48, 56, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#ffd97d";
    ctx.beginPath();
    ctx.ellipse(100, 130, 24, 48, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#543b2c";
    ctx.beginPath();
    ctx.roundRect(74, 68, 52, 12, 4);
    ctx.roundRect(76, 180, 48, 12, 4);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "#e6b43c";
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(100, 192);
    ctx.lineTo(100, 236);
    ctx.moveTo(92, 194);
    ctx.lineTo(88, 228);
    ctx.moveTo(108, 194);
    ctx.lineTo(112, 228);
    ctx.stroke();
  });
}

export function makeFrontierTowerTexture(): THREE.CanvasTexture {
  return makeCanvasTexture(360, 280, (ctx) => {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.8;
    ctx.lineJoin = "round";

    ctx.fillStyle = "#ba9264";
    ctx.beginPath();
    ctx.moveTo(26, 256);
    ctx.lineTo(54, 130);
    ctx.lineTo(306, 130);
    ctx.lineTo(334, 256);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#8f6040";
    ctx.beginPath();
    ctx.roundRect(104, 78, 152, 52, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#4c525e";
    ctx.beginPath();
    ctx.moveTo(82, 82);
    ctx.quadraticCurveTo(180, 32, 278, 82);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#3a2c24";
    ctx.beginPath();
    ctx.moveTo(152, 256);
    ctx.lineTo(152, 192);
    ctx.arc(180, 192, 28, Math.PI, 0);
    ctx.lineTo(208, 256);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#d94b3e";
    ctx.beginPath();
    ctx.moveTo(256, 48);
    ctx.lineTo(322, 62);
    ctx.lineTo(256, 78);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });
}

export function makeWaterJarTexture(): THREE.CanvasTexture {
  return makeCanvasTexture(260, 260, (ctx) => {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.8;
    ctx.lineJoin = "round";

    const jarGrad = ctx.createLinearGradient(60, 72, 200, 232);
    jarGrad.addColorStop(0, "#b06848");
    jarGrad.addColorStop(1, "#7d4129");
    ctx.fillStyle = jarGrad;
    ctx.beginPath();
    ctx.moveTo(64, 72);
    ctx.quadraticCurveTo(36, 152, 68, 232);
    ctx.quadraticCurveTo(130, 246, 192, 232);
    ctx.quadraticCurveTo(224, 152, 196, 72);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#62a2ad";
    ctx.beginPath();
    ctx.ellipse(130, 72, 68, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "rgba(224, 174, 128, 0.72)";
    ctx.lineWidth = 4.2;
    ctx.beginPath();
    ctx.moveTo(62, 146);
    ctx.quadraticCurveTo(130, 162, 198, 146);
    ctx.stroke();
  });
}

// Clear-center antique scroll corner flourishes for Ancient Fables (never blocks center characters)
export function makeScrollFrameTexture(): THREE.CanvasTexture {
  return makeCanvasTexture(480, 270, (ctx, w, h) => {
    // Soft outer vignette border along outer 10%
    const vig = ctx.createRadialGradient(w / 2, h / 2, w * 0.36, w / 2, h / 2, w * 0.62);
    vig.addColorStop(0, "rgba(247, 238, 212, 0)");
    vig.addColorStop(0.75, "rgba(242, 224, 182, 0.14)");
    vig.addColorStop(1, "rgba(198, 162, 98, 0.34)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);

    // Subtle delicate golden inner corner brackets
    ctx.strokeStyle = "rgba(184, 140, 72, 0.52)";
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    const pad = 16;
    const arm = 26;
    const corners: [number, number, number, number][] = [
      [pad, pad, 1, 1],
      [w - pad, pad, -1, 1],
      [pad, h - pad, 1, -1],
      [w - pad, h - pad, -1, -1],
    ];
    for (const [cx, cy, dx, dy] of corners) {
      ctx.beginPath();
      ctx.moveTo(cx, cy + dy * arm);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx + dx * arm, cy);
      ctx.stroke();
    }
  });
}

export function makePetalTexture(color = "#ffb8c6"): THREE.CanvasTexture {
  return makeCanvasTexture(64, 64, (ctx) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(32, 10);
    ctx.bezierCurveTo(50, 14, 52, 42, 32, 54);
    ctx.bezierCurveTo(12, 42, 14, 14, 32, 10);
    ctx.fill();
  });
}

export function makeLeafTexture(color = "#6ea858"): THREE.CanvasTexture {
  return makeCanvasTexture(64, 64, (ctx) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(14, 48);
    ctx.quadraticCurveTo(22, 14, 52, 14);
    ctx.quadraticCurveTo(46, 46, 14, 48);
    ctx.fill();
  });
}
