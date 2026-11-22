# eunicelopez.com

Source of [eunicelopez.com](https://eunicelopez.com), the website of **Eunice López Suárez**: historian, speaker and event operations architect.

Static HTML, CSS and vanilla JavaScript, served by GitHub Pages. No framework and no build step: every page is a folder with its own `index.html`.

## What lives here

### Historia Viva (Spanish)
The history of Latin American women, told for women today.

| Page | What it is |
|---|---|
| [`/`](https://eunicelopez.com) | Home: who I am, talks and community |
| [`/webinar/`](https://eunicelopez.com/webinar/) | Free live class |
| [`/carta/`](https://eunicelopez.com/carta/) | Weekly newsletter sign-up |
| [`/regalos/`](https://eunicelopez.com/regalos/) | Free interactive resources |
| [`/testimonios/`](https://eunicelopez.com/testimonios/) | Testimonials |

**Interactive lead magnets**, each a single page with no dependencies:
[`/herencia/`](https://eunicelopez.com/herencia/) (quiz on inherited beliefs about work and money) ·
[`/a-tu-edad/`](https://eunicelopez.com/a-tu-edad/) (what your grandmother couldn't do at your age) ·
[`/dinero/`](https://eunicelopez.com/dinero/) ·
[`/emprender/`](https://eunicelopez.com/emprender/) ·
[`/aumento/`](https://eunicelopez.com/aumento/) ·
[`/decir-no/`](https://eunicelopez.com/decir-no/) ·
[`/decision/`](https://eunicelopez.com/decision/) ·
[`/estudio-apellido/`](https://eunicelopez.com/estudio-apellido/)

### Events (English)
Production and operations for virtual and hybrid B2B conferences.

| Page | What it is |
|---|---|
| [`/events/`](https://eunicelopez.com/events/) | Virtual conference production |
| [`/speaker-workflow/`](https://eunicelopez.com/speaker-workflow/) | Assessment: where your speaker workflow breaks |
| [`/on-time/`](https://eunicelopez.com/on-time/) | Assessment: is your event on schedule? |

## How it's built

- **Funnels:** forms send leads to GoHighLevel, where workflows handle the follow-up.
- **Analytics:** GA4 and Microsoft Clarity, with UTM tracking for every post, reel and email.
- **Workflow:** pages are designed and edited with [Claude Code](https://claude.com/claude-code); a push to `main` deploys in a minute or two.

## Repo layout

```
<page>/index.html   one folder per page
img/                shared images
CNAME               custom domain for GitHub Pages
sitemap.xml         indexed pages
robots.txt
```

Pages marked `noindex` (private offers, client review pages, internal tools) are reachable by link only and stay out of search and out of this list.

---

© Eunice López Suárez. The content and images are mine; please ask before reusing them.
