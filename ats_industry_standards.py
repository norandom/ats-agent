"""Industry-grade ATS parsing requirements and common issues.

Based on real ATS systems like:
- Ashby
- Greenhouse
- Lever
- Workday
- SAP SuccessFactors
- Taleo
- iCIMS
- SmartRecruiters
- BambooHR
"""

# Real ATS parsing capabilities and limitations
ATS_PARSING_REQUIREMENTS = {
    "ashby": {
        "name": "Ashby",
        "parsing_engine": "AI-powered with ML models",
        "strengths": [
            "Modern AI parsing",
            "Good with standard formats",
            "Handles multiple languages",
            "Extracts skills taxonomy"
        ],
        "weaknesses": [
            "Struggles with complex tables",
            "Multi-column layouts problematic",
            "Graphics and text boxes fail",
            "Non-standard section headers confuse parser"
        ],
        "critical_checks": [
            "Date consistency",
            "Section header recognition",
            "Contact info extraction",
            "Job title standardization"
        ]
    },
    "workday": {
        "name": "Workday",
        "parsing_engine": "Rule-based with some ML",
        "weaknesses": [
            "Very strict formatting requirements",
            "Poor handling of creative formats",
            "Often misses skills in paragraph form",
            "Struggles with non-English date formats"
        ]
    },
    "greenhouse": {
        "name": "Greenhouse",
        "parsing_engine": "Third-party integration (Sovren/HireAbility)",
        "weaknesses": [
            "Tables often cause parsing failures",
            "Headers/footers can duplicate info",
            "Encrypted PDFs fail completely",
            "Struggles with gaps in employment"
        ]
    }
}

# Industry-grade parsing issues
INDUSTRY_PARSING_ISSUES = {
    "date_format_problems": {
        "severity": "high",
        "description": "Inconsistent or non-standard date formats",
        "examples": [
            "Mixing formats: 'Jan 2020' and '01/2020'",
            "Ambiguous formats: '01/02/2020' (US vs EU)",
            "Missing year: 'January - March'",
            "Relative dates: '2 years ago'",
            "Inconsistent 'Present' vs 'Current' vs 'Now'"
        ],
        "ats_impact": "Dates may not parse, work history appears incorrect",
        "score_deduction": 3
    },

    "employment_gaps": {
        "severity": "medium",
        "description": "Unexplained gaps in employment history",
        "detection": "Gaps > 3 months between roles",
        "ats_impact": "May trigger automatic rejection or screening questions",
        "recommendation": "Explain gaps (e.g., 'Sabbatical', 'Parental Leave', 'Professional Development')",
        "score_deduction": 2
    },

    "contact_info_location": {
        "severity": "high",
        "description": "Contact information in headers/footers or multiple locations",
        "ats_impact": "ATS may miss contact info entirely or create duplicates",
        "recommendation": "Place contact info at top of page in main body",
        "score_deduction": 5
    },

    "table_usage": {
        "severity": "high",
        "description": "Using tables for layout or content",
        "examples": [
            "Two-column layouts",
            "Skills in table format",
            "Experience in tables"
        ],
        "ats_impact": "Content may parse out of order or be lost entirely",
        "score_deduction": 8
    },

    "text_box_graphics": {
        "severity": "critical",
        "description": "Text in text boxes, shapes, or as images",
        "ats_impact": "Content completely invisible to ATS",
        "score_deduction": 10
    },

    "special_characters": {
        "severity": "medium",
        "description": "Excessive special characters or symbols",
        "examples": ["★ ✓ → • ◆ ■"],
        "ats_impact": "May cause parsing errors or appear as garbage characters",
        "score_deduction": 2
    },

    "section_header_problems": {
        "severity": "high",
        "description": "Non-standard or creative section headers",
        "examples": [
            "'Where I've Been' instead of 'Experience'",
            "'My Toolkit' instead of 'Skills'",
            "'Learning Journey' instead of 'Education'"
        ],
        "ats_impact": "Sections not recognized, content miscategorized",
        "score_deduction": 5
    },

    "paragraph_skills": {
        "severity": "medium",
        "description": "Skills buried in paragraph text instead of listed",
        "ats_impact": "Skills not extracted, keyword matching fails",
        "recommendation": "Use bullet points or dedicated skills section",
        "score_deduction": 3
    },

    "length_issues": {
        "severity": "low",
        "description": "CV too long or too short",
        "optimal_length": {
            "entry_level": "1 page",
            "mid_level": "1-2 pages",
            "senior_level": "2-3 pages",
            "executive": "2-4 pages"
        },
        "score_deduction": 2
    },

    "file_format_issues": {
        "severity": "critical",
        "description": "Problematic PDF formats",
        "problems": [
            "Scanned images (not searchable)",
            "Password-protected PDFs",
            "PDF/A format (sometimes causes issues)",
            "Very old PDF versions (< 1.4)",
            "Portfolio PDFs with multiple documents"
        ],
        "score_deduction": 10
    },

    "generic_content": {
        "severity": "medium",
        "description": "Generic, non-specific content",
        "examples": [
            "Objective: 'Seeking a challenging position'",
            "Responsibilities: 'Responsible for various tasks'",
            "No quantifiable achievements"
        ],
        "ats_impact": "Low keyword match, appears unqualified",
        "score_deduction": 3
    },

    "acronym_inconsistency": {
        "severity": "medium",
        "description": "Only using acronyms without spelling out",
        "examples": [
            "Using 'ML' without 'Machine Learning'",
            "Using 'SEO' without 'Search Engine Optimization'"
        ],
        "ats_impact": "May miss keyword matches",
        "recommendation": "First use: 'Machine Learning (ML)', then 'ML'",
        "score_deduction": 2
    },

    "email_phone_format": {
        "severity": "high",
        "description": "Contact info not in standard format",
        "examples": [
            "Phone: 'one two three four five'",
            "Email as image",
            "Multiple emails without labels"
        ],
        "ats_impact": "Contact information not extracted",
        "score_deduction": 5
    }
}

