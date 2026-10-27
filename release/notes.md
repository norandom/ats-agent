# Targeted CV 2.0.0-alpha.1

This major alpha introduces a skill-based workflow for targeted English and German CVs and cover letters, authored live in WordCraft from private structured facts.

- Keeps career evidence separate from the job offer and confirmed application details.
- Creates editable, blue, photo-free CVs with automatic page totals and Germany-targeted letters using the sourced layout checklist.
- Reads documents back, reviews every page and preserves unrelated manual edits.
- Includes adopter setup instructions and fictional live-authoring GIFs.

Download the ZIP and place its `targeted-cv` folder in your AI host's skill directory. Hosts that support `.skill` imports may use that equivalent archive. Follow the README's WordCraft setup guide; the host must provide local file tools and the desktop-connected WordCraft MCP server. WordCraft is not bundled.

The Dagger build checks the asset list, relative links, source contracts and archive contents. Windows desktop acceptance separately passed bilingual authoring, pagination, read-back, save/reopen and page review. Container CI does not exercise the desktop UI.

This alpha is for evaluation. The full conversational refinement loop, host-specific installers and complete clean-install acceptance remain future work. Legacy Python remains in the source repository for migration history and is excluded from skill archives. No universal ATS compatibility or full DIN certification is claimed.
