#!/usr/bin/env python3
"""Fetch public portfolio data. Writes each destination only after a valid response."""
from datetime import datetime, timezone
from pathlib import Path
from base64 import b64decode
import argparse, json, os, re, sys, urllib.error, urllib.request
from html import unescape
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
CONFIG = json.loads((Path(__file__).parent / "config.json").read_text(encoding="utf-8-sig"))
GITHUB_USER = CONFIG["github_username"]
LEETCODE_USER = CONFIG["leetcode_username"]
GFG_URL = CONFIG["gfg_profile_url"]
NOW = lambda: datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")

def request(url, headers=None, data=None):
    h = {"User-Agent": "KishorePortfolioSync/1.0", "Accept": "application/json"}
    h.update(headers or {})
    req = urllib.request.Request(url, data=data, headers=h)
    with urllib.request.urlopen(req, timeout=35) as response:
        return response.read()

def save(name, payload):
    payload["lastSynced"] = NOW()
    path = DATA / name
    temp = path.with_suffix(path.suffix + ".tmp")
    temp.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    temp.replace(path)
    print(f"Updated {path.relative_to(ROOT)}")

def readme_overview(markdown):
    """Return the first useful prose paragraph from a README, capped at 160 chars."""
    paragraphs, list_items = [], []
    current, current_is_list = [], False
    in_fence = False

    def flush():
        nonlocal current, current_is_list
        if current:
            text = " ".join(current).strip()
            if current_is_list:
                list_items.append(text)
            else:
                paragraphs.append(text)
        current, current_is_list = [], False

    for raw_line in markdown.splitlines():
        line = raw_line.strip()
        if line.startswith(("```", "~~~")):
            flush()
            in_fence = not in_fence
            continue
        if in_fence:
            continue
        if not line or line.startswith("#") or "![" in line or "shields.io" in line:
            flush()
            continue
        if re.fullmatch(r"(?:[-*_]\s*){3,}", line):
            flush()
            continue

        line = re.sub(r"<br\s*/?>", " ", line, flags=re.I)
        line = re.sub(r"<[^>]*>", " ", line)
        line = unescape(line).strip()
        line = re.sub(r"^>\s*", "", line)
        is_list = bool(re.match(r"^(?:[-*+]\s+|\d+[.)]\s+)", line))
        if is_list:
            line = re.sub(r"^(?:[-*+]\s+|\d+[.)]\s+)", "", line)
        if not line or line.startswith("|"):
            flush()
            continue
        if current and current_is_list != is_list:
            flush()
        current_is_list = is_list
        current.append(line)
    flush()

    def clean(text):
        text = re.sub(r"!\[[^\]]*\]\([^)]*\)", " ", text)
        text = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", text)
        text = re.sub(r"\[([^\]]+)\]\[[^\]]*\]", r"\1", text)
        text = re.sub(r"`+([^`]+)`+", r"\1", text)
        text = re.sub(r"(?:\*\*|__|~~|\*|_)", "", text)
        text = re.sub(r"<[^>]*>", " ", text)
        return re.sub(r"\s+", " ", unescape(text)).strip()

    for paragraph in paragraphs:
        text = clean(paragraph)
        if len(text) >= 40:
            return shorten_overview(text)

    # Lists are a last resort; ordinary prose always takes precedence.
    candidates = [clean(item) for item in list_items]
    for text in candidates:
        if len(text) >= 40 and not re.match(r"(?i)^(?:install|installation|npm\s|pnpm\s|yarn\s|bun\s|pip\s|git clone|docker\s)", text):
            return shorten_overview(text)
    return shorten_overview(candidates[0]) if candidates and candidates[0] else ""

def shorten_overview(text):
    if len(text) <= 160:
        return text
    shortened = text[:159]
    if " " in shortened:
        shortened = shortened.rsplit(" ", 1)[0]
    return shortened.rstrip(" ,;:-") + "…"

