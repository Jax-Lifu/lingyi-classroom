import{g as C,e as P,x as d,o as v,y as S,A as b,z as g}from"./three.module-B4O2-g4V.js";class w{constructor(o){this.showCanvas=o}background;visible=!1;failed=!1;useBackground(o){this.background!==o&&(this.background=o,this.visible&&(this.visible=!1,this.showCanvas(!1)))}uses(o){return this.background===o}afterRender(o){const a=this.background?.image;!this.failed&&!this.visible&&a?.naturalWidth&&!o.isContextLost()&&(this.visible=!0,this.showCanvas(!0))}fail(){this.failed=!0,this.visible=!1,this.showCanvas(!1)}}const u="rgba(54, 68, 58, 0.36)";function t(e,o,a){const l=document.createElement("canvas");l.width=e,l.height=o;const i=l.getContext("2d");i&&a(i,e,o);const r=new C(l);return r.colorSpace=P,r.needsUpdate=!0,r}function M(e="rgba(255, 250, 224, 1)",o="rgba(255, 226, 152, 0.52)",a="rgba(255, 210, 120, 0)"){return t(256,256,(l,i,r)=>{const n=l.createRadialGradient(i/2,r/2,4,i/2,r/2,i/2);n.addColorStop(0,e),n.addColorStop(.32,o),n.addColorStop(1,a),l.fillStyle=n,l.fillRect(0,0,i,r)})}function q(){return t(260,380,e=>{e.fillStyle="rgba(35, 56, 44, 0.14)",e.beginPath(),e.ellipse(130,352,54,12,0,0,Math.PI*2),e.fill();const o=e.createLinearGradient(85,118,175,348);o.addColorStop(0,"#f6f2e6"),o.addColorStop(.65,"#eae4d4"),o.addColorStop(1,"#cfd9d2"),e.fillStyle=o,e.strokeStyle=u,e.lineWidth=2,e.lineJoin="round",e.beginPath(),e.moveTo(108,122),e.quadraticCurveTo(64,180,56,232),e.quadraticCurveTo(84,240,96,220),e.lineTo(78,344),e.quadraticCurveTo(130,356,184,342),e.lineTo(164,218),e.quadraticCurveTo(192,234,206,214),e.quadraticCurveTo(196,160,152,122),e.closePath(),e.fill(),e.stroke(),e.fillStyle="rgba(118, 163, 156, 0.24)",e.beginPath(),e.moveTo(118,130),e.quadraticCurveTo(100,230,92,344),e.lineTo(148,344),e.quadraticCurveTo(144,220,140,130),e.closePath(),e.fill(),e.fillStyle="#366972",e.beginPath(),e.roundRect(102,198,56,14,6),e.fill(),e.stroke(),e.beginPath(),e.moveTo(138,212),e.quadraticCurveTo(154,260,146,304),e.lineTo(132,298),e.quadraticCurveTo(136,258,126,212),e.closePath(),e.fill(),e.stroke(),e.fillStyle="#f4cba8",e.beginPath(),e.ellipse(132,92,22,24,-.08,0,Math.PI*2),e.fill(),e.stroke(),e.fillStyle="#333f4d",e.beginPath(),e.ellipse(130,68,24,15,-.08,Math.PI*.9,Math.PI*2.1),e.closePath(),e.fill(),e.stroke(),e.beginPath(),e.moveTo(108,72),e.quadraticCurveTo(86,84,78,96),e.lineWidth=2.6,e.stroke(),e.lineWidth=2,e.fillStyle="rgba(44, 58, 48, 0.85)",e.beginPath(),e.arc(140,90,2.4,0,Math.PI*2),e.fill(),e.beginPath(),e.arc(138,98,4.5,.1,Math.PI*.8),e.stroke()})}function U(){return t(260,360,e=>{e.fillStyle="rgba(18, 28, 48, 0.22)",e.beginPath(),e.ellipse(130,336,54,11,0,0,Math.PI*2),e.fill(),e.lineJoin="round",e.lineCap="round",e.strokeStyle=u,e.lineWidth=1.8;const o=e.createLinearGradient(88,125,168,330);o.addColorStop(0,"#eef3f8"),o.addColorStop(.55,"#cad9e8"),o.addColorStop(1,"#8ca7c4"),e.fillStyle=o,e.beginPath(),e.moveTo(106,132),e.quadraticCurveTo(72,168,66,224),e.quadraticCurveTo(86,232,92,222),e.quadraticCurveTo(82,284,80,326),e.quadraticCurveTo(132,338,184,324),e.quadraticCurveTo(182,282,170,222),e.quadraticCurveTo(186,232,198,218),e.quadraticCurveTo(192,164,154,132),e.closePath(),e.fill(),e.stroke(),e.strokeStyle="rgba(62, 84, 112, 0.45)",e.lineWidth=2.2,e.beginPath(),e.moveTo(114,134),e.lineTo(132,164),e.lineTo(148,134),e.stroke(),e.fillStyle="rgba(155, 178, 206, 0.72)",e.strokeStyle=u,e.lineWidth=1.6,e.beginPath(),e.moveTo(86,180),e.quadraticCurveTo(130,172,174,180),e.quadraticCurveTo(178,214,130,218),e.quadraticCurveTo(82,214,86,180),e.closePath(),e.fill(),e.stroke(),e.fillStyle="rgba(64, 96, 136, 0.68)",e.beginPath(),e.moveTo(124,216),e.quadraticCurveTo(120,266,115,306),e.lineTo(127,308),e.quadraticCurveTo(133,266,134,216),e.closePath(),e.fill(),e.fillStyle="#f2cbb0",e.strokeStyle=u,e.lineWidth=1.6,e.beginPath(),e.ellipse(130,108,21,22,.08,0,Math.PI*2),e.fill(),e.stroke(),e.fillStyle="#2b3646",e.beginPath(),e.ellipse(131,86,23,14,.12,Math.PI*.92,Math.PI*2.12),e.closePath(),e.fill(),e.stroke(),e.strokeStyle="rgba(43, 54, 70, 0.7)",e.lineWidth=2.4,e.beginPath(),e.moveTo(110,90),e.quadraticCurveTo(96,104,92,118),e.stroke(),e.strokeStyle="rgba(56, 62, 68, 0.65)",e.lineWidth=1.6,e.beginPath(),e.arc(122,111,3.6,.15,Math.PI-.15),e.arc(138,112,3.6,.15,Math.PI-.15),e.stroke()})}function W(){return t(280,320,e=>{e.lineJoin="round",e.strokeStyle="rgba(108, 79, 44, 0.85)",e.lineWidth=3.6,e.beginPath(),e.moveTo(154,198),e.quadraticCurveTo(212,128,266,86),e.stroke(),e.strokeStyle="rgba(232, 242, 248, 0.78)",e.lineWidth=1.4,e.beginPath(),e.moveTo(266,86),e.lineTo(264,286),e.stroke();const o=e.createLinearGradient(76,138,174,274);o.addColorStop(0,"#d6b576"),o.addColorStop(1,"#a8834a"),e.strokeStyle=u,e.lineWidth=1.8,e.fillStyle=o,e.beginPath(),e.moveTo(116,138),e.quadraticCurveTo(72,200,66,270),e.quadraticCurveTo(124,286,182,268),e.quadraticCurveTo(176,198,144,138),e.closePath(),e.fill(),e.stroke(),e.strokeStyle="rgba(122, 92, 48, 0.5)",e.lineWidth=1.6;for(let a=0;a<7;a++){const l=84+a*13;e.beginPath(),e.moveTo(l,174+a%2*8),e.lineTo(l-4,262),e.stroke()}e.strokeStyle=u,e.lineWidth=1.8,e.fillStyle="#e8bc96",e.beginPath(),e.arc(130,120,17,0,Math.PI*2),e.fill(),e.stroke(),e.fillStyle="#d9bc7a",e.beginPath(),e.moveTo(64,114),e.quadraticCurveTo(130,56,196,114),e.quadraticCurveTo(130,128,64,114),e.closePath(),e.fill(),e.stroke(),e.fillStyle="rgba(255, 255, 255, 0.52)",e.beginPath(),e.moveTo(86,98),e.quadraticCurveTo(130,62,178,100),e.quadraticCurveTo(130,88,86,98),e.closePath(),e.fill()})}function I(){return t(280,320,e=>{e.lineJoin="round",e.strokeStyle="rgba(112, 77, 42, 0.85)",e.lineWidth=4.4,e.beginPath(),e.moveTo(118,162),e.lineTo(222,286),e.stroke(),e.strokeStyle=u,e.fillStyle="#62737e",e.lineWidth=1.8,e.beginPath(),e.roundRect(204,278,36,14,3),e.fill(),e.stroke();const o=e.createLinearGradient(74,134,154,274);o.addColorStop(0,"#5c8aa8"),o.addColorStop(1,"#3f657d"),e.fillStyle=o,e.beginPath(),e.moveTo(92,134),e.quadraticCurveTo(64,186,70,274),e.lineTo(156,274),e.quadraticCurveTo(158,194,136,134),e.closePath(),e.fill(),e.stroke(),e.fillStyle="#edc972",e.beginPath(),e.ellipse(122,106,56,20,.14,0,Math.PI*2),e.fill(),e.stroke(),e.beginPath(),e.ellipse(124,94,26,18,.14,Math.PI,Math.PI*2),e.fill(),e.stroke()})}function G(){return t(360,320,e=>{e.strokeStyle=u,e.lineWidth=1.8,e.lineJoin="round",e.fillStyle="#d9d0be",e.beginPath(),e.roundRect(44,268,272,26,6),e.fill(),e.stroke(),e.fillStyle="#ba5348";for(const a of[76,126,224,274])e.beginPath(),e.roundRect(a,154,12,114,3),e.fill(),e.stroke();e.fillStyle="#9c4d36",e.beginPath(),e.roundRect(62,232,236,12,3),e.fill(),e.stroke();const o=(a,l,i)=>{const r=e.createLinearGradient(180,a,180,a+i);r.addColorStop(0,"#4e767c"),r.addColorStop(1,"#35555a"),e.fillStyle=r,e.beginPath(),e.moveTo(180-l,a+i),e.quadraticCurveTo(180-l*.45,a+i*.65,180,a),e.quadraticCurveTo(180+l*.45,a+i*.65,180+l,a+i),e.quadraticCurveTo(180,a+i+12,180-l,a+i),e.closePath(),e.fill(),e.stroke(),e.strokeStyle="rgba(232, 196, 104, 0.8)",e.lineWidth=2.2,e.beginPath(),e.moveTo(180-l+10,a+i-2),e.quadraticCurveTo(180,a+i*.45,180+l-10,a+i-2),e.stroke(),e.strokeStyle=u,e.lineWidth=1.8};o(92,148,66),o(42,102,52),e.fillStyle="#e8be5a",e.beginPath(),e.arc(180,34,9,0,Math.PI*2),e.fill(),e.stroke()})}function R(){return t(420,220,e=>{e.strokeStyle=u,e.lineWidth=1.8,e.lineJoin="round",e.fillStyle="rgba(25, 58, 56, 0.2)",e.beginPath(),e.ellipse(210,174,152,16,0,0,Math.PI*2),e.fill(),e.fillStyle="#345c5d",e.beginPath(),e.moveTo(126,128),e.quadraticCurveTo(192,54,258,126),e.closePath(),e.fill(),e.stroke(),e.strokeStyle="rgba(130, 172, 170, 0.6)",e.lineWidth=2;for(const a of[-34,-10,14,38])e.beginPath(),e.moveTo(192+a,84),e.lineTo(190+a,124),e.stroke();const o=e.createLinearGradient(210,110,210,174);o.addColorStop(0,"#c2814c"),o.addColorStop(1,"#8f562b"),e.strokeStyle=u,e.lineWidth=1.8,e.fillStyle=o,e.beginPath(),e.moveTo(34,114),e.quadraticCurveTo(195,142,388,108),e.quadraticCurveTo(354,168,294,174),e.lineTo(116,174),e.quadraticCurveTo(64,166,34,114),e.closePath(),e.fill(),e.stroke(),e.strokeStyle="rgba(200, 163, 99, 0.85)",e.lineWidth=4.2,e.beginPath(),e.moveTo(268,122),e.lineTo(352,198),e.stroke()})}function O(){return t(300,300,e=>{e.strokeStyle=u,e.lineWidth=1.8,e.lineJoin="round",e.fillStyle="rgba(35, 56, 44, 0.14)",e.beginPath(),e.ellipse(152,266,56,12,0,0,Math.PI*2),e.fill(),e.strokeStyle="#d9922b",e.lineWidth=5.5,e.beginPath(),e.moveTo(136,206),e.lineTo(134,258),e.moveTo(164,206),e.lineTo(170,258),e.stroke(),e.strokeStyle=u,e.lineWidth=1.8;const o=[{cx:52,cy:110,col:"#2e7365"},{cx:42,cy:138,col:"#3d8c73"},{cx:64,cy:158,col:"#2a5664"}];for(const a of o)e.fillStyle=a.col,e.beginPath(),e.moveTo(96,168),e.quadraticCurveTo(44,a.cy-28,a.cx,a.cy+20),e.quadraticCurveTo(72,a.cy+28,108,184),e.closePath(),e.fill(),e.stroke();e.fillStyle="#fffcf2",e.beginPath(),e.moveTo(90,168),e.quadraticCurveTo(100,128,164,134),e.quadraticCurveTo(188,90,210,88),e.quadraticCurveTo(234,92,232,122),e.quadraticCurveTo(228,182,180,214),e.quadraticCurveTo(122,224,90,168),e.closePath(),e.fill(),e.stroke(),e.fillStyle="#dc4848",e.beginPath(),e.moveTo(192,86),e.quadraticCurveTo(186,48,206,62),e.quadraticCurveTo(216,42,228,66),e.quadraticCurveTo(246,56,234,88),e.closePath(),e.fill(),e.stroke(),e.beginPath(),e.ellipse(226,122,8,14,.2,0,Math.PI*2),e.fill(),e.stroke(),e.fillStyle="#f2b838",e.beginPath(),e.moveTo(232,98),e.lineTo(258,102),e.lineTo(232,114),e.closePath(),e.fill(),e.stroke(),e.fillStyle="rgba(44, 58, 48, 0.85)",e.beginPath(),e.arc(218,98,4.2,0,Math.PI*2),e.fill()})}function B(){return t(220,280,e=>{e.lineJoin="round",e.strokeStyle="#4c8f56",e.lineWidth=7,e.beginPath(),e.moveTo(110,266),e.quadraticCurveTo(106,198,114,126),e.stroke(),e.strokeStyle=u,e.lineWidth=1.6;const o=e.createLinearGradient(86,20,148,134);o.addColorStop(0,"#8bc774"),o.addColorStop(1,"#5c9e4c"),e.fillStyle=o,e.beginPath(),e.moveTo(114,134),e.quadraticCurveTo(72,104,86,46),e.quadraticCurveTo(106,18,122,24),e.quadraticCurveTo(156,72,114,134),e.closePath(),e.fill(),e.stroke(),e.fillStyle="#f49eab",e.beginPath(),e.moveTo(112,122),e.quadraticCurveTo(132,88,142,48),e.quadraticCurveTo(158,80,126,126),e.closePath(),e.fill(),e.stroke()})}function F(){return t(240,200,e=>{e.strokeStyle="rgba(68, 92, 88, 0.34)",e.lineWidth=1.5,e.lineJoin="round";const o=(a,l,i,r,n)=>{e.save(),e.translate(a,l),e.rotate(n),e.fillStyle="rgba(228, 250, 255, 0.72)",e.beginPath(),e.ellipse(0,0,i,r,0,0,Math.PI*2),e.fill(),e.stroke(),e.restore()};o(80,76,54,15,-.32),o(160,76,54,15,.32),o(84,102,46,13,.24),o(156,102,46,13,-.24),e.fillStyle="#de6672",e.beginPath(),e.roundRect(114,88,12,86,6),e.fill(),e.stroke(),e.fillStyle="#329478",e.beginPath(),e.ellipse(120,80,12,16,0,0,Math.PI*2),e.fill(),e.stroke(),e.fillStyle="rgba(44, 62, 54, 0.85)",e.beginPath(),e.arc(112,68,5.5,0,Math.PI*2),e.arc(128,68,5.5,0,Math.PI*2),e.fill()})}function _(){return t(420,320,e=>{e.lineCap="round",e.lineJoin="round";const o=e.createLinearGradient(20,270,390,75);o.addColorStop(0,"#463128"),o.addColorStop(.6,"#66483a"),o.addColorStop(1,"#7d5c4d"),e.strokeStyle=o,e.lineWidth=13,e.beginPath(),e.moveTo(22,272),e.quadraticCurveTo(132,202,214,166),e.quadraticCurveTo(306,132,386,78),e.stroke(),e.lineWidth=7.5,e.beginPath(),e.moveTo(156,194),e.quadraticCurveTo(192,114,248,52),e.moveTo(256,148),e.quadraticCurveTo(318,162,374,142),e.stroke(),e.lineWidth=4.2,e.beginPath(),e.moveTo(298,118),e.quadraticCurveTo(312,74,344,46),e.stroke(),e.strokeStyle="rgba(255, 255, 255, 0.62)",e.lineWidth=4,e.beginPath(),e.moveTo(42,256),e.quadraticCurveTo(138,194,210,160),e.stroke();const a=(i,r,n,h=!1)=>{for(let s=0;s<5;s++){const f=s*Math.PI*2/5-Math.PI/2,p=i+Math.cos(f)*n*.64,y=r+Math.sin(f)*n*.64,T=e.createRadialGradient(i,r,n*.12,p,y,n*.72);T.addColorStop(0,h?"#f29ab0":"#ffdbe4"),T.addColorStop(1,h?"#fff0f4":"#fffcf9"),e.fillStyle=T,e.strokeStyle="rgba(184, 108, 124, 0.34)",e.lineWidth=1.2,e.beginPath(),e.arc(p,y,n*.54,0,Math.PI*2),e.fill(),e.stroke()}e.fillStyle="#e05a74",e.beginPath(),e.arc(i,r,n*.2,0,Math.PI*2),e.fill(),e.fillStyle="#ffe596";for(let s=0;s<5;s++){const f=s*Math.PI*2/5;e.beginPath(),e.arc(i+Math.cos(f)*n*.3,r+Math.sin(f)*n*.3,1.8,0,Math.PI*2),e.fill()}},l=(i,r,n)=>{e.fillStyle="#ea738c",e.beginPath(),e.arc(i,r,n,0,Math.PI*2),e.fill()};a(126,206,22,!0),a(218,112,24,!1),a(258,56,18,!0),a(304,128,25,!1),a(372,82,20,!0),a(352,152,18,!1),l(342,46,6.5),l(174,146,5.5)})}function L(){return t(420,240,e=>{e.lineJoin="round";const o=e.createLinearGradient(0,40,390,220);o.addColorStop(0,"rgba(232, 232, 226, 0.94)"),o.addColorStop(.65,"rgba(218, 222, 218, 0.88)"),o.addColorStop(1,"rgba(210, 218, 216, 0.0)"),e.fillStyle=o,e.beginPath(),e.moveTo(0,62),e.lineTo(298,72),e.quadraticCurveTo(335,130,380,240),e.lineTo(0,240),e.closePath(),e.fill(),e.fillStyle="rgba(86, 98, 108, 0.85)",e.beginPath(),e.moveTo(0,50),e.lineTo(312,62),e.lineTo(304,78),e.lineTo(0,68),e.closePath(),e.fill(),e.fillStyle="rgba(255, 255, 255, 0.92)",e.beginPath(),e.moveTo(0,36),e.quadraticCurveTo(155,42,314,56),e.quadraticCurveTo(290,68,155,58),e.lineTo(0,56),e.closePath(),e.fill()})}function J(){return t(380,320,e=>{[46,94,146,200,254,310].forEach((a,l)=>{const i=210+l%3*36,r=(l%2===0?1:-1)*26;e.strokeStyle="rgba(86, 132, 74, 0.58)",e.lineWidth=2.2,e.beginPath(),e.moveTo(a,12),e.quadraticCurveTo(a+r,i*.55,a+r*1.4,i),e.stroke();for(let n=38;n<i-12;n+=26){const h=n/i,s=a+r*(1.2*h),f=(n/26|0)%2===0?1:-1;e.save(),e.translate(s,n),e.rotate(f*.65),e.fillStyle=(n+l)%2===0?"rgba(132, 186, 94, 0.8)":"rgba(104, 162, 76, 0.78)",e.strokeStyle="rgba(56, 86, 56, 0.22)",e.lineWidth=1,e.beginPath(),e.ellipse(f*12,4,14,4.5,0,0,Math.PI*2),e.fill(),e.stroke(),e.restore()}})})}function j(){return t(260,280,e=>{e.strokeStyle=u,e.lineWidth=1.8,e.lineJoin="round",e.fillStyle="#e86458",e.beginPath(),e.moveTo(122,166),e.quadraticCurveTo(90,212,108,254),e.lineTo(124,246),e.closePath(),e.fill(),e.stroke(),e.fillStyle="#f2be52",e.beginPath(),e.moveTo(138,166),e.quadraticCurveTo(166,212,148,254),e.lineTo(134,246),e.closePath(),e.fill(),e.stroke(),e.fillStyle="#fff6e3",e.beginPath(),e.moveTo(130,56),e.quadraticCurveTo(212,74,232,118),e.quadraticCurveTo(176,134,152,170),e.lineTo(130,148),e.lineTo(108,170),e.quadraticCurveTo(84,134,28,118),e.quadraticCurveTo(48,74,130,56),e.closePath(),e.fill(),e.stroke(),e.fillStyle="#e26858",e.beginPath(),e.arc(130,104,22,0,Math.PI*2),e.fill(),e.stroke()})}function V(){return t(200,260,e=>{const o=e.createRadialGradient(100,132,10,100,132,92);o.addColorStop(0,"rgba(255, 222, 130, 0.72)"),o.addColorStop(1,"rgba(255, 190, 90, 0)"),e.fillStyle=o,e.fillRect(0,0,200,260),e.strokeStyle=u,e.lineWidth=1.8,e.beginPath(),e.moveTo(100,16),e.lineTo(100,62),e.stroke(),e.fillStyle="#f27441",e.beginPath(),e.ellipse(100,130,48,56,0,0,Math.PI*2),e.fill(),e.stroke(),e.fillStyle="#ffd97d",e.beginPath(),e.ellipse(100,130,24,48,0,0,Math.PI*2),e.fill(),e.fillStyle="#543b2c",e.beginPath(),e.roundRect(74,68,52,12,4),e.roundRect(76,180,48,12,4),e.fill(),e.stroke(),e.strokeStyle="#e6b43c",e.lineWidth=3.2,e.beginPath(),e.moveTo(100,192),e.lineTo(100,236),e.moveTo(92,194),e.lineTo(88,228),e.moveTo(108,194),e.lineTo(112,228),e.stroke()})}function A(){return t(360,280,e=>{e.strokeStyle=u,e.lineWidth=1.8,e.lineJoin="round",e.fillStyle="#ba9264",e.beginPath(),e.moveTo(26,256),e.lineTo(54,130),e.lineTo(306,130),e.lineTo(334,256),e.closePath(),e.fill(),e.stroke(),e.fillStyle="#8f6040",e.beginPath(),e.roundRect(104,78,152,52,4),e.fill(),e.stroke(),e.fillStyle="#4c525e",e.beginPath(),e.moveTo(82,82),e.quadraticCurveTo(180,32,278,82),e.closePath(),e.fill(),e.stroke(),e.fillStyle="#3a2c24",e.beginPath(),e.moveTo(152,256),e.lineTo(152,192),e.arc(180,192,28,Math.PI,0),e.lineTo(208,256),e.closePath(),e.fill(),e.stroke(),e.fillStyle="#d94b3e",e.beginPath(),e.moveTo(256,48),e.lineTo(322,62),e.lineTo(256,78),e.closePath(),e.fill(),e.stroke()})}function D(){return t(260,260,e=>{e.strokeStyle=u,e.lineWidth=1.8,e.lineJoin="round";const o=e.createLinearGradient(60,72,200,232);o.addColorStop(0,"#b06848"),o.addColorStop(1,"#7d4129"),e.fillStyle=o,e.beginPath(),e.moveTo(64,72),e.quadraticCurveTo(36,152,68,232),e.quadraticCurveTo(130,246,192,232),e.quadraticCurveTo(224,152,196,72),e.closePath(),e.fill(),e.stroke(),e.fillStyle="#62a2ad",e.beginPath(),e.ellipse(130,72,68,18,0,0,Math.PI*2),e.fill(),e.stroke(),e.strokeStyle="rgba(224, 174, 128, 0.72)",e.lineWidth=4.2,e.beginPath(),e.moveTo(62,146),e.quadraticCurveTo(130,162,198,146),e.stroke()})}function z(){return t(480,270,(e,o,a)=>{const l=e.createRadialGradient(o/2,a/2,o*.36,o/2,a/2,o*.62);l.addColorStop(0,"rgba(247, 238, 212, 0)"),l.addColorStop(.75,"rgba(242, 224, 182, 0.14)"),l.addColorStop(1,"rgba(198, 162, 98, 0.34)"),e.fillStyle=l,e.fillRect(0,0,o,a),e.strokeStyle="rgba(184, 140, 72, 0.52)",e.lineWidth=2.4,e.lineCap="round";const i=16,r=26,n=[[i,i,1,1],[o-i,i,-1,1],[i,a-i,1,-1],[o-i,a-i,-1,-1]];for(const[h,s,f,p]of n)e.beginPath(),e.moveTo(h,s+p*r),e.lineTo(h,s),e.lineTo(h+f*r,s),e.stroke()})}const m=`
  float hash21(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * vnoise(p);
      p = p * 2.03 + vec2(17.1, 31.7);
      a *= 0.5;
    }
    return v;
  }
`;function $(e){return new d({transparent:!0,depthWrite:!1,uniforms:{uMap:{value:e},uTime:{value:0},uSing:{value:0},uPaddle:{value:0}},vertexShader:`
      uniform float uTime;
      uniform float uSing;
      uniform float uPaddle;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec3 pos = position;
        // Arch upper-right neck & head skyward when singing ("曲项向天歌")
        float neckMask = smoothstep(0.36, 0.88, uv.y) * smoothstep(0.28, 0.72, uv.x);
        float singWave = sin(uTime * 4.2) * 0.045;
        pos.y += neckMask * (uSing * 0.24 + singWave * uSing);
        pos.x -= neckMask * uSing * 0.14;
        // Kick bottom orange webbed feet back-and-forth when paddling ("红掌拨清波")
        float footMask = smoothstep(0.22, 0.03, uv.y);
        pos.x += footMask * sin(uTime * 8.0) * (0.04 + uPaddle * 0.11);
        pos.y += footMask * cos(uTime * 8.0) * (uPaddle * 0.045);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,fragmentShader:`
      uniform sampler2D uMap;
      varying vec2 vUv;
      void main() {
        vec4 col = texture2D(uMap, vUv);
        if (col.a < 0.02) discard;
        gl_FragColor = col;
      }
    `})}function H(e={}){return new d({transparent:!0,depthWrite:!1,uniforms:{uTime:{value:0},uGooseUv:{value:new S(.55,.78)},uReflectGlow:{value:.4},uAspect:{value:1.77},uBaseTint:{value:new v(e.baseTint??"#3f8776")},uTintStrength:{value:e.tintStrength??0},uReflectColor:{value:new v(e.reflectColor??"#f8faee")},uShimmerColor:{value:new v(e.shimmerColor??"#f5fcf0")},uFlowSpeed:{value:e.flowSpeed??2.1},uRipples:{value:[new g(-10,-10,10,0),new g(-10,-10,10,0),new g(-10,-10,10,0),new g(-10,-10,10,0)]}},vertexShader:`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:`
      uniform float uTime;
      uniform vec2 uGooseUv;
      uniform float uReflectGlow;
      uniform float uAspect;
      uniform vec3 uBaseTint;
      uniform float uTintStrength;
      uniform vec3 uReflectColor;
      uniform vec3 uShimmerColor;
      uniform float uFlowSpeed;
      uniform vec4 uRipples[4];
      varying vec2 vUv;
      ${m}

      void main() {
        float topFade = smoothstep(1.0, 0.72, vUv.y);
        float wave = sin(vUv.y * 46.0 - uTime * uFlowSpeed + vnoise(vUv * 8.0 + uTime * 0.25) * 4.5);
        float shimmer = smoothstep(0.65, 1.0, wave) * 0.12 * topFade;

        // Soft highlight reflection column beneath focal boat/moon/goose
        vec2 reflDelta = (vUv - vec2(uGooseUv.x, uGooseUv.y - 0.14)) * vec2(1.0, 2.8);
        float reflDist = length(reflDelta);
        float reflWave = sin(vUv.y * 72.0 - uTime * 3.0) * 0.02;
        float refl = exp(-pow((reflDist + reflWave) * 5.2, 2.0)) * uReflectGlow * topFade;

        // Concentric interactive & ambient ripple rings
        float ringGlow = 0.0;
        float warmTint = 0.0;
        for (int i = 0; i < 4; i++) {
          vec4 rp = uRipples[i];
          if (rp.w > 0.01 && rp.z < 2.2) {
            vec2 d = vUv - rp.xy;
            d.x *= uAspect * 0.55;
            d.y *= 1.45;
            float dist = length(d);
            float radius = 0.02 + rp.z * 0.21;
            float fade = (1.0 - rp.z / 2.2) * rp.w;
            float r1 = exp(-pow((dist - radius) * 68.0, 2.0));
            float r2 = exp(-pow((dist - radius * 0.62) * 84.0, 2.0)) * 0.65;
            ringGlow += (r1 + r2) * fade;
            warmTint += (r1 + r2) * fade * smoothstep(0.5, 1.0, rp.w);
          }
        }

        vec3 col = uBaseTint * uTintStrength * (0.68 + 0.32 * (1.0 - vUv.y));
        col += uShimmerColor * shimmer;
        col += uReflectColor * refl * 0.52;
        vec3 ringCol = mix(uShimmerColor, vec3(1.0, 0.88, 0.66), clamp(warmTint, 0.0, 0.7));
        col += ringCol * ringGlow * 0.75;
        float alpha = clamp(uTintStrength * 0.58 + shimmer + refl * 0.45 + ringGlow * 0.78, 0.0, 0.84) * topFade;
        if (alpha < 0.01) discard;
        gl_FragColor = vec4(col, alpha);
      }
    `})}function X(e={}){return new d({transparent:!0,depthWrite:!1,uniforms:{uTime:{value:0},uOpacity:{value:e.opacity??.7},uSpeed:{value:e.speed??.28},uLowColor:{value:new v(e.lowColor??"#8f70c7")},uHighColor:{value:new v(e.highColor??"#dec7f2")}},vertexShader:`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:`
      uniform float uTime;
      uniform float uOpacity;
      uniform float uSpeed;
      uniform vec3 uLowColor;
      uniform vec3 uHighColor;
      varying vec2 vUv;
      ${m}

      void main() {
        vec2 p = vUv;
        float sway = sin(p.y * 5.0 - uTime * 1.1) * 0.08 * p.y;
        float distX = abs((p.x - 0.5) + sway) / mix(0.24, 0.46, p.y);
        float mask = smoothstep(1.0, 0.15, distX) * smoothstep(0.0, 0.22, p.y) * smoothstep(1.0, 0.2, p.y);
        float n = fbm(vec2(p.x * 3.4 + sway * 2.0, p.y * 3.0 - uTime * uSpeed));
        float plume = smoothstep(0.32, 0.76, n) * mask;
        vec3 col = mix(uLowColor, uHighColor, p.y * 0.75 + n * 0.25);
        float alpha = plume * uOpacity;
        if (alpha < 0.01) discard;
        gl_FragColor = vec4(col, alpha);
      }
    `})}function E(){return new d({transparent:!0,depthWrite:!1,uniforms:{uTime:{value:0},uIntensity:{value:.5},uStarTint:{value:0}},vertexShader:`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:`
      uniform float uTime;
      uniform float uIntensity;
      uniform float uStarTint;
      varying vec2 vUv;
      ${m}

      void main() {
        float halfW = mix(0.32, 0.46, 1.0 - vUv.y);
        float edge = smoothstep(halfW, halfW * 0.28, abs(vUv.x - 0.5));
        float topSoft = smoothstep(1.0, 0.86, vUv.y);
        float botSoft = smoothstep(0.0, 0.16, vUv.y);

        float speed = mix(0.75, 1.45, clamp(uIntensity * 0.7, 0.0, 1.2));
        float n1 = fbm(vec2(vUv.x * 7.5, vUv.y * 4.4 + uTime * speed));
        float n2 = fbm(vec2(vUv.x * 13.0 + 3.1, vUv.y * 8.0 + uTime * speed * 1.45));
        float streaks = smoothstep(0.32, 0.78, n1 * 0.65 + n2 * 0.35);

        float foam = smoothstep(0.28, 0.02, vUv.y) * 0.38;
        vec3 baseCol = mix(vec3(0.76, 0.92, 0.96), vec3(0.99, 0.99, 0.98), streaks + foam);
        baseCol = mix(baseCol, vec3(0.86, 0.93, 1.0), uStarTint * 0.45);
        float alpha = edge * topSoft * botSoft * (0.45 + 0.55 * streaks + foam) * clamp(uIntensity, 0.0, 1.2);
        if (alpha < 0.01) discard;
        gl_FragColor = vec4(baseCol, clamp(alpha, 0.0, 0.95));
      }
    `})}function K(e={}){return new d({transparent:!0,depthWrite:!1,blending:b,uniforms:{uTime:{value:0},uOpacity:{value:e.opacity??0},uColorA:{value:new v(e.colorA??"#85b8ff")},uColorB:{value:new v(e.colorB??"#fff5cc")}},vertexShader:`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:`
      uniform float uTime;
      uniform float uOpacity;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      varying vec2 vUv;
      ${m}

      void main() {
        float curveX = mix(0.36, 0.92, pow(vUv.y, 0.82)) + sin(vUv.y * 5.0 + uTime * 0.4) * 0.03;
        float dist = abs(vUv.x - curveX);
        float width = mix(0.08, 0.24, vUv.y);
        float band = exp(-pow(dist / width, 2.0));
        float dust = fbm(vec2(vUv.x * 5.0 - uTime * 0.14, vUv.y * 5.5 + uTime * 0.22));
        float stars = smoothstep(0.74, 0.94, vnoise(vUv * 26.0 + uTime * 0.3)) * band;
        vec3 col = mix(uColorA, uColorB, dust * 0.65 + stars);
        float alpha = (band * (0.38 + dust * 0.45) + stars * 0.8) * smoothstep(0.0, 0.14, vUv.y) * uOpacity;
        if (alpha < 0.01) discard;
        gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.95));
      }
    `})}function N(e,o=.04,a=0){return new d({transparent:!0,depthWrite:!1,uniforms:{uMap:{value:e},uTime:{value:0},uSway:{value:o},uPhase:{value:a},uOpacity:{value:1},uBoost:{value:0}},vertexShader:`
      uniform float uTime;
      uniform float uSway;
      uniform float uPhase;
      uniform float uBoost;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec3 pos = position;
        float bend = smoothstep(0.05, 0.95, 1.0 - uv.y * 0.7);
        float amp = uSway * (1.0 + uBoost * 1.4);
        pos.x += sin(uTime * 1.85 + uPhase + uv.y * 2.8) * amp * bend;
        pos.z += cos(uTime * 1.4 + uPhase + uv.x * 2.5) * amp * 0.55;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,fragmentShader:`
      uniform sampler2D uMap;
      uniform float uOpacity;
      uniform float uBoost;
      varying vec2 vUv;
      void main() {
        vec4 tex = texture2D(uMap, vUv);
        if (tex.a < 0.02) discard;
        tex.rgb += vec3(1.0, 0.95, 0.82) * (uBoost * 0.12) * tex.a;
        tex.a *= uOpacity;
        gl_FragColor = tex;
      }
    `})}function Q(e="#ffd97a",o=.52,a=new S(.5,.5)){return new d({transparent:!0,depthWrite:!1,blending:b,uniforms:{uOpacity:{value:o},uTime:{value:0},uColor:{value:new v(e)},uOrigin:{value:a.clone()}},vertexShader:`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:`
      uniform float uOpacity;
      uniform float uTime;
      uniform vec3 uColor;
      uniform vec2 uOrigin;
      varying vec2 vUv;
      void main() {
        vec2 d = vUv - uOrigin;
        float r = length(d) * 2.0;
        float angle = atan(d.y, d.x);
        float beams = 0.72 + 0.28 * sin(angle * 8.0 + uTime * 0.45);
        float glow = exp(-r * r * 3.2) * beams * smoothstep(1.05, 0.15, r);
        gl_FragColor = vec4(uColor, glow * uOpacity);
      }
    `})}function Y(e="#cfe4ff",o=.36,a=new S(.72,.84)){return new d({transparent:!0,depthWrite:!1,blending:b,uniforms:{uTime:{value:0},uColor:{value:new v(e)},uOpacity:{value:o},uOrigin:{value:a.clone()}},vertexShader:`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:`
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform vec2 uOrigin;
      varying vec2 vUv;
      ${m}

      void main() {
        vec2 d = vUv - uOrigin;
        float coneDist = abs(d.x + d.y * 0.42);
        float spread = 0.08 + max(0.0, -d.y) * 0.56;
        float cone = smoothstep(spread, spread * 0.16, coneDist);
        float vertical = smoothstep(0.05, 0.42, vUv.y) * smoothstep(1.0, 0.65, vUv.y);
        float dust = smoothstep(0.45, 0.9, vnoise(vUv * 12.0 + vec2(0.0, -uTime * 0.22)));
        float alpha = cone * vertical * (0.68 + dust * 0.32) * uOpacity;
        gl_FragColor = vec4(uColor, clamp(alpha, 0.0, 0.68));
      }
    `})}function Z(e="#eaf7f2",o=.46){return new d({transparent:!0,depthWrite:!1,uniforms:{uTime:{value:0},uSpeed:{value:.78},uColor:{value:new v(e)},uOpacity:{value:o}},vertexShader:`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:`
      uniform float uTime;
      uniform float uSpeed;
      uniform vec3 uColor;
      uniform float uOpacity;
      varying vec2 vUv;

      void main() {
        float x = vUv.x;
        float wave1 = sin(x * 8.5 - uTime * uSpeed * 3.1) * 0.14 + 0.58;
        float wave2 = sin(x * 6.0 - uTime * uSpeed * 2.4 + 1.8) * 0.11 + 0.36;
        float r1 = exp(-pow((vUv.y - wave1) * 20.0, 2.0));
        float r2 = exp(-pow((vUv.y - wave2) * 24.0, 2.0));
        float dash1 = smoothstep(-0.2, 0.7, sin(x * 11.0 - uTime * uSpeed * 4.5));
        float dash2 = smoothstep(-0.1, 0.8, sin(x * 9.0 - uTime * uSpeed * 3.8 + 1.2));
        float edgeFade = smoothstep(0.0, 0.16, x) * smoothstep(1.0, 0.82, x);
        float alpha = (r1 * dash1 + r2 * dash2 * 0.8) * edgeFade * uOpacity;
        gl_FragColor = vec4(uColor, clamp(alpha, 0.0, 0.78));
      }
    `})}function c(e,o,a=.26){return new d({transparent:!0,depthWrite:!1,uniforms:{uTopColor:{value:new v(e)},uBottomColor:{value:new v(o)},uOpacity:{value:a}},vertexShader:`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:`
      uniform vec3 uTopColor;
      uniform vec3 uBottomColor;
      uniform float uOpacity;
      varying vec2 vUv;
      void main() {
        vec3 col = mix(uBottomColor, uTopColor, smoothstep(0.08, 0.92, vUv.y));
        float edgeMask = smoothstep(0.0, 0.22, vUv.y);
        gl_FragColor = vec4(col, uOpacity * (0.65 + 0.35 * edgeMask));
      }
    `})}export{G as A,I as B,w as S,K as a,Y as b,c,Q as d,X as e,H as f,Z as g,R as h,q as i,O as j,L as k,_ as l,M as m,N as n,W as o,J as p,B as q,F as r,U as s,V as t,E as u,$ as v,z as w,D as x,A as y,j as z};
