<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## E-Chowk UI prototype
- Use shared AnimatedLogo for all brand placements; animate extracted uploaded emblem layers with global CSS and disable motion for reduced-motion preferences.
- Keep all marketplace records and actions behind the in-memory demo provider and mock-service adapter; this prototype complements the existing NestJS APIs without claiming live integrations.
- Keep canonical entity fields and role/job status unions in the browser-safe domain model; alignment makes future API replacement explicit.
- Share app navigation and confirmation controls across leaf routes, with role-aware desktop and mobile navigation; every demo screen must remain independently addressable.
- Use AI Elements for the simulated chat surface and retain conversation messages only in the current app session; no gateway or secret is needed for mock intent responses.
- Keep visual styling and semantic palette in the global design system; domain screens use reusable class roles rather than hardcoded colors.
- Derive demo identity from explicit worker/employer workspace URLs in the shared provider and retain it for shared screens; direct links must show consistent sample accounts without implying authentication.
- All backend calls go through src/lib/e-chowk/api.ts (single base URL, bearer session in localStorage, 401 clears session); signed-in screens use live data, signed-out screens keep sample data so the prototype stays browsable.