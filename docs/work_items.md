# Handcrafted Haven – Work Plan 

Team roles
- Steven Kemendics: integration / Vercel / board + helping connect frontend and backend
- Olaniyi Bello: frontend pages and UI
- Daniel Olayinka Oyeniyi: backend (database + API routes + auth)

How we will avoid blocking each other
- We keep two small docs updated: `docs/models.md` (field names) and `docs/api.md` (endpoints).
- Olaniyi can build pages with mock data first and switch to the real API later.
- Daniel builds the “basic working version” of endpoints first, then improves validation.
- Steven merges often and makes sure Vercel stays working. If someone finishes early, they help with testing and bug fixes.


## Week 1 (setup + start)
Group requirements this week
- Create the Next.js app with:
  - create-next-app@latest
  - TypeScript: Yes
  - ESLint: Yes
  - Tailwind: No
  - src directory: Yes
- Update the GitHub board (columns, tasks, assignments).
- Start the landing page (simple start is fine).
- Review work items and make async assignments before next meeting.

Steven (integration / devops)
- Make sure the Next.js project is pushed to GitHub and deploys on Vercel.
- Confirm Vercel settings (root directory correct, build passes).
- Add `web/.env.example` (no real secrets).
- Keep the project board organized and make sure Week 1 tasks are listed.

Olaniyi (frontend)
- Start the landing page (basic text + sections is enough).
- Create simple page shells: home, catalog, product detail, seller profile, login/register, seller dashboard shell.
- Use mock JSON for products so progress doesn’t depend on backend.

Daniel (backend)
- Pick the database option (MongoDB or Postgres) and test the connection.
- Write `docs/models.md` (Seller, Product, Review fields).
- Start API route skeletons (even simple placeholder responses).
- Start auth/roles plan (seller vs user).


## Week 2 (products)
Steven
- Help connect frontend to real product endpoints and keep Vercel stable.
- Help with merging PRs and quick tests after merges.

Olaniyi
- Build seller product UI: add product form, edit product form, “my products” list.
- Improve catalog page (product cards).
- Connect to API when ready (keep mock working until then).

Daniel
- Build product endpoints:
  - list products (with filters later)
  - product detail
  - seller-only create/edit/delete
- Add basic validation and permission checks.


## Week 3 (reviews + seller profiles + filters)
Steven
- Help integrate reviews end-to-end and keep deployment stable.
- Quick end-to-end test: create product → view product → add review → see rating.

Olaniyi
- Add reviews UI on product detail (stars + text + list).
- Finish seller public profile page (bio/story + their products).
- Finish filter UI and connect it to the API.

Daniel
- Seller profile endpoints (public profile + seller update).
- Reviews endpoints (create + list).
- Make errors consistent and improve validation.


## Week 4 (final polish)
Steven
- Final Vercel checks (env vars, no broken routes).
- Run a simple test checklist and help fix bugs.
- Make sure the board looks complete for submission.

Olaniyi
- Accessibility basics: keyboard, focus, labels, alt text, contrast.
- Responsive polish (mobile/tablet/desktop).
- Basic SEO: page titles and good headings.

Daniel
- Final permission checks (seller-only actions really protected).
- Input validation cleanup and stable error responses.

End goal
- Working app on Vercel with seller profiles, products, filters, and reviews/ratings.
- Board updated and ready for submission evidence.