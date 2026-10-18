# SVR Kishore — portfolio

A static, single-page portfolio with no build step or runtime dependencies.

## Deploy with GitHub Pages

1. Put the **contents of this folder** at the root of a GitHub repository. Keep `.github/workflows/`, `assets/`, `data/`, and `scripts/` at the repository root alongside `index.html`.
2. Push the `main` branch.
3. In the repository, open **Settings → Pages** and set the source to **GitHub Actions**.
4. The `Deploy portfolio to GitHub Pages` workflow publishes the site on pushes to `main`. It also republishes after a successful profile-data sync so updated JSON snapshots reach the live site. The deployment URL appears in the workflow run and in the Pages settings.

## Deploy with Vercel

Import the repository in Vercel and use the portfolio folder as the project root if it is inside a larger repository. Leave the framework preset as **Other**, with no build command and `.` as the output directory. The site is static; its relative asset and JSON paths work on a project subpath as well.

## Profile data sync

The workflow in `.github/workflows/sync.yml` refreshes GitHub projects, LeetCode, and GeeksforGeeks profile stats on a schedule and supports manual runs from the Actions tab. Successful syncs update the local JSON snapshots; the page checks those files every minute. Runs may be delayed, and the platforms do not send live solve events directly to this static site.

Update usernames and profile addresses in `scripts/config.json`. GeeksforGeeks exposes limited public stats, so its sync may only provide problems solved, coding score, and institute rank when available. Keep GitHub Actions enabled and allow the workflow to write repository contents so refreshed snapshots can be committed.

## Contact and resume

The contact form validates in the browser and opens a prefilled email using `mailto:`. The footer currently offers a resume request by email because a resume PDF has not been added. To offer a download, place the approved PDF at `assets/Kishore-Resume.pdf` and change the footer link in `index.html` to that file.

## Local preview

Run a static server from this folder (for example, `python -m http.server`) and open the local address it prints. Serving the files over HTTP lets the browser read the JSON snapshots.
