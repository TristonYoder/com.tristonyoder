# com.tristonyoder

Source for [tristonyoder.com](https://tristonyoder.com) — a minimal catch-all landing page linking out to the handful of places worth pointing people (projects, GitHub, docs, etc).

Plain HTML/CSS/JS, no build step, deployed to GitHub Pages via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) on push to `main`. Same blueprint theme and card system as [adhd.tristonyoder.com](https://adhd.tristonyoder.com).

## Adding a link

Edit [`links.js`](links.js) — add an object to the `PROJECTS` array. Only `name` is required; everything else (icon, tagline, description, tags, links) is optional and degrades gracefully. See the comment at the top of the file.
