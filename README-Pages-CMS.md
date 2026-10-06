# Palm 11 Projects — Pages CMS setup

This site copy is wired to the hosted Pages CMS using `.pages.yml` and `data/projects.json`.

## Connect it to the client’s GitHub repository

1. Sign in at [Pages CMS](https://app.pagescms.org/) with the GitHub account that can write to the repository, install/authorize the Pages CMS GitHub App for that repository, and open the repository.
2. Open **Projects** in Pages CMS. It edits the structured list in `data/projects.json`; uploaded project photos are stored under `images/projects/` and served from `/images/projects/`.
3. Commit edits from Pages CMS. GitHub Pages will publish the changed site through its existing deployment setup.

## Content model

The project editor includes title, slug, location, client/customer type, category, status, short and full descriptions, hero image, gallery, technologies, capacity metrics, timeline, challenge, Palm 11 solution, system architecture, implementation, results, related articles, featured toggle, and SEO title/description.

The project page loads the JSON file and renders the cards and case study from it. Keep project image uploads inside the configured project media source so the stored paths work on GitHub Pages.
