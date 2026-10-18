#!/usr/bin/env python3
"""Fetch public portfolio data. Writes each destination only after a valid response."""
from datetime import datetime, timezone
from pathlib import Path
import argparse, json, os, re, sys, urllib.error, urllib.request

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

def sync_github():
    headers = {}
    token = os.getenv("GITHUB_TOKEN")
    if token: headers["Authorization"] = f"Bearer {token}"
    raw = request(f"https://api.github.com/users/{GITHUB_USER}/repos?sort=updated&per_page=100", headers)
    repos = json.loads(raw)
    if not isinstance(repos, list): raise ValueError("GitHub response was not a repository list")
    save("github.json", {"repos": [{k: r.get(k) for k in ("name", "description", "html_url", "homepage", "language", "topics", "stargazers_count", "updated_at", "pushed_at")} for r in repos]})

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


