# Go La Habra

Where to eat and what's happening in La Habra, CA. Static site built with [Astro](https://astro.build), hosted on Cloudflare Pages. Every push to `main` deploys.

## Adding content

All content is plain files. Anything with `"draft": true` (or `draft: true` in a post) shows when running locally but never goes live.

| What | Where | Notes |
| --- | --- | --- |
| Restaurants | `src/data/restaurants.json` | `id` must be unique (e.g. `taqueria-el-sol`). `tags` must be one of the listed values in `src/content.config.ts`. Optional `photo` (put the file in `public/photos/` and use `/photos/name.jpg`). |
| News | `src/content/news/<slug>.md` | Filename becomes the URL. Front matter: `title`, `dek`, `date`, `category`, optional `image`. |
| Events | `src/data/events.json` | Past events drop off automatically. |
| Football | `src/data/games.json` | `school` is `lhhs`, `sonora`, or `wchs`. Use `status: "final"` with `us`/`them` scores, or `"upcoming"`. |

If an entry doesn't match the schema, the build fails instead of shipping a broken page.

## Settings

- Contact email, social links: `src/lib/site.ts`
- Newsletter: set `PUBLIC_NEWSLETTER_URL` in Cloudflare Pages environment variables once Beehiiv/Buttondown is set up. Until then the signup forms show "Coming soon".

## Run locally

```
npm install
npm run dev      # http://localhost:4321, drafts visible
npm run build    # production build into dist/, drafts hidden
npm run check    # type and schema check
```