def sync_github():
    headers = {}
    token = os.getenv("GITHUB_TOKEN")
    if token: headers["Authorization"] = f"Bearer {token}"
    raw = request(f"https://api.github.com/users/{GITHUB_USER}/repos?type=public&sort=updated&per_page=100", headers)
    repos = json.loads(raw)
    if not isinstance(repos, list): raise ValueError("GitHub response was not a repository list")
    cache = {}
    try:
        previous = json.loads((DATA / "github.json").read_text(encoding="utf-8"))
        previous_repos = previous if isinstance(previous, list) else previous.get("repos", [])
        cache = {str(r.get("name", "")).casefold(): r for r in previous_repos if isinstance(r, dict)}
    except (OSError, ValueError, TypeError):
        pass

    synced_repos = []
    for repo in repos:
        if not isinstance(repo, dict):
            continue
        topics = repo.get("topics") or []
        if repo.get("fork") or repo.get("archived") or repo.get("private"):
            continue
        if any(str(topic).casefold() == "portfolio-hidden" for topic in topics):
            continue

        item = {k: repo.get(k) for k in ("name", "description", "html_url", "homepage", "language", "topics", "stargazers_count", "updated_at", "pushed_at")}
        name = str(repo.get("name", ""))
        old = cache.get(name.casefold(), {})
        pushed_at = repo.get("pushed_at")
        overview = old.get("overview", "")
        readme_sha = old.get("readmeSha")
        readme_pushed_at = old.get("readmePushedAt")

        # The repo-list endpoint has pushed_at, not a README blob SHA. Use it to
        # avoid README requests on unchanged repositories, then compare the actual
        # README SHA when a repository has changed.
        if not (pushed_at and readme_pushed_at == pushed_at and "overview" in old):
            url = f"https://api.github.com/repos/{quote(GITHUB_USER, safe='')}/{quote(name, safe='')}/readme"
            try:
                readme = json.loads(request(url, headers))
                new_sha = readme.get("sha")
                if new_sha and new_sha == readme_sha:
                    overview = old.get("overview", "")
                else:
                    content = readme.get("content", "")
                    if readme.get("encoding") == "base64" and content:
                        markdown = b64decode(content).decode("utf-8", "replace")
                        overview = readme_overview(markdown)
                    else:
                        overview = ""
                readme_sha = new_sha or readme_sha
                readme_pushed_at = pushed_at
            except urllib.error.HTTPError as exc:
                if exc.code == 404:
                    # Cache a confirmed missing README until the next repository push.
                    readme_pushed_at = pushed_at
                print(f"README sync skipped for {name}: {exc}", file=sys.stderr)
            except Exception as exc:
                # Keep the last good overview and retry on the next scheduled run.
                print(f"README sync skipped for {name}: {exc}", file=sys.stderr)

        item["overview"] = overview
        item["readmeSha"] = readme_sha
        item["readmePushedAt"] = readme_pushed_at
        if not (str(item.get("description") or "").strip() or str(overview or "").strip()):
            continue
        synced_repos.append(item)

    # The API response is authoritative. Only cached README metadata for repos
    # still present in this successful response is copied into the new file.
    save("github.json", {"repos": synced_repos})

def sync_leetcode():
    year = datetime.now(timezone.utc).year
    query = '''query userPortfolio($username: String!) {
      matchedUser(username: $username) {
        username
        submitStats { acSubmissionNum { difficulty count submissions } }
        profile { ranking reputation }
        userCalendar(year: YEAR) { activeYears streak totalActiveDays submissionCalendar }
        previousCalendar: userCalendar(year: PREVIOUS_YEAR) { submissionCalendar }
      }
      recentAcSubmissionList(username: $username, limit: 15) { title titleSlug timestamp }
    }'''
    query = query.replace("PREVIOUS_YEAR", str(year - 1)).replace("YEAR", str(year))
    body = json.dumps({"query": query, "variables": {"username": LEETCODE_USER}}).encode()
    result = json.loads(request("https://leetcode.com/graphql", {"Content-Type": "application/json", "Referer": "https://leetcode.com"}, body))
    user = result.get("data", {}).get("matchedUser")
    if not user: raise ValueError("LeetCode did not return a matched user")
    profile = user.get("profile") or {}
    calendar = user.get("userCalendar") or {}
    merged_calendar = {}
    for source in (user.get("previousCalendar") or {}, calendar):
        raw_calendar = source.get("submissionCalendar") or "{}"
        try: merged_calendar.update(json.loads(raw_calendar) if isinstance(raw_calendar, str) else raw_calendar)
        except (TypeError, ValueError): pass
    calendar["submissionCalendar"] = json.dumps(merged_calendar)
    save("leetcode.json", {"username": LEETCODE_USER, "submitStats": user.get("submitStats") or {}, "profile": profile, "ranking": profile.get("ranking"), "reputation": profile.get("reputation"), "calendar": calendar, "recentAccepted": result.get("data", {}).get("recentAcSubmissionList") or []})


def sync_gfg():
    # Best-effort parser for public profile data embedded in the rendered GFG page.
    html = request(GFG_URL, {"Accept": "text/html,application/xhtml+xml"}).decode("utf-8", "replace")
    marker = re.search(r'total_problems_solved\\?"\s*:\s*(\d+)', html)
    if not marker:
        raise ValueError("Could not recognize GFG profile statistics; preserving previous file")
    snippet = html[max(0, marker.start() - 1200):marker.end() + 200]
    def field(name):
        found = re.search(re.escape(name) + r'\\?"\s*:\s*(\d+)', snippet)
        return int(found.group(1)) if found else None
    save("gfg.json", {"profileUrl": GFG_URL, "problemsSolved": int(marker.group(1)), "codingScore": field("score"), "instituteRank": field("institute_rank"), "difficulty": {}})

if __name__ == "__main__":
    DATA.mkdir(exist_ok=True)
    parser = argparse.ArgumentParser()
    parser.add_argument("--profiles-only", action="store_true", help="sync LeetCode and GFG only")
    args = parser.parse_args()
    failed = False
    jobs = (sync_leetcode, sync_gfg) if args.profiles_only else (sync_github, sync_leetcode, sync_gfg)
    for job in jobs:
        try: job()
        except Exception as exc:
            failed = True
            print(f"{job.__name__} failed; existing data retained: {exc}", file=sys.stderr)
    if failed: sys.exit(1)


