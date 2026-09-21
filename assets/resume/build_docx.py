#!/usr/bin/env python3
"""Build the editable Word copy of the resume.

    python3 assets/resume/build_docx.py

The PDF at Caleb-Roach-Resume.pdf is the primary download and comes from
resume-print.html. This .docx exists so the resume can be edited in Word or
handed to an employer who asks for a Word file. Keep the two in sync by hand.
"""
import pathlib

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT
from docx.shared import Pt, Inches, RGBColor

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE / "Caleb-Roach-Resume.docx"

INK = RGBColor(0x16, 0x18, 0x1C)
GREY = RGBColor(0x4A, 0x50, 0x58)
RIGHT_EDGE = Inches(7.3)

JOBS = [
    ("Marketing & Web Specialist", "McRay Roofing & Exteriors · Oklahoma City, OK",
     "Feb 2026 – Present", [
        "Rebuilt the company website end to end, covering layout, copy, photography, and a contact form that writes leads directly into the sales team’s system instead of an inbox; currently in final review before launch.",
        "Built and deployed the company’s customer management system, used daily by a four seat office team to track jobs, customers, and documents, and administer the Linux server it runs on.",
        "Built the employee time clock that field crews punch into from their phones, with PIN sign in, payroll exports, and admin reporting.",
        "Automated a daily job recap that pulls from the company’s job management platform and reaches leadership every morning with no manual work.",
        "Own local search optimization, service area content, and the photo and video library used across the site.",
     ]),
    ("Co Owner", "Tethered Crew · Oklahoma City, OK", "Aug 2026 – Present", [
        "Co founded a two person studio building websites and custom business software for small companies, splitting ownership, pricing, and client relationships evenly with my partner.",
        "Designed and shipped the studio’s own brand and website, and set up the hosting every client project runs on.",
        "Delivered a full website rebuild and a custom supplier tracking system for a retail brokerage, my first engagement with a paying client outside my own work.",
        "Write the proposals, scope the work, and stay on as the client’s point of contact after launch.",
     ]),
    ("Student Worker, Creative Media · Lead Videographer",
     "Southern Nazarene University · Oklahoma City, OK", "Aug 2025 – Present", [
        "Shoot, edit, and deliver video for university departments and campus events, handling the project from the shoot through the final export.",
     ]),
    ("Lead Videographer & Editor, University Weekly News",
     "Southern Nazarene University · Oklahoma City, OK", "Aug 2025 – Present", [
        "Lead the video side of the student produced weekly news show, from shoot planning through the final cut, on a weekly deadline.",
     ]),
    ("Media Lead Intern", "Fayetteville Chamber of Commerce · Fayetteville, AR · Hybrid",
     "May 2025 – Aug 2025", [
        "Produced and scheduled video and social content that reached more than 30,000 viewers across the Chamber’s digital platforms.",
        "Coordinated media coverage of Chamber events and member businesses alongside the communications staff.",
     ]),
    ("Operations & Records Assistant", "Country Silk · Hybrid", "May 2024 – Aug 2024", [
        "Maintained records and file systems and handled day to day operational and administrative work for a small team.",
     ]),
    ("Travel Ball Umpire", "Freelance · Seasonal", "2022 – Present", [
        "Officiate youth travel baseball, managing game situations, coaches, and close calls under pressure.",
     ]),
]

EDUCATION = [
    ("Southern Nazarene University", "Bachelor’s Degree, Communications & Design · Oklahoma City, OK", "Expected May 2028"),
    ("Bentonville West High School", "Graduated with High Honors · AP Scholar · Bentonville, AR", "Graduated 2025"),
]

SKILLS = [
    ("Video", "Adobe Premiere Pro, After Effects, Lightroom · directing, editing, color, motion graphics"),
    ("Web", "HTML, CSS, JavaScript · responsive design, accessibility, search engine optimization"),
    ("Software", "Python, Flask, PostgreSQL · Git and GitHub · Linux server deployment and DNS"),
    ("Office", "Microsoft Word, Excel, PowerPoint · Google Workspace · file and records management"),
    ("Professional", "Client relations, project management, written and verbal communication, leadership, problem solving, time management"),
]

CERTS = [
    ("Google Ads Certification", "Google Skillshop"),
    ("Google Analytics (GA4) Certification", "Google Skillshop"),
]


def tight(p, before=0, after=2, spacing=1.0):
    pf = p.paragraph_format
    pf.space_before = Pt(before)
    pf.space_after = Pt(after)
    pf.line_spacing = spacing
    return p