# Specific checks modern ATS systems perform
MODERN_ATS_CHECKS = {
    "date_range_validation": {
        "check": "Validate employment dates make logical sense",
        "flags": [
            "End date before start date",
            "Overlapping employment periods",
            "Future dates",
            "Dates > 50 years ago (likely parsing error)",
            "Total experience doesn't match years stated"
        ]
    },

    "contact_completeness": {
        "check": "All required contact information present",
        "required": ["email", "phone"],
        "optional": ["LinkedIn", "portfolio", "location"],
        "flags": ["Missing email", "Missing phone", "Multiple emails without labels"]
    },

    "content_structure": {
        "check": "Proper document structure",
        "requirements": [
            "Clear section headers",
            "Consistent formatting",
            "Logical flow",
            "No orphaned content"
        ]
    },

    "keyword_density": {
        "check": "Keyword stuffing detection",
        "flags": ["Same keyword repeated > 10 times", "Invisible white text"],
        "recommendation": "Natural keyword usage, 2-5 times max"
    },

    "job_title_standardization": {
        "check": "Job titles follow industry standards",
        "examples": {
            "good": ["Software Engineer", "Product Manager", "Data Scientist"],
            "problematic": ["Code Ninja", "Sales Rock Star", "Marketing Guru"]
        }
    },

    "skills_taxonomy": {
        "check": "Skills match industry taxonomy",
        "systems_used": ["LinkedIn Skills", "O*NET", "ESCO", "Custom taxonomy"],
        "recommendation": "Use standard skill names from LinkedIn or job postings"
    }
}

# German-specific ATS considerations
GERMAN_ATS_SPECIFICS = {
    "date_format": "DD.MM.YYYY or MM/YYYY",
    "required_sections": ["Berufserfahrung", "Ausbildung"],
    "optional_sections": ["Kenntnisse", "Sprachen", "Weiterbildung"],
    "gap_explanation": "More critical in Germany - explain all gaps",
    "chronological_order": "Reverse chronological strongly preferred",
    "common_ats": {
        "StepStone": {
            "keyword_matching": "Very strict",
            "format_flexibility": "Medium",
            "special_notes": "Prefers standard section names"
        },
        "XING": {
            "keyword_matching": "Good",
            "format_flexibility": "Good",
            "special_notes": "Better with profile links"
        },
        "Indeed.de": {
            "keyword_matching": "Aggressive",
            "format_flexibility": "Low",
            "special_notes": "Prefers simple formats"
        }
    }
}

def get_suggested_improvements():
    """Get list of all potential improvements for ATS compatibility."""
    return [
        "Use single-column layout only",
        "Place contact info at top of main document body",
        "Use standard section headers",
        "Avoid tables, text boxes, headers/footers for content",
        "Use consistent date format throughout",
        "List skills as bullet points, not paragraphs",
        "Include both acronyms and full terms (first mention)",
        "Use standard job titles",
        "Add quantifiable achievements (numbers, percentages)",
        "Keep formatting simple (no fancy fonts or graphics)",
        "Explain employment gaps",
        "Use standard fonts (Arial, Calibri, Times New Roman)",
        "Save as text-searchable PDF",
        "Optimize for 1-2 pages (mid-level)",
        "Use keywords from job description naturally"
    ]
