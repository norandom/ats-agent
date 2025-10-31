# ATS CV Scoring Agent

An intelligent agent that analyzes CVs (PDFs) and scores their compatibility with Applicant Tracking Systems (ATS). Built with OpenAI and PyMuPDF.

**Supports both English CVs and German Lebensläufe!**

## Features

- **Multilingual Support**: Analyzes both English and German CVs with language-specific ATS requirements
  - Automatic language detection
  - German CV conventions (Lebenslauf format, sections, date formats)
  - Bilingual reporting (English or German)
- **PDF Parsing**: Extracts text content from PDF CVs using PyMuPDF
- **ATS Compatibility Scoring**: Evaluates CVs across multiple dimensions:
  - Keywords and relevant skills
  - Document structure and formatting
  - Parsing capability (how well ATS systems can read it)
  - Content quality and completeness
  - Context match (when job description is provided)
- **Detailed Analysis**: Shows what information was successfully parsed
- **Actionable Recommendations**: Provides specific improvement steps
- **AI-Powered Reasoning**: Uses OpenAI to explain the analysis

## Installation

1. Create a virtual environment using uv:
```bash
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

2. Install dependencies:
```bash
uv pip install openai pymupdf python-dotenv langdetect
```

3. Set up your OpenAI API key:
```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

## Usage

### Basic Usage

Score a CV without job description:
```bash
python main.py path/to/cv.pdf
```

### With Job Description

Score a CV against a specific job description:
```bash
# From a text file
python main.py cv.pdf --job-description job_posting.txt

# Or provide directly
python main.py cv.pdf --jd "Software Engineer with 5+ years Python experience"
```

### Save Report to File

```bash
python main.py cv.pdf --output report.txt
```

### JSON Output

```bash
python main.py cv.pdf --json > results.json
```

### German CV (Lebenslauf) Analysis

The agent automatically detects German CVs and applies German-specific ATS requirements:

```bash
# Auto-detect language (recommended)
python main.py lebenslauf.pdf

# Explicitly specify German
python main.py lebenslauf.pdf --language de

# With German job description
python main.py lebenslauf.pdf --jd "Senior Softwareentwickler mit Python-Erfahrung"
```

**German CV Features:**
- Recognizes German section names (Berufserfahrung, Ausbildung, Kenntnisse, etc.)
- Understands German CV conventions and formatting
- Checks for proper handling of Umlaute (ä, ö, ü, ß)
- Evaluates against German ATS systems (StepStone, XING, Indeed.de)
- Generates report in German language

## Output

The tool provides:

1. **Overall ATS Score** (0-100)
2. **Category Scores**:
   - Keywords
   - Structure
   - Parsing Capability
   - Content Quality
   - Context Match (if job description provided)
3. **Parsing Summary**: What was successfully extracted
4. **Extracted Information**: Name, email, phone, skills, experience, etc.
5. **Strengths**: What the CV does well
6. **Weaknesses**: Areas that need improvement
7. **Improvement Steps**: Specific actionable recommendations
8. **Detailed Reasoning**: AI's analysis of ATS compatibility

## Example

```bash
python main.py sample_cv.pdf --jd "Senior Python Developer"
```

Output:
```
================================================================================
ATS CV COMPATIBILITY REPORT
================================================================================

OVERALL ATS SCORE: 78/100

CATEGORY SCORES:
----------------------------------------
  Keywords                :  85/100 [█████████████████░░░]
  Structure               :  75/100 [███████████████░░░░░]
  Parsing Capability      :  80/100 [████████████████░░░░]
  Content Quality         :  82/100 [████████████████░░░░]
  Context Match           :  68/100 [█████████████░░░░░░░]

PARSING SUMMARY:
----------------------------------------
  Pages: 2
  Words: 847
  Sections Found: experience, education, skills, projects
  Contact Info: ✓

EXTRACTED INFORMATION:
----------------------------------------
  Name: John Doe
  Email: john.doe@email.com
  Phone: +1-555-0123
  Experience: 6 years
  Skills: Python, Django, REST APIs, Docker, PostgreSQL, AWS

STRENGTHS:
----------------------------------------
  ✓ Clear section headings using standard terminology
  ✓ Quantifiable achievements with metrics
  ✓ Relevant technical skills clearly listed
  ✓ Contact information easily extractable

WEAKNESSES:
----------------------------------------
  ✗ Uses some decorative formatting that may confuse ATS
  ✗ Missing some keywords from job description
  ✗ Could benefit from more specific skill endorsements

IMPROVEMENT RECOMMENDATIONS:
----------------------------------------
  1. Add keywords like "microservices" and "CI/CD" from job description
  2. Use simpler formatting - avoid text boxes and graphics
  3. Include a skills matrix or dedicated technical skills section
  4. Add more quantifiable metrics to achievements
  5. Ensure consistent date formatting throughout

DETAILED ANALYSIS:
----------------------------------------
The CV is well-structured with clear sections that ATS systems can parse...
[Full reasoning from AI]
================================================================================
```

