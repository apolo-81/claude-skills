/* ============================================================================
   scrollcraft-anchors: labels that follow a real part of a scrubbed clip
   ----------------------------------------------------------------------------
   Opt-in companion to scrollcraft.js. Load it after the engine. It does NOT touch the
   engine: it only reads video.currentTime, which the engine's playhead already smooths.

   Why it exists: the apolo-tek pilot's signature move (diagnostic callouts that track the
   parts of a laptop as the camera moves) generalised. Any scrubbed clip with identifiable
   things in it (a product's parts, a map's places, a body's regions) can carry labels that
   stay attached to them, at any viewport, because the anchor is stored in SOURCE-FRAME
   coordinates and converted with the same maths object-fit does.

   Markup (real HTML, selectable, translatable):

     <div data-sc-stage id="stage">
       <img class="sc-stage__poster" id="poster" src="..." alt="">
       <video data-sc-scrub id="clip" data-sc-src="..."></video>
       <div class="callouts" id="layer">
         <svg id="lines" aria-hidden="true"></svg>
         <div class="callout" data-id="fan"><h3>Fan</h3><p>...</p></div>
       </div>
     </div>

   Script:

     ScrollCraftAnchors.mount({
       stage: '#stage', video: '#clip', poster: '#poster', layer: '#layer', svg: '#lines',
       size: [1280, 720],          // source frame size in px (the master, not the encode)
       clipStart: 4.4,             // master time at which this clip's first frame sits
       staticAt: 8.0,              // master time shown when motion is off (every label visible)
       pos: [0.5, 0.5],            // object-position of the cover fit; or { small: [.42,.5], large: [.5,.5] }
       small: '(max-width: 860px)',
       parts: {
         fan: { on: [6.5, 6.9, 11.0, 11.5],   // fade in t0..t1, fade out t2..t3 (master time)
                kf: [[6.0, .66, .57], [7.5, .60, .55]] }   // [time, x, y] normalised 0..1 in the source frame
       }
     });

   Do NOT guess the keyframes. Generate a marker sheet with scripts/anchors-sheet.mjs, look at it,
   adjust, repeat. Positions drift between frames whenever the camera moves or the scene changes scale.
   ========================================================================== */
(function (global) {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  function $(x) { return typeof x === 'string' ? document.querySelector(x) : x; }
  function sstep(x) { x = x < 0 ? 0 : x > 1 ? 1 : x; return x * x * (3 - 2 * x); }

  function interp(kf, t) {
    if (t <= kf[0][0]) return [kf[0][1], kf[0][2]];
    for (var i = 1; i < kf.length; i++) {
      if (t <= kf[i][0]) {
        var a = kf[i - 1], b = kf[i], u = (t - a[0]) / (b[0] - a[0]);
        return [a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
      }
    }
    var l = kf[kf.length - 1];
    return [l[1], l[2]];
  }

  // The cover fit. Same maths as object-fit: cover + object-position, so an anchor lands on the
  // same part of the picture whatever the box is: full-bleed desktop, phone band, anything.
  function toPx(nx, ny, box, st, size, pos) {
    var s = Math.max(box.width / size[0], box.height / size[1]);
    var ox = (box.width - size[0] * s) * pos[0], oy = (box.height - size[1] * s) * pos[1];
    return [box.left - st.left + ox + nx * size[0] * s, box.top - st.top + oy + ny * size[1] * s];
  }

  function mount(o) {
    var stage = $(o.stage), video = $(o.video), poster = $(o.poster), layer = $(o.layer), svg = $(o.svg);
    var size = o.size || [1280, 720];
    var smallMQ = matchMedia(o.small || '(max-width: 860px)');
    var reduce = (global.ScrollCraft && global.ScrollCraft.reduce) ||
                 matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce && poster && o.posterStatic) poster.src = o.posterStatic;

    var items = Array.prototype.map.call(layer.querySelectorAll('.callout'), function (el) {
      var part = o.parts[el.getAttribute('data-id')];
      if (!part) return null;
      var line = document.createElementNS(NS, 'line'), dot = document.createElementNS(NS, 'circle');
      dot.setAttribute('r', o.dotRadius || '4');
      line.style.opacity = dot.style.opacity = 0;
      svg.appendChild(line); svg.appendChild(dot);
      return { el: el, part: part, line: line, dot: dot };
    }).filter(Boolean);

    function posFor() {
      var p = o.pos || [0.5, 0.5];
      if (p.small || p.large) return smallMQ.matches ? (p.small || p.large) : (p.large || p.small);
      return p;
    }

    var lastSig = '', raf = 0, dead = false;
    function frame() {
      if (dead) return;
      var t = reduce ? (o.staticAt != null ? o.staticAt : o.clipStart) : (o.clipStart || 0) + (video.currentTime || 0);
      var st = stage.getBoundingClientRect(), box = video.getBoundingClientRect(), pos = posFor();
      var op = pos[0] * 100 + '% ' + pos[1] * 100 + '%';
      video.style.objectPosition = op; if (poster) poster.style.objectPosition = op;
      var sig = [];
      items.forEach(function (it) {
        var p = it.part;
        var a = sstep((t - p.on[0]) / (p.on[1] - p.on[0])) * (1 - sstep((t - p.on[2]) / (p.on[3] - p.on[2])));
        it.el.style.opacity = a;
        it.line.style.opacity = it.dot.style.opacity = a;
        sig.push(Math.round(a * 20));
        if (a <= 0.001) return;
        var k = interp(p.kf, t), pt = toPx(k[0], k[1], box, st, size, pos);
        var r = it.el.getBoundingClientRect(), lx = r.left - st.left, ly = r.top - st.top;
        // nearest point on the label's border to the anchor
        var sx = Math.min(Math.max(pt[0], lx), lx + r.width), sy = Math.min(Math.max(pt[1], ly), ly + r.height);
        // the guide draws from the label to the part as the label fades in
        var d = sstep((t - p.on[0]) / ((p.on[1] - p.on[0]) * 1.6));
        it.line.setAttribute('x1', sx); it.line.setAttribute('y1', sy);
        it.line.setAttribute('x2', sx + (pt[0] - sx) * d); it.line.setAttribute('y2', sy + (pt[1] - sy) * d);
        it.dot.setAttribute('cx', pt[0]); it.dot.setAttribute('cy', pt[1]);
        sig.push(Math.round(pt[0] / 8), Math.round(pt[1] / 8));
      });
      // Tell the verification harness what is actually painted, so a stage that moves only through
      // this layer is not read as dead scroll. Rounded on purpose: raw progress would defeat the check.
      var s = sig.join(',');
      if (s !== lastSig) { lastSig = s; layer.setAttribute('data-sc-verify-state', s); }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return { destroy: function () { dead = true; cancelAnimationFrame(raf); }, interp: interp, toPx: toPx };
  }

  global.ScrollCraftAnchors = { mount: mount, interp: interp, toPx: toPx };
})(window);
