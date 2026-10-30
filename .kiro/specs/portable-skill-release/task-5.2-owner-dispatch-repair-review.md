# Task 5.2 owner-dispatch repair

## Finding and scope

Actual group 6 regression execution exposed a release-adapter defect. The unchanged profile validator completed eleven suites and its named observations, and strategy completed twenty-four suites. Both adapters then failed because they expected TAP totals from older scripts that print ordinary assertion summaries. Generic CI had not executed these owner branches. Task 5.2 was reopened for this defect.

The repair changes only `owner-validation.cjs` and its existing `full-acceptance.test.cjs` tests. A scoped child-launch adapter invokes each declared test file with native Node test reporting while preserving the complete upstream validators and their post-run checks. Imperative files count as one native file test; their printed assertion or observation totals are never converted into test counts. Existing native test launches retain their current behavior.

## Evidence

The initial plain-script and nested-skip controls failed two tests before repair. A separate inherited binary-protocol control also failed before its guard. Current Windows and Linux focused controls pass, including rejection of nested failure, skip, pending and cancellation evidence. Child-process hooks are restored after success or rejection.

Actual repaired dispatch passed for profile: eleven suites and eleven native file tests. Strategy passed twenty-four suites and fifty-four native tests. Both returned zero, with no failures, cancellations, skips or pending tests; all original owner checks also ran. An independent reviewer matched their raw logs, strict summaries and current two-file hash freeze. Its fresh Windows runner-test command passed ten tests with zero bad counts. The worker's Linux runner-test file likewise passed ten.

Independent verdict: APPROVED for this repair. Syntax, whitespace and boundary checks passed. There are no blocking findings. The nineteen-file generic suite inventory and all thirty-one runtime resources remain unchanged. Private RED, native dispatch, strict-summary and independent review evidence remains under ignored `outputs/m5-task52/`.

## Limits

This is the scoped repair's completion evidence. The earlier candidate was built from the prior source; its generic Dagger results cannot become build or installed acceptance of the repaired source. A fresh artifact and all remaining actual installed owner/application checks are still required. The separate ordinary-user profile-security prerequisite remains under its upstream approval workflow.
