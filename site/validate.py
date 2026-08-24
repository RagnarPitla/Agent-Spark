#!/usr/bin/env python3
"""
Deterministic gate for a landing page built with the ragnar-landing-page skill.

Exit 0 means the page is shippable. Exit 1 means it is not, with every finding
printed. There is no warning tier on purpose: a check worth writing is worth
blocking on, and a warning nobody blocks on is a comment.

Usage:
    python3 validate.py <site-dir>          # e.g. python3 validate.py docs
    python3 validate.py <site-dir> --quiet  # findings only, no pass lines

Stdlib only. No install step, so it runs in CI and on a laptop identically.
"""

from __future__ import annotations

import os
import re
import sys
from pathlib import Path

# --------------------------------------------------------------------------
# Non-ASCII typographic characters that render as mojibake in some GitHub and
# email surfaces. Emoji are deliberately NOT in this set: they survive fine.
# Each entry maps the offender to the ASCII the page should use instead.
# --------------------------------------------------------------------------
BAD_CHARS = {
    "\u2014": "-  (em dash)",
    "\u2013": "-  (en dash)",
    "\u2018": "'  (left single quote)",
    "\u2019": "'  (right single quote / apostrophe)",
    "\u201c": '"  (left double quote)',
    "\u201d": '"  (right double quote)',
    "\u2026": "... (ellipsis)",
    "\u2192": "-> (right arrow)",
    "\u2190": "<- (left arrow)",
    "\u2194": "<-> (left-right arrow)",
    "\u21d2": "=> (double arrow)",
    "\u00a7": "the word 'Section'",
    "\u00a0": "a normal space (non-breaking space)",
    "\u200b": "nothing (zero-width space)",
    "\u2265": ">=",
    "\u2264": "<=",
    "\u2260": "!=",
    "\u2248": "~=",
    "\u2713": "[x] (check mark)",
    "\u2717": "x  (ballot x)",
    "\u2022": "- (bullet)",
}

REQUIRED_META = [
    ('name="description"', "meta description"),
    ('property="og:title"', "Open Graph title"),
    ('property="og:description"', "Open Graph description"),
    ('property="og:image"', "Open Graph image"),
    ('property="og:url"', "Open Graph url"),
    ('name="twitter:card"', "Twitter card"),
    ('name="viewport"', "viewport"),
]

BANNED_PHRASES = [
    "in today's fast-paced",
    "imagine a world",
    "we're excited to announce",
    "we are excited to announce",
    "unlock the power",
    "seamlessly integrat",
    "game-changing",
    "cutting-edge",
    "revolutionary",
    "best-in-class",
    "world-class",
    "take it to the next level",
    "look no further",
    "in conclusion",
]

# Design tokens whose contrast against a named background is load-bearing.
# (token, token value, background value, minimum ratio, why)
CONTRAST_PAIRS = [
    ("--foreground", "#0a0a0a", "#ffffff", 7.0, "body text on background"),
    ("--muted-foreground", "#737373", "#ffffff", 4.5, "secondary text on background"),
    ("--primary-foreground", "#fafafa", "#171717", 7.0, "button label on primary"),
    ("--status-ok", "#15803d", "#ffffff", 4.5, "ok label on background"),
    ("--status-warn", "#b45309", "#ffffff", 4.5, "warn label on background"),
    ("--status-bad", "#dc2626", "#ffffff", 4.5, "bad label on background"),
]


class Report:
    def __init__(self, quiet: bool = False) -> None:
        self.findings: list[str] = []
        self.passes: list[str] = []
        self.quiet = quiet

    def fail(self, check: str, detail: str) -> None:
        self.findings.append(f"  [FAIL] {check}\n         {detail}")

    def ok(self, check: str) -> None:
        self.passes.append(f"  [ok]   {check}")

    def render(self) -> int:
        if self.passes and not self.quiet:
            print("\n".join(self.passes))
        if self.findings:
            print("\n" + "\n".join(self.findings))
            print(f"\n{len(self.findings)} finding(s). Page is not shippable.")
            return 1
        print(f"\nAll {len(self.passes)} checks passed.")
        return 0


# --------------------------------------------------------------------------
# WCAG relative luminance and contrast ratio.
# --------------------------------------------------------------------------

def _srgb_to_linear(channel: float) -> float:
    return channel / 12.92 if channel <= 0.04045 else ((channel + 0.055) / 1.055) ** 2.4


