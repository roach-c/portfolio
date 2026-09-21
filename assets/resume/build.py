#!/usr/bin/env python3
"""Render resume-print.html to the downloadable PDF.

    python3 assets/resume/build.py

Source of truth is resume-print.html. Never hand edit the PDF.
"""
import pathlib
import sys

from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).resolve().parent
SRC = HERE / "resume-print.html"
OUT = HERE / "Caleb-Roach-Resume.pdf"


def main() -> int:
    if not SRC.exists():
        print(f"missing {SRC}", file=sys.stderr)
        return 1

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(SRC.as_uri(), wait_until="networkidle")
        page.pdf(path=str(OUT), format="Letter", print_background=True)
        browser.close()

    print(f"wrote {OUT} ({OUT.stat().st_size:,} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
