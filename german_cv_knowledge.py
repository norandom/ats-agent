"""German CV style knowledge and ATS requirements."""

# German CV (Lebenslauf) specific conventions and ATS considerations
GERMAN_CV_CONVENTIONS = {
    "standard_format": {
        "name": "Deutscher Lebenslauf",
        "typical_sections": [
            "Persönliche Daten",
            "Berufserfahrung",
            "Ausbildung",
            "Kenntnisse",
            "Sprachen",
            "Weiterbildung",
            "Referenzen"
        ],
        "order": "Usually reverse chronological (newest first)",
        "length": "1-3 pages typical, longer for senior positions"
    },
    "unique_characteristics": [
        "May include professional photo (though optional since 2006 AGG)",
        "Personal information section (birthdate, nationality, marital status - optional)",
        "Detailed education with grades/marks (Abschlussnote)",
        "Often includes gaps explanations (e.g., Elternzeit, Sabbatical)",
        "References section common (Referenzen)",
        "Date and signature may be included",
        "Anschreiben (cover letter) typically separate"
    ],
    "date_format": "DD.MM.YYYY or MM/YYYY for periods",
    "common_qualifications": [
        "Abitur",
        "Fachabitur",
        "Ausbildung",
        "Bachelor/Master",
        "Diplom",
        "Promotion (PhD)",
        "IHK Zertifikat"
    ]
}

GERMAN_ATS_REQUIREMENTS = {
    "keywords": {
        "importance": "High - German job portals (StepStone, Indeed.de, XING) use keyword matching",
        "considerations": [
            "Use German terminology for skills and roles",
            "Include both German and English terms for technical skills if applicable",
            "Match job posting language (formal vs. casual)",
            "Consider compound words (e.g., Softwareentwicklung, Projektmanagement)"
        ]
    },
    "structure": {
        "importance": "High - German ATS expect standard Lebenslauf format",
        "requirements": [
            "Clear section headers in German",
            "Chronological or reverse chronological order",
            "Consistent date formatting",
            "Clear separation between education and work experience",
            "Table format acceptable if parseable"
        ]
    },
    "parsing": {
        "importance": "Critical - German ATS must handle special characters",
        "considerations": [
            "Umlaute (ä, ö, ü, ß) must be properly encoded",
            "Avoid images for critical information",
            "Tables should use standard formats",
            "PDF/A format recommended for long-term archiving",
            "Some German ATS support EUROPASS format"
        ]
    },
    "content": {
        "importance": "High - Thoroughness expected in German culture",
        "expectations": [
            "Complete employment history with no gaps",
            "Detailed education including grades",
            "Specific achievements and responsibilities",
            "Language proficiency levels (e.g., C1, B2)",
            "Driving license if relevant (Führerschein)",
            "Professional development (Weiterbildung)"
        ]
    },
    "privacy": {
        "note": "Since AGG 2006, personal data like photo, age, marital status are optional",
        "ats_handling": "Modern German ATS should handle CVs both with and without personal data"
    }
}

GERMAN_COMMON_JOB_TITLES = [
    "Geschäftsführer", "Projektleiter", "Entwickler", "Softwareentwickler",
    "Teamleiter", "Sachbearbeiter", "Assistenz", "Manager", "Berater",
    "Ingenieur", "Techniker", "Vertriebsmitarbeiter", "Marketingmanager"
]

GERMAN_COMMON_SKILLS = [
    "Teamfähigkeit", "Kommunikationsfähigkeit", "Analytisches Denken",
    "Organisationsfähigkeit", "Belastbarkeit", "Eigenverantwortliches Arbeiten",
    "Kundenorientierung", "Problemlösungsfähigkeit"
]

GERMAN_LANGUAGE_LEVELS = {
    "A1": "Anfänger",
    "A2": "Grundlegende Kenntnisse",
    "B1": "Fortgeschrittene Sprachverwendung",
    "B2": "Selbständige Sprachverwendung",
    "C1": "Fachkundige Sprachkenntnisse",
    "C2": "Annähernd muttersprachliche Kenntnisse",
    "Muttersprache": "Native speaker"
}


def get_german_ats_tips() -> list:
    """Get specific tips for German ATS optimization."""
    return [
        "Verwenden Sie klare deutsche Überschriften (Berufserfahrung, Ausbildung, etc.)",
        "Geben Sie Zeiträume im Format MM/YYYY oder MM.YYYY an",
        "Nennen Sie konkrete Erfolge und Kennzahlen",
        "Erklären Sie Lücken im Lebenslauf (z.B. Elternzeit, Weiterbildung)",
        "Fügen Sie relevante Schlüsselwörter aus der Stellenausschreibung ein",
        "Verwenden Sie Standardschriftarten (Arial, Calibri, Times New Roman)",
        "Achten Sie auf korrekte Rechtschreibung und Grammatik",
        "Sprachkenntnisse mit Niveau angeben (A1-C2, Muttersprache)",
        "Bei technischen Berufen: Deutsche und englische Fachbegriffe verwenden",
        "PDF-Format nutzen, um Formatierung zu erhalten"
    ]


def get_german_section_requirements() -> dict:
    """Get requirements for each section in German CVs."""
    return {
        "Persönliche Daten": [
            "Name (vollständig)",
            "Kontaktdaten (E-Mail, Telefon)",
            "Optional: Geburtsdatum, Geburtsort",
            "Optional: Nationalität",
            "Optional: Foto"
        ],
        "Berufserfahrung": [
            "Zeitraum (von - bis)",
            "Position/Jobtitel",
            "Unternehmen und Standort",
            "Hauptaufgaben und Verantwortlichkeiten",
            "Erfolge und Kennzahlen"
        ],
        "Ausbildung": [
            "Zeitraum",
            "Abschluss",
            "Institution",
            "Optional: Abschlussnote",
            "Optional: Schwerpunkte/Fachrichtung"
        ],
        "Kenntnisse": [
            "Fachkenntnisse",
            "Software/Tools",
            "Methodiken",
            "Kompetenzniveau angeben"
        ],
        "Sprachen": [
            "Sprache",
            "Niveau (A1-C2 oder Beschreibung)",
            "Optional: Zertifikate"
        ]
    }