### German Report Example

For German CVs, the report is generated in German:

```
================================================================================
ATS LEBENSLAUF-KOMPATIBILITÄTSBERICHT
================================================================================

GESAMT-ATS-BEWERTUNG: 82/100

Erkannte Sprache: Deutsch

KATEGORIE-BEWERTUNGEN:
----------------------------------------
  Schlüsselwörter          :  88/100 [█████████████████░░░]
  Struktur                 :  85/100 [█████████████████░░░]
  Parsing-Fähigkeit        :  78/100 [███████████████░░░░░]
  Inhaltsqualität          :  80/100 [████████████████░░░░]
  Kontext-Übereinstimmung  :  79/100 [███████████████░░░░░]

PARSING-ZUSAMMENFASSUNG:
----------------------------------------
  Seiten: 2
  Wörter: 923
  Gefundene Abschnitte: personal_info, experience, education, skills, languages
  Kontaktinformationen: ✓

EXTRAHIERTE INFORMATIONEN:
----------------------------------------
  Name: Max Mustermann
  E-Mail: max.mustermann@email.de
  Telefon: +49-123-456789
  Berufserfahrung: 7 Jahre
  Kenntnisse: Python, Java, Projektmanagement, Scrum, SAP

STÄRKEN:
----------------------------------------
  ✓ Klare deutsche Überschriften für alle Abschnitte
  ✓ Vollständiger Werdegang ohne Lücken
  ✓ Detaillierte Angaben zu Ausbildung mit Abschlussnoten
  ✓ Sprachkenntnisse mit CEFR-Niveau angegeben

VERBESSERUNGSEMPFEHLUNGEN:
----------------------------------------
  1. Verwenden Sie Standardschriftarten für bessere ATS-Kompatibilität
  2. Fügen Sie mehr branchenspezifische Keywords hinzu
  3. Ergänzen Sie quantifizierbare Erfolge bei Berufserfahrung
  ...

================================================================================
```

## Project Structure

```
ats-cv-agent/
├── cv_parser.py              # PDF parsing, language detection, and structure analysis
├── german_cv_knowledge.py    # German CV conventions and ATS requirements
├── ats_agent.py              # Main ATS scoring agent with multilingual support
├── main.py                   # CLI interface
├── example.py                # Programmatic usage examples
├── requirements.txt          # Python dependencies
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
└── README.md                 # This file
```

## How It Works

1. **PDF Parsing**: Uses PyMuPDF to extract text from the CV PDF
2. **Language Detection**: Automatically detects CV language (English, German, etc.)
3. **Structure Analysis**: Analyzes the CV for language-appropriate sections and formatting
4. **AI Analysis**: Sends the CV content to OpenAI (GPT-4) with language-specific prompts
5. **Scoring**: Evaluates across multiple dimensions relevant to regional ATS systems
6. **Recommendations**: Generates actionable improvement suggestions in the appropriate language

## Requirements

- Python 3.10+
- OpenAI API key
- Dependencies: openai, pymupdf, python-dotenv, langdetect

## Notes

- The agent uses GPT-4 for analysis (configurable in `ats_agent.py`)
- Supports multi-page PDFs
- Automatically detects language and adjusts analysis criteria
- German CVs analyzed with German ATS conventions (StepStone, XING, Indeed.de)
- Properly handles special characters (Umlaute: ä, ö, ü, ß)
- Reports generated in the detected language (English or German)
- Extracts both text content and document metadata
- Designed to reflect what actual ATS systems can parse

## License

MIT