def luminance(hex_color: str) -> float:
    h = hex_color.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    return 0.2126 * _srgb_to_linear(r) + 0.7152 * _srgb_to_linear(g) + 0.0722 * _srgb_to_linear(b)


def contrast_ratio(fg: str, bg: str) -> float:
    a, b = luminance(fg), luminance(bg)
    lighter, darker = max(a, b), min(a, b)
    return (lighter + 0.05) / (darker + 0.05)


# --------------------------------------------------------------------------
# Checks
# --------------------------------------------------------------------------

def strip_comments(html: str) -> str:
    return re.sub(r"<!--.*?-->", "", html, flags=re.DOTALL)


def check_placeholders(html: str, rel: str, r: Report) -> None:
    left = sorted(set(re.findall(r"\{\{[A-Z0-9_]+\}\}", html)))
    if left:
        r.fail(f"{rel}: unreplaced template slots", ", ".join(left))
    else:
        r.ok(f"{rel}: no template slots left behind")


def check_ascii(text: str, rel: str, r: Report) -> None:
    hits: list[str] = []
    for line_no, line in enumerate(text.splitlines(), 1):
        for ch, fix in BAD_CHARS.items():
            if ch in line:
                col = line.index(ch) + 1
                hits.append(f"line {line_no}:{col} U+{ord(ch):04X} -> use {fix}")
    if hits:
        r.fail(f"{rel}: non-ASCII typographic characters", "\n         ".join(hits[:12]))
    else:
        r.ok(f"{rel}: ASCII-clean")


def check_meta(html: str, rel: str, r: Report) -> None:
    missing = [label for needle, label in REQUIRED_META if needle not in html]
    if missing:
        r.fail(f"{rel}: missing meta tags", ", ".join(missing))
    else:
        r.ok(f"{rel}: all required meta tags present")


def check_relative_paths(html: str, rel: str, r: Report) -> None:
    """A project page is served under /<repo>/, so a root-absolute asset path
    resolves to the wrong place and 404s. Catch it here, not in production."""
    bad = re.findall(r'(?:src|href)="(/(?!/)[^"]*)"', html)
    bad = [p for p in bad if not p.startswith("//")]
    if bad:
        r.fail(
            f"{rel}: root-absolute asset paths break project pages",
            ", ".join(sorted(set(bad))[:8]) + "  -> make these relative (./...)",
        )
    else:
        r.ok(f"{rel}: asset paths are project-page safe")


def check_no_external_assets(html: str, rel: str, r: Report) -> None:
    """No CDN scripts, no hosted fonts. The page must work offline and forever."""
    ext = re.findall(r'<(?:script|link)[^>]+(?:src|href)="(https?://[^"]+)"', html)
    ext = [u for u in ext if "fonts." in u or "cdn" in u or u.endswith((".js", ".css"))]
    if ext:
        r.fail(f"{rel}: external asset dependency", ", ".join(sorted(set(ext))))
    else:
        r.ok(f"{rel}: no external assets, no build step")


def check_accessibility(html: str, rel: str, r: Report) -> None:
    problems: list[str] = []
    body = strip_comments(html)

    if not re.search(r"<html[^>]+lang=", body):
        problems.append("<html> has no lang attribute")
    if 'class="skip-link"' not in body:
        problems.append("no skip link")
    if not re.search(r'<main[^>]+id="main"', body):
        problems.append('no <main id="main"> target for the skip link')

    sections = re.findall(r"<section\b[^>]*>", body)
    unlabelled = [s for s in sections if "aria-labelledby" not in s and "aria-label" not in s]
    if unlabelled:
        problems.append(f"{len(unlabelled)} of {len(sections)} <section> elements have no accessible name")

    for img in re.findall(r"<img\b[^>]*>", body):
        if "alt=" not in img:
            problems.append(f"<img> without alt: {img[:70]}")

    for svg in re.findall(r"<svg\b[^>]*>", body):
        if 'role="img"' in svg and "aria-label" not in svg:
            problems.append('<svg role="img"> without aria-label')
        if "aria-hidden" not in svg and 'role="img"' not in svg:
            problems.append(f"<svg> is neither aria-hidden nor role=img: {svg[:70]}")

    # An anchor whose only content is an icon gives a screen reader nothing.
    for a in re.findall(r"<a\b[^>]*>(?:(?!</a>).)*</a>", body, flags=re.DOTALL):
        text = re.sub(r"<[^>]+>", "", a).strip()
        if not text and "aria-label" not in a:
            problems.append("link with no accessible text and no aria-label")

    if problems:
        r.fail(f"{rel}: accessibility", "\n         ".join(sorted(set(problems))[:10]))
    else:
        r.ok(f"{rel}: accessibility contract met")


