#!/usr/bin/env python3
"""Example script showing how to use the ATS CV Agent programmatically."""

import os
from dotenv import load_dotenv
from ats_agent import ATSCVAgent

# Load environment variables
load_dotenv()


def example_basic_analysis():
    """Example: Basic CV analysis without job description."""
    print("Example 1: Basic CV Analysis")
    print("-" * 50)

    agent = ATSCVAgent()

    # Score a CV
    result = agent.score_cv("path/to/your/cv.pdf")

    if result["success"]:
        # Print formatted report
        report = agent.generate_report(result)
        print(report)

        # Access specific scores
        overall = result["ats_analysis"]["overall_score"]
        print(f"\nOverall Score: {overall}/100")
    else:
        print(f"Error: {result['error']}")


def example_with_job_description():
    """Example: CV analysis with job description context."""
    print("\nExample 2: CV Analysis with Job Description")
    print("-" * 50)

    agent = ATSCVAgent()

    job_description = """
    Senior Python Developer

    Requirements:
    - 5+ years of Python development experience
    - Strong knowledge of Django or Flask
    - Experience with REST APIs and microservices
    - Cloud platform experience (AWS, GCP, or Azure)
    - Database design and optimization
    - CI/CD pipeline experience
    """

    result = agent.score_cv(
        "path/to/your/cv.pdf",
        job_description=job_description
    )

    if result["success"]:
        # Print formatted report
        report = agent.generate_report(result)
        print(report)

        # Access parsed information
        parsed = result["ats_analysis"]["parsed_information"]
        print(f"\nExtracted Name: {parsed.get('name', 'Not found')}")
        print(f"Extracted Skills: {', '.join(parsed.get('skills', []))}")
    else:
        print(f"Error: {result['error']}")


def example_custom_analysis():
    """Example: Access raw analysis data for custom processing."""
    print("\nExample 3: Custom Analysis Processing")
    print("-" * 50)

    agent = ATSCVAgent()

    result = agent.score_cv("path/to/your/cv.pdf")

    if result["success"]:
        ats = result["ats_analysis"]

        # Check if CV meets minimum threshold
        if ats["overall_score"] >= 70:
            print("✓ CV meets ATS compatibility threshold")
        else:
            print("✗ CV needs improvement for ATS compatibility")

        # Get improvement priorities
        category_scores = ats["category_scores"]
        weak_areas = {k: v for k, v in category_scores.items() if v and v < 70}

        if weak_areas:
            print("\nPriority improvements needed in:")
            for area, score in sorted(weak_areas.items(), key=lambda x: x[1]):
                print(f"  - {area.replace('_', ' ').title()}: {score}/100")

        # Export to JSON for further processing
        import json
        with open("cv_analysis.json", "w") as f:
            json.dump(result, f, indent=2)
        print("\nFull analysis exported to cv_analysis.json")


if __name__ == "__main__":
    # Check if API key is set
    if not os.getenv("OPENAI_API_KEY"):
        print("ERROR: Please set OPENAI_API_KEY in your .env file")
        exit(1)

    print("ATS CV Agent - Programmatic Usage Examples")
    print("=" * 50)
    print("\nNote: Update the CV paths in this script before running\n")

    # Uncomment the example you want to run:
    # example_basic_analysis()
    # example_with_job_description()
    # example_custom_analysis()

    print("\nTo use these examples:")
    print("1. Update the CV file paths in the example functions")
    print("2. Uncomment the example you want to run")
    print("3. Run: python example.py")
