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
