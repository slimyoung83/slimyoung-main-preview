# Slimyoung website copy and design rules

User-confirmed 2026-10-28. Apply to Product Design samples, Figma detail design and website implementation.

- Do not add decorative small slogans, meaningless English copy, repeated English captions or repeated brand labels outside the logo without a functional purpose.
- Do not expose sample/proposal/test/development commentary in the public website. Do not fill whitespace with invented supporting copy.
- Prioritize actual photos, video, approved core headings, actual content and necessary buttons.
- Preserve brand logos, verified clinical information, mandatory disclosures, privacy consent and necessary usage/status explanations.
- Do not conceal unconnected booking behavior or imply successful submission. Do not connect backend/booking services without authorization.
- If removal could hide medical/legal/functional context, preserve it and report the ambiguity for review.
- Copy cleanup does not authorize layout, imagery, color, typography, animation or CTA redesign.
- This task is desktop-only at 1920/1440; mobile 390 content and design remain unchanged.
- The rollback commit 42d0ebc736c5512858bbde7c89fb6be982fe5bb7 is the baseline. Do not reapply the rejected Product Design PC layout.
- Work on a separate branch and follow the public-test workflow below. The user's 2026-10-29 policy supersedes the former per-deployment approval requirement.

## Public test workflow — user-confirmed 2026-10-29

Scope: ONLY slimyoung83/slimyoung-main-preview and https://slimyoung83.github.io/slimyoung-main-preview/.

1. Receive the user's requested change.
2. Implement on a separate work branch and preserve the last known-good commit.
3. Run appropriate local regression checks and verify existing functionality.
4. If checks pass, safely fast-forward or normally merge the tested work into public preview main; do not request deployment approval each time.
5. Check GitHub Pages build/deploy and inspect the published site where browser access permits.
6. Report the URL, commit, checks, failures and unverified items to the user.
7. Respond to further revision or rollback requests, preserving Git history.

Exceptions: do not automatically deploy work explicitly paused, held or awaiting approval. Design-selection mockups are never auto-published. Confirm scope first for major structural changes or risk of original-data loss. Do not claim inaccessible browser checks passed. Never force-push or delete history.

Protected without separate explicit authorization: slimyoung83/slimyoung-main-homepage (entire private source repository), slimyoung.co.kr/Cafe24 production, slimyoung26jp, customer/reservation data, production servers and databases. Test-site authorization does not extend to these targets.

## Permanent PC caption prohibition — user-confirmed 2026-10-29

- Applies to every PC section 01–07 and both fixed consultation interfaces in future edits.
- Never add decorative English captions, temporary explanatory captions, development/test/sample/preview status, photo-slot/data-entry waiting text, design explanations, unnecessary video descriptions, repeated selection instructions, repeated brand labels or small text used to fill space.
- Do not invent supporting captions unless explicitly requested by the user. After removing captions, collapse their unnecessary space and align the remaining title, media and controls naturally.
- Preserve actual content titles, navigation, button labels, mandatory privacy consent, legal/medical-advertising disclosures and essential safety/function notices.
- Keep the consultation service unconnected; clicks must retain the non-submission notice. Never imply a booking was received.
- Video titles must be verified source titles, never numbered temporary titles. If source metadata cannot be verified, omit the title instead of guessing; report the limitation.
- Current exception to the earlier layout freeze: only PC section 02 YouTube layout is authorized to change. Preserve PC 01 and 03–07, and all mobile 390px design/content/behavior.
- Section 02: one large left video, three equal-height right rows with titles at their right; align the thumbnail stack's top/bottom with the featured thumbnail. No cards, panel backgrounds, decorative captions or letterbox padding. Playback remains 16:9.
- Current work starts from b79654a2929977881e391bb287c8833f5b6769f9. Preserve this recovery point and all Git history.
