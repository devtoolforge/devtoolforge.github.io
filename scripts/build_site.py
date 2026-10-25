#!/usr/bin/env python3
"""Build only currently published articles into dist/ from the demo schedule."""
from pathlib import Path
from datetime import datetime
from zoneinfo import ZoneInfo
import csv, shutil, re, sys, os

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
SCHEDULE = ROOT / "schedule.csv"
TZ = ZoneInfo("Asia/Dhaka")
now = datetime.now(TZ)

def parse_dt(s, tzname):
    # schedule values are local wall time; timezone currently Asia/Dhaka
    return datetime.strptime(s.strip(), "%Y-%m-%d %H:%M:%S").replace(tzinfo=ZoneInfo(tzname or "Asia/Dhaka"))

with SCHEDULE.open(newline="", encoding="utf-8-sig") as f:
    rows = list(csv.DictReader(f))

# Publish every due Scheduled row. Marking status is committed by workflow.
for row in rows:
    if row["Status"].strip().lower() == "scheduled":
        if parse_dt(row["PublishDateTime"], row.get("Timezone", "Asia/Dhaka")) <= now:
            row["Status"] = "Published"

# Update schedule atomically
with SCHEDULE.open("w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=["PostID","Slug","PublishDateTime","Timezone","BatchID","Status","HTMLPath"])
    w.writeheader()
    for row in rows: w.writerow({k: row.get(k,"") for k in w.fieldnames})

published_paths = {r["HTMLPath"].strip().lstrip("./") for r in rows if r["Status"].strip().lower() == "published"}
all_article_paths = {r["HTMLPath"].strip().lstrip("./") for r in rows}
unpublished_paths = all_article_paths - published_paths

if DIST.exists(): shutil.rmtree(DIST)
DIST.mkdir()
# Copy everything except source schedule, scripts, workflow, README and unpublished article HTML.
skip_dirs = {".git", ".github", "scripts", "dist", "__pycache__"}
for p in ROOT.iterdir():
    if p.name in skip_dirs or p.name in {"schedule.csv", "README.md", "requirements.txt"}:
        continue
    target = DIST / p.name
    if p.is_dir():
        shutil.copytree(p, target)
    elif p.is_file():
        shutil.copy2(p, target)

# Remove unpublished article files from deployed output.
for rel in unpublished_paths:
    target = DIST / rel
    if target.exists(): target.unlink()

# Remove cards linking to unpublished articles from all HTML pages.
# Demo card/article blocks use <article>...</article>; filter by matching href.
for html in DIST.rglob("*.html"):
    try: content = html.read_text(encoding="utf-8")
    except UnicodeDecodeError: continue
    for rel in unpublished_paths:
        href = "./" + rel
        # strip article blocks containing a link to an unpublished article
        pattern = re.compile(r"<article\b[^>]*>.*?</article>", re.I | re.S)
        content = pattern.sub(lambda m: "" if (href in m.group(0) or ('href="' + rel in m.group(0))) else m.group(0), content)
    html.write_text(content, encoding="utf-8")

# Add a no-Jekyll marker to the deployment artifact.
(DIST / ".nojekyll").touch()
print(f"Build time: {now.isoformat()}")
print(f"Published articles: {len(published_paths)} / {len(rows)}")
print(f"Removed future article files: {len(unpublished_paths)}")
