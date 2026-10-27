# Writing skills and setup

The workflow can use two optional writing skills: [COBESY](https://github.com/norandom/Skills/tree/main/cobesy) for structure and [Humanizer](https://github.com/blader/humanizer) for natural prose. They improve the writing process; they do not verify qualifications or predict an ATS ranking.

## Choose how to use them

If both skills are available to your agent, the workflow uses COBESY to organize the argument and Humanizer to review the wording. If a skill is missing, the agent offers:

> COBESY or Humanizer is not available in this session. Would you like help installing the missing skill, instructions to install it yourself, or to continue with the built-in writing guidance?

This is an optional setup choice. Continuing without installation still includes a review for clear contribution, factual support, concise sentences and generic wording. The agent identifies the fallback instead of claiming it ran a skill it could not access. It does not repeatedly ask after you decline in the same session.

## Ask your agent to install a missing skill

You can use either request separately:

> Install only COBESY from https://github.com/norandom/Skills/tree/main/cobesy for this agent. Preserve any existing installation.

> Install Humanizer from https://github.com/blader/humanizer for this agent. Preserve any existing installation.

The agent should use the installation mechanism supported by your host and identify the source and destination before making changes. If you already requested installation, that request is sufficient authorization within its stated scope. A general request to write a CV does not by itself request a new installation.

For manual installation, follow the current instructions in the [Skills collection](https://github.com/norandom/Skills) and [Humanizer repository](https://github.com/blader/humanizer). Hosts differ in how they discover skills, so there is no universal command in this guide. Install just the relevant skill; the CV workflow does not depend on the rest of the collection.

After installation, the agent checks whether the skill is available. If the host needs a new session to load it, save the private draft and resume there, or continue with the built-in guidance. An installation attempt alone does not mean the skill was loaded or used.

## What the writing review preserves

The review keeps your actual qualifications, employment titles, dates, metrics and level of responsibility. It can improve a sentence, but cannot turn participation into ownership or add a result for emphasis. Application copy uses no em or en dashes. Any upstream skill's style suggestions remain subordinate to these factual and editorial constraints.
