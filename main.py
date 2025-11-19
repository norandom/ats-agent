#!/usr/bin/env python3
"""Main script to run the ATS CV scoring agent."""

import os
import sys
import argparse
from dotenv import load_dotenv
from ats_agent import ATSCVAgent


def main():
    """Main entry point for the ATS CV scoring tool."""
    parser = argparse.ArgumentParser(
        description="Score CV compatibility with Applicant Tracking Systems (supports English and German CVs)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py cv.pdf
  python main.py cv.pdf --job-description job.txt
  python main.py cv.pdf --jd "Software Engineer with Python experience"
  python main.py lebenslauf.pdf --language de
  python main.py cv.pdf --lang en
        """
    )

    parser.add_argument(
        "cv_path",
        help="Path to the CV PDF or DOCX file"
    )

    parser.add_argument(
        "--job-description", "--jd",
        dest="job_description",
        help="Job description text or path to text file"
    )

    parser.add_argument(
        "--language", "--lang",
        dest="language",
        choices=["en", "de", "auto"],
        default="auto",
        help="CV language: 'en' (English), 'de' (German/Deutsch), or 'auto' (auto-detect, default)"
    )
    
    parser.add_argument(
        "--model",
        dest="model",
        default=None,
        help="OpenAI model to use (e.g., 'gpt-4o', 'gpt-4o-mini'). Overrides OPENAI_MODEL env var."
    )

    parser.add_argument(
        "--output", "-o",
        help="Output file path for the report (default: print to console)"
    )

    parser.add_argument(
        "--json",
        action="store_true",
        help="Output results in JSON format"
    )

    args = parser.parse_args()

    # Load environment variables from .env file in the same directory as this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    env_path = os.path.join(script_dir, '.env')

    # Force reload to override any existing environment variables
    load_dotenv(env_path, override=True)

    # Check if API key is set
    if not os.getenv("OPENAI_API_KEY"):
        print("ERROR: OPENAI_API_KEY not found in environment variables")
        print("Please create a .env file with your OpenAI API key:")
        print("  OPENAI_API_KEY=your_key_here")
        sys.exit(1)

    # Check if CV file exists
    if not os.path.isfile(args.cv_path):
        print(f"ERROR: CV file not found: {args.cv_path}")
        sys.exit(1)

    # Handle job description
    job_description = None
    if args.job_description:
        # Check if it's a file path
        if os.path.isfile(args.job_description):
            with open(args.job_description, 'r') as f:
                job_description = f.read()
            print(f"Loaded job description from: {args.job_description}")
        else:
            # Treat it as direct text
            job_description = args.job_description

    # Initialize agent and score CV
    print(f"\nInitializing ATS CV Agent...")
    agent = ATSCVAgent(model=args.model)

    # Determine language
    language = None if args.language == "auto" else args.language

    print(f"Analyzing CV: {args.cv_path}\n")
    result = agent.score_cv(args.cv_path, job_description, language)

    # Output results
    if args.json:
        import json
        output = json.dumps(result, indent=2, ensure_ascii=False)
    else:
        output = agent.generate_report(result)

    # Write to file or print
    if args.output:
        with open(args.output, 'w') as f:
            f.write(output)
        print(f"\nReport saved to: {args.output}")
    else:
        print("\n" + output)

    # Exit with appropriate code
    if result.get("success"):
        sys.exit(0)  # Successful analysis
    else:
        sys.exit(1)  # Error occurred during analysis


if __name__ == "__main__":
    main()