def check_banned_phrases(html: str, rel: str, r: Report) -> None:
    text = re.sub(r"<[^>]+>", " ", strip_comments(html)).lower()
    hits = [p for p in BANNED_PHRASES if p in text]
    if hits:
        r.fail(f"{rel}: marketing slop", ", ".join(f'"{h}"' for h in hits))
    else:
        r.ok(f"{rel}: no banned marketing phrases")


def check_local_refs(html: str, path: Path, r: Report) -> None:
    rel = path.name
    missing: list[str] = []
    for ref in re.findall(r'(?:src|href)="(\./[^"#?]+)"', html):
        target = (path.parent / ref).resolve()
        if not target.exists():
            missing.append(ref)
    if missing:
        r.fail(f"{rel}: referenced files do not exist", ", ".join(sorted(set(missing))))
    else:
        r.ok(f"{rel}: every local reference resolves")


def check_anchors(html: str, rel: str, r: Report) -> None:
    ids = set(re.findall(r'\sid="([^"]+)"', html))
    broken = [
        h for h in re.findall(r'href="#([^"]+)"', html)
        if h and h not in ids
    ]
    if broken:
        r.fail(f"{rel}: in-page links point at missing ids", ", ".join(f"#{b}" for b in sorted(set(broken))))
    else:
        r.ok(f"{rel}: every in-page anchor resolves")


def check_contrast(css: str, r: Report) -> None:
    """The tokens are only safe while they hold their documented values. If
    someone retunes the palette, this is what tells them what they broke."""
    problems: list[str] = []
    for token, expected, bg, minimum, why in CONTRAST_PAIRS:
        m = re.search(rf"{re.escape(token)}:\s*(#[0-9a-fA-F]{{6}})", css)
        if not m:
            problems.append(f"{token} is not defined")
            continue
        actual = m.group(1).lower()
        ratio = contrast_ratio(actual, bg)
        if ratio < minimum:
            problems.append(
                f"{token} {actual} on {bg} is {ratio:.2f}:1, needs {minimum}:1 ({why})"
            )
    if problems:
        r.fail("site.css: token contrast", "\n         ".join(problems))
    else:
        r.ok(f"site.css: all {len(CONTRAST_PAIRS)} contrast pairs clear WCAG AA")


def check_focus_not_removed(css: str, r: Report) -> None:
    if re.search(r"outline:\s*(none|0)\s*;", css):
        r.fail("site.css: focus outline removed", "outline:none found - keyboard users lose the focus ring")
    else:
        r.ok("site.css: focus outlines intact")


def check_reduced_motion(css: str, r: Report) -> None:
    if "prefers-reduced-motion" not in css:
        r.fail("site.css: no prefers-reduced-motion block", "animation must be opt-out")
    else:
        r.ok("site.css: honours prefers-reduced-motion")


# --------------------------------------------------------------------------

def main() -> int:
    args = [a for a in sys.argv[1:] if not a.startswith("-")]
    quiet = "--quiet" in sys.argv
    site = Path(args[0] if args else "docs").resolve()

    if not site.is_dir():
        print(f"error: {site} is not a directory")
        return 1

    r = Report(quiet=quiet)
    print(f"Validating {site}\n")

    html_files = sorted(site.rglob("*.html"))
    if not html_files:
        print(f"error: no .html files under {site}")
        return 1

    for path in html_files:
        rel = str(path.relative_to(site))
        html = path.read_text(encoding="utf-8")
        check_placeholders(html, rel, r)
        check_ascii(html, rel, r)
        check_relative_paths(html, rel, r)
        check_no_external_assets(html, rel, r)
        check_accessibility(html, rel, r)
        check_banned_phrases(html, rel, r)
        check_local_refs(html, path, r)
        check_anchors(html, rel, r)
        if path.name == "index.html":
            check_meta(html, rel, r)

    for css_path in sorted(site.rglob("*.css")):
        css = css_path.read_text(encoding="utf-8")
        check_ascii(css, str(css_path.relative_to(site)), r)
        if css_path.name == "site.css":
            check_contrast(css, r)
            check_focus_not_removed(css, r)
            check_reduced_motion(css, r)

    return r.render()


if __name__ == "__main__":
    sys.exit(main())