def run(p, text, size=9.5, bold=False, italic=False, color=INK):
    r = p.add_run(text)
    r.font.size = Pt(size)
    r.font.bold = bold
    r.font.italic = italic
    r.font.color.rgb = color
    r.font.name = "Helvetica Neue"
    return r


def right_tab(p):
    p.paragraph_format.tab_stops.add_tab_stop(RIGHT_EDGE, WD_TAB_ALIGNMENT.RIGHT)
    return p


def section(doc, title):
    p = tight(doc.add_paragraph(), before=10, after=4)
    pb = p.paragraph_format
    run(p, title.upper(), size=9, bold=True)
    for r in p.runs:
        r.font.all_caps = True
    # underline the section by bottom-bordering the paragraph
    from docx.oxml.ns import qn
    from docx.oxml import OxmlElement
    pPr = p._p.get_or_add_pPr()
    borders = OxmlElement("w:pBdr")
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), "6")
    bottom.set(qn("w:space"), "2")
    bottom.set(qn("w:color"), "9AA0A8")
    borders.append(bottom)
    pPr.append(borders)
    return p


def headline_row(doc, left, right, before=7):
    p = right_tab(tight(doc.add_paragraph(), before=before, after=0))
    run(p, left, size=10, bold=True)
    run(p, "\t" + right, size=8.5, color=GREY)
    return p


def main():
    doc = Document()

    s = doc.sections[0]
    s.top_margin = s.bottom_margin = Inches(0.55)
    s.left_margin = s.right_margin = Inches(0.6)

    normal = doc.styles["Normal"]
    normal.font.name = "Helvetica Neue"
    normal.font.size = Pt(9.5)
    normal.font.color.rgb = INK

    # ---- name + contact ----
    p = tight(doc.add_paragraph(), after=1)
    r = run(p, "CALEB ROACH", size=22, bold=True)
    r.font.color.rgb = INK

    p = tight(doc.add_paragraph(), after=6)
    run(p, "Oklahoma City, OK  ·  479-936-0543  ·  roachca25@gmail.com  ·  roach-c.github.io/portfolio",
        size=9, color=GREY)

    # ---- summary ----
    section(doc, "Summary")
    p = tight(doc.add_paragraph(), after=0)
    run(p, "Communications and Design student at Southern Nazarene University with paid experience "
           "across video production, web development, and marketing. Currently the Marketing and Web "
           "Specialist at a roofing and exteriors company, where I own the website, the local search "
           "presence, and the internal software the office and field crews run on, and co owner of a "
           "two person studio that builds websites and business software for small companies. "
           "Comfortable carrying a project from the first client meeting through design, build, "
           "launch, and support.")

    # ---- experience ----
    section(doc, "Experience")
    for title, org, dates, bullets in JOBS:
        headline_row(doc, title, dates)
        p = tight(doc.add_paragraph(), after=1)
        run(p, org, size=9, italic=True, color=GREY)
        for b in bullets:
            bp = tight(doc.add_paragraph(style="List Bullet"), after=1)
            bp.paragraph_format.left_indent = Inches(0.22)
            bp.paragraph_format.first_line_indent = Inches(-0.13)
            run(bp, b)

    # ---- education ----
    section(doc, "Education")
    for school, detail, dates in EDUCATION:
        headline_row(doc, school, dates, before=5)
        p = tight(doc.add_paragraph(), after=1)
        run(p, detail, color=GREY)

    # ---- leadership ----
    section(doc, "Leadership & Activities")
    headline_row(doc, "Salt & Senate Leadership Program", "Aug 2025 – Present", before=5)
    p = tight(doc.add_paragraph(), after=1)
    run(p, "Southern Nazarene University", color=GREY)

    # ---- skills ----
    section(doc, "Skills")
    for label, body in SKILLS:
        p = tight(doc.add_paragraph(), after=2)
        p.paragraph_format.left_indent = Inches(0.85)
        p.paragraph_format.first_line_indent = Inches(-0.85)
        p.paragraph_format.tab_stops.add_tab_stop(Inches(0.85))
        run(p, label, bold=True)
        run(p, "\t" + body)

    # ---- certifications ----
    section(doc, "Certifications")
    for name, issuer in CERTS:
        p = right_tab(tight(doc.add_paragraph(), after=2))
        run(p, name)
        run(p, "\t" + issuer, size=8.5, color=GREY)

    doc.save(OUT)
    print(f"wrote {OUT} ({OUT.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
