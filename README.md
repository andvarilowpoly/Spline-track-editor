# Spline Track Editor

**Track Spline Generator v0.91**: a browser-based editor that turns a 2D race-track layout (a minimap image or a hand-drawn line) into a 3D spline and a full game-ready scene.

**Live app:** https://trackspline.vercel.app · **Manual:** https://trackspline.vercel.app/manual · *Versión en español: [README.es.md](README.es.md)*

The track is solved as a real 3D road. Crossings become bridges and tunnels with guaranteed clearance, and the elevation is smoothed by an optimizer that respects grade and vertical-radius limits. Banking is computed per curve. Around the track you can build terrain, hills, rivers, lakes, vegetation and track items. You can then export everything to Blender, 3ds Max, glTF/GLB, FBX, JSON or OBJ.

The UI is available in **Spanish and English** (Settings → Idioma / Language).

## Features

- **Input**
  - Trace a track from a minimap image: thresholding, skeleton, graph, then the main route plus alternative routes. You can also draw one by hand or start from built-in samples.
- **Spline editing**
  - Move, rotate and scale points or segments.
  - Straighten, smooth or set a fixed curve radius.
  - Create helixes, loops and forks.
  - Draw shortcuts and alternative routes.
- **Sections**
  - Give stretches of the track their own width, texture, edges and type: track, bridge (with pillars), trench or covered.
- **Elevation**
  - Automatic rolling hills plus a QP solver that enforces max grade, vertical radii and bridge/tunnel clearance.
  - Or edit the profile directly.
- **Crossings**
  - Over/under passes are detected and fixed automatically, with ramps.
- **Track appearance**
  - Banking, track mesh density with curvature-adaptive optimization (UVs preserved), crash barriers, dirt roads and collision meshes.
- **Terrain**
  - A terrain mesh that never cuts through the track.
  - Painted subdivision and sculpted relief.
  - Hills with tunnels, shaped with a lattice, type and plateau controls.
- **Water**
  - Rivers, lakes and waterfalls with carved or resting beds, wall styles and angles, textures and flow.
  - Each can carry its own decoration.
- **Vegetation and decoration**
  - Tree and grass groups.
  - Decoration sets (cubes or planes as placeholders for your own `.glb`/`.fbx` models).
  - Shadow planes driven by the sun angle.
- **Track items**
  - Nitro strips, coin stripes with spinning coins, turbo pads, puddles, curve signage, triggers and invisible path nodes.
- **Game camera**
  - Drive along the track to preview it in play.
- **Search** (Ctrl+K) across every tool and parameter.
- **Autosave**, rebindable keyboard shortcuts, and project files in `.json`.

## Getting started

Requirements: **Node.js 18+** (recommended) or **Python 3**. There is nothing to install. three.js, with its GLTF/FBX loaders and the GLTF exporter, is bundled in `vendor/`.

| OS | Double-click | Or from a terminal |
| --- | --- | --- |
| Windows | `iniciar.bat` | `node server.js` |
| macOS | `iniciar.command` | `node server.js` |
| Linux | `iniciar.sh` | `node server.js` |

The app opens at `http://localhost:5173`. If the port is taken, run `PORT=5174 node server.js`. Running `python3 -m http.server 5173` inside the folder also works.

## Export formats

| Target | What you get |
| --- | --- |
| **Blender** (`.py`) | 3D Bézier curves per route. Each knot stores `radius` = half width and `tilt` = banking, with a bevel profile so the road shows up immediately. |
| **3ds Max** (`.ms`) | Bézier SplineShapes plus left/right edge splines. Per-knot widths and banking are stored in User Properties. |
| **GLB / FBX** | The full 3D scene: track, edges, terrain, hills, tunnels, water, vegetation, decoration, items and nodes, as separate named objects with embedded textures. |
| **JSON** | Every sample per route (`s, x, y, z, width, roll_rad, grade`), the crossings, the parameters and the source project. |
| **OBJ** | 3D polylines. |

Conventions: meters, Z up, XY as the plan view. Exported object and material names are in Spanish (`ruta_principal`, `cerro_01`, `nodo_0`…) regardless of the UI language.

## How it works

- **Image → layout:** Otsu thresholding, morphological closing and Zhang-Suen skeletonization. The result becomes a node/edge graph. At each junction the route follows the straightest branch, and the longest loop becomes the main route.
- **Spline:** centripetal Catmull-Rom, resampled at a uniform arc-length step.
- **Crossings:** segment intersection plus overlap windows. The rule `z_top − z_bottom ≥ clearance + deck` must hold over the whole overlap.
- **Elevation:** periodic low-harmonic noise plus cosine ramps at crossings, refined by a QP solver. The solver is ADMM with banded Cholesky and Woodbury. It minimizes curvature under the grade, vertical-radius and clearance constraints, in about 10–80 ms per solve.

## Project structure

```
index.html, styles.css         UI
manual.html                    user manual (served at /manual)
server.js                      dependency-free local server
build-static.js, vercel.json   static build for Vercel (dist/)
js/app.js                      UI controller
js/i18n.js, js/i18n-en.js      translation layer (Spanish source → English)
js/trace.js, trace-worker.js   image → graph → routes
js/build.js                    routes in meters, crossings, overlaps
js/elevation.js, solver.js     elevation model and QP solver
js/scene.js, tunnels.js, rivers.js   terrain, hills, tunnels, water, trees
js/export*.js                  Blender / 3ds Max / JSON / OBJ / GLB / FBX
js/editor2d.js, profile.js, preview3d.js, gamecam.js   views
vendor/                        three.js and helpers (see their LICENSE files)
test/                          core and UI tests
```

## Tests

```
npm test            # core tests: geometry, elevation, terrain, export, i18n
npm run test:ui     # UI tests in headless Chromium (needs: npm install)
```

## Deploying

The app is fully static. `node build-static.js` writes `dist/`, and `vercel.json` is already set up for Vercel.

## Known limitations

- No anti-gravity sections: every crossing is a bridge or a tunnel.
- Spirals whose stretches overlap in plan without crossing are flagged but not fixed automatically.
- Minimaps with icons or text over the track may need a threshold tweak or a cleaned-up image.
- Hills are heightfields, so they have no overhangs.

## Third-party

[three.js](https://threejs.org) (MIT) and [delaunator](https://github.com/mapbox/delaunator) (ISC). Both are bundled in `vendor/` with their licenses.
