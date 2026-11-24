# SVG visual audit and maintainer preview checklist

**Status:** Structural/source audit completed; visual rendering has not been performed. Please confirm the changes using screenshots before considering the visuals fixed.

## Findings and changes

### Hero (light and dark)
- **Found:** The original rising curve and milestone circles ran through the left text area, including the subtitle. The layout had no reserved illustration region.
- **Changed:** Reworked both SVGs into a left text region and a separate right illustration region with a generous gap. The curve and nodes are restricted to the right region; the sprout sits in its own lower-right area. The two versions use matching geometry with theme-specific contrast colors.
- **Animation:** SMIL `<animate>` for dashed stroke offset and milestone radius/fill pulse; SMIL `<animateTransform>` for gentle sprout-leaf movement. No CSS keyframe animations.
- **Static fallback:** The complete base curve, static markers and sprout remain visible underneath. A reduced-motion CSS rule hides the decorative motion overlay. GitHub's sanitizer/theme image proxy may alter CSS/SMIL support; this reduced-motion behavior is not yet verified there.

### Evidence trail
- **Found:** The original 14px supporting labels could shrink to very small text in a narrow README, and the SVG had no background so dark labels could lose contrast on a dark page.
- **Changed:** Removed the tiny supporting text, increased the stage labels from 20px to 26px, and added a paper background. Five stage labels remain: Learn, Practice, Create, Demonstrate and Review.
- **Animation:** SMIL dash-offset flow on the connecting line and five SMIL radius/fill pulses timed in sequence over a 6-second cycle.
- **Static fallback:** The static line, node circles and labels remain complete; CSS reduced-motion hides the pulse/animated overlay. GitHub rendering has not been verified.

### Six competency icons
- **Audit finding (source/geometry only):** All six are compact 48×48 vector icons with a `role="img"` and `<title>` accessible label. No text is drawn inside the icons, no external resources or scripts are present, and the inspected paths/strokes remain inside the viewBox with a small stroke-safe margin. The line colors are orange/green and have good contrast against both light and dark backgrounds by source color inspection.
- **Change:** No icon geometry was changed because no source-level overlap, clipping or text-size issue was detected. Visual confirmation is still needed.

## Animation implementation and GitHub README behavior

- Hero light/dark: **SMIL** (dash movement, milestone pulses and leaf transforms). CSS is only used for the `prefers-reduced-motion` fallback that hides the motion overlay.
- Evidence trail: **SMIL** (dashed-line movement and sequential node pulses). CSS is only used for reduced-motion fallback.
- Competency architecture, coding, debugging, fundamentals, testing and validation: **static SVGs; no animation**.

The README uses `<picture>` with theme-specific `<source>` elements. Source selection itself should not disable an SVG's animation; the selected SVG is still loaded as an image. **However, this was not confirmed in GitHub's rendered README.** Public reports differ on what GitHub's SVG sanitizer/image proxy retains, particularly for CSS animation. SMIL was chosen for the moving visuals, but please verify the actual README preview.

## Checklist — please complete after opening the PR

- [ ] Hero light version: heading and subtitle are unobstructed; curve, markers and sprout stay in their separate illustration region.
- [ ] Hero dark version: contrast is comfortable; same layout separation.
- [ ] Hero motion: dashed line flows continuously, markers pulse, sprout leaves move gently.
- [ ] Evidence trail: labels remain readable; pulses visibly move from Learn → Practice → Create → Demonstrate → Review.
- [ ] Competency architecture icon.
- [ ] Competency coding icon.
- [ ] Competency debugging icon.
- [ ] Competency fundamentals icon.
- [ ] Competency testing icon.
- [ ] Competency validation icon.
- [ ] Reduced motion: enable OS/browser reduced-motion preference and reload; motion stops and a complete static illustration remains.
- [ ] Screenshot the README in both light and dark GitHub themes. Share screenshots before calling the visual fixes confirmed.

## Preview every SVG directly in a browser (no renderer/tool needed)

1. Open the repository's `fix/readme-hero-visuals` branch on GitHub.
2. Navigate to `docs/assets/`, select one SVG and click **Raw**. This opens the standalone vector in a browser tab. For a direct shortcut, open the raw links below.
3. Repeat for every file; do not use the GitHub source-code view as the visual preview.
4. The raw view lets you inspect the SVG as a browser image, but it does not prove GitHub README image-proxy behavior.

### Raw-file links

- [Hero — light](https://raw.githubusercontent.com/MANayab/Growvidence/fix/readme-hero-visuals/docs/assets/growvidence-hero-light.svg)
- [Hero — dark](https://raw.githubusercontent.com/MANayab/Growvidence/fix/readme-hero-visuals/docs/assets/growvidence-hero-dark.svg)
- [Evidence trail](https://raw.githubusercontent.com/MANayab/Growvidence/fix/readme-hero-visuals/docs/assets/evidence-trail.svg)
- [Competency — architecture](https://raw.githubusercontent.com/MANayab/Growvidence/main/docs/assets/competency-architecture.svg)
- [Competency — coding](https://raw.githubusercontent.com/MANayab/Growvidence/main/docs/assets/competency-coding.svg)
- [Competency — debugging](https://raw.githubusercontent.com/MANayab/Growvidence/main/docs/assets/competency-debugging.svg)
- [Competency — fundamentals](https://raw.githubusercontent.com/MANayab/Growvidence/main/docs/assets/competency-fundamentals.svg)
- [Competency — testing](https://raw.githubusercontent.com/MANayab/Growvidence/main/docs/assets/competency-testing.svg)
- [Competency — validation](https://raw.githubusercontent.com/MANayab/Growvidence/main/docs/assets/competency-validation.svg)

## Verify animation on GitHub

1. Open the Draft PR and its README preview.
2. Check the hero. Confirm the `<picture>` selects the correct light/dark SVG and that SMIL motion visibly plays.
3. Check the evidence trail; observe pulses in the requested five-stage order.
4. Reload and wait for at least one full loop.
5. On Windows, set **Settings → Accessibility → Visual effects → Animation effects** to Off (or enable reduced-motion in your browser/device), reload the README and check that static content is complete and motion is suppressed.
6. If motion or reduced-motion fails, capture screenshots and report which browser, GitHub page/theme and setting were used. No visual fix will be considered confirmed until screenshots are reviewed.
