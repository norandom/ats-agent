"""CV Parser module for extracting text from PDF CVs."""

import pymupdf
from langdetect import detect, DetectorFactory
from typing import Optional

# Set seed for consistent language detection
DetectorFactory.seed = 0


def extract_text_from_pdf(pdf_path: str) -> dict:
    """
    Extract text content from a PDF CV.

    Args:
        pdf_path: Path to the PDF file

    Returns:
        Dictionary with extracted text and metadata
    """
    try:
        doc = pymupdf.open(pdf_path)

        # Extract text from all pages
        full_text = ""
        page_texts = []

        for page_num, page in enumerate(doc):
            page_text = page.get_text()
            page_texts.append({
                "page_number": page_num + 1,
                "text": page_text
            })
            full_text += page_text + "\n"

        # Get document metadata
        metadata = doc.metadata

        doc.close()

        return {
            "success": True,
            "full_text": full_text.strip(),
            "page_count": len(page_texts),
            "pages": page_texts,
            "metadata": metadata,
            "file_path": pdf_path
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "file_path": pdf_path
        }


def detect_language(text: str) -> str:
    """
    Detect the language of the CV text.

    Args:
        text: CV text content

    Returns:
        Language code ('en', 'de', etc.) or 'unknown'
    """
    try:
        if len(text.strip()) < 50:
            return "unknown"
        return detect(text)
    except Exception:
        return "unknown"


def analyze_cv_structure(text: str, language: Optional[str] = None) -> dict:
    """
    Analyze basic structural elements of the CV text.

    Args:
        text: Extracted CV text
        language: Optional language code ('en', 'de', etc.)

    Returns:
        Dictionary with structural analysis
    """
    lines = text.split('\n')
    non_empty_lines = [line for line in lines if line.strip()]

    # Detect language if not provided
    if language is None:
        language = detect_language(text)

    # Basic structural analysis
    analysis = {
        "total_lines": len(lines),
        "non_empty_lines": len(non_empty_lines),
        "total_characters": len(text),
        "total_words": len(text.split()),
        "has_email": "@" in text and "." in text,
        "has_phone": any(char.isdigit() for char in text),
        "has_urls": "http" in text.lower() or "www." in text.lower(),
        "detected_language": language
    }

    # Define section keywords by language
    section_keywords = {
        "en": {
            "experience": ["experience", "work history", "employment", "professional experience"],
            "education": ["education", "academic", "qualification", "degree"],
            "skills": ["skills", "competencies", "expertise", "technical skills"],
            "summary": ["summary", "profile", "about me", "professional summary"],
            "objective": ["objective", "career objective"],
            "projects": ["projects", "portfolio"],
            "certifications": ["certifications", "certificates", "licenses"],
            "awards": ["awards", "achievements", "honors"],
            "languages": ["languages", "language skills"],
            "interests": ["interests", "hobbies"]
        },
        "de": {
            "personal_info": ["persönliche daten", "personalien", "zur person"],
            "experience": ["berufserfahrung", "beruflicher werdegang", "karriere", "tätigkeiten"],
            "education": ["ausbildung", "bildung", "schulbildung", "studium", "akademischer werdegang"],
            "skills": ["kenntnisse", "fähigkeiten", "kompetenzen", "qualifikationen", "fertigkeiten"],
            "summary": ["profil", "zusammenfassung", "persönliches profil", "kurzprofil"],
            "projects": ["projekte", "projektarbeit"],
            "certifications": ["zertifikate", "zertifizierungen", "weiterbildung"],
            "awards": ["auszeichnungen", "ehrungen", "preise"],
            "languages": ["sprachen", "sprachkenntnisse"],
            "interests": ["interessen", "hobbys", "freizeitaktivitäten"],
            "references": ["referenzen", "empfehlungen"]
        }
    }

    # Select appropriate keywords based on language
    if language == "de":
        keywords = section_keywords["de"]
    else:
        keywords = section_keywords["en"]

    # Find sections
    text_lower = text.lower()
    found_sections = []

    for section_type, terms in keywords.items():
        for term in terms:
            if term in text_lower:
                found_sections.append(section_type)
                break

    analysis["found_sections"] = list(set(found_sections))  # Remove duplicates
    analysis["section_count"] = len(analysis["found_sections"])

    return analysis
