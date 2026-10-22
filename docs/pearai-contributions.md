# PearAI public contribution review

Reviewed 2026-10-22. GitHub account: [MaxFSP](https://github.com/MaxFSP).

## Scope and method

Enumerated the 13 public repositories in [trypear](https://github.com/orgs/trypear/repositories?type=all), queried author-filtered pull requests, checked individual PR descriptions and merge state, and inspected author-filtered commit history in the editor, extension, website, and documentation repos. Relevant lists each reported one page. The site uses a static reviewed snapshot without GitHub API calls at runtime.

The public API was unavailable here; public GitHub HTML supplied the records. Global search returned zero despite directly verified PRs, so it was not used for totals. Some searches returned service errors; these are unknown, not zero contributions. Private backend work, deleted history, and all review/comment activity cannot be verified by this inventory. Résumé dates describe the broader engagement, not the date range of these PRs.

## Findings

16 authored PRs: 15 merged and 1 open, across four current repositories. The known-issues page remains an open proposal and is never presented as shipped. The 34 commit records are history attributed to MaxFSP by GitHub, including merges and rewritten history. They are not added to PR totals or treated as 34 separate features.

| Repository | PR | State | Summary |
| --- | --- | --- | --- |
| pear-landing-page | [#386](https://github.com/trypear/pear-landing-page/pull/386) | merged | Updated the installation command and documented NixOS among tested distributions. |
| pearai-app | [#115](https://github.com/trypear/pearai-app/pull/115) | merged | Fixed new-window layout, recent-item display, and responsive styling. |
| pear-landing-page | [#358](https://github.com/trypear/pear-landing-page/pull/358) | open | Proposed a known-issues page with typed data, a list component, repository configuration, and severity indicators. |
| pearai-submodule | [#150](https://github.com/trypear/pearai-submodule/pull/150) | merged | Adjusted Aider and Perplexity badges, responsive layout, and tab height constraints. |
| pearai-submodule | [#129](https://github.com/trypear/pearai-submodule/pull/129) | merged | Checked workspace folders before opening chat so it stays closed on the new-window page. |
| pear-landing-page | [#346](https://github.com/trypear/pear-landing-page/pull/346) | merged | Improved blog spacing, lists, code-block contrast, and embedded-frame responsiveness. |
| pearai-app | [#106](https://github.com/trypear/pearai-app/pull/106) | merged | Updated the desktop editor’s new-window visuals. |
| pear-landing-page | [#344](https://github.com/trypear/pear-landing-page/pull/344) | merged | Added Linux installation guidance and a download option for older CPUs. |
| pearai-documentation | [#19](https://github.com/trypear/pearai-documentation/pull/19) | merged | Made embedded videos responsive on mobile and fixed navigation overflow. |
| pear-landing-page | [#295](https://github.com/trypear/pear-landing-page/pull/295) | merged | Updated the Linux installation guide with revised setup instructions. |
| pear-landing-page | [#280](https://github.com/trypear/pear-landing-page/pull/280) | merged | Added Linux downloads and an installation guide, refined the macOS dropdown, and adjusted the pricing layout. |
| pear-landing-page | [#247](https://github.com/trypear/pear-landing-page/pull/247) | merged | Removed launch-countdown components and related logic after release. |
| pear-landing-page | [#245](https://github.com/trypear/pear-landing-page/pull/245) | merged | Made the footer consistent across pages and added link-hover feedback. |
| pearai-documentation | [#2](https://github.com/trypear/pearai-documentation/pull/2) | merged | Corrected the documented shortcut for expanding chat. |
| pear-landing-page | [#238](https://github.com/trypear/pear-landing-page/pull/238) | merged | Prepared the v1 website: removed waitlist routes and gating, enabled downloads, and updated pricing and mobile navigation. |
| pear-landing-page | [#209](https://github.com/trypear/pear-landing-page/pull/209) | merged | Scaffolded an early-access route and component for later server integration. |

## Additional history

- [Resize-chat shortcut](https://github.com/trypear/pearai-app/commit/ab7ad49bfc12376d249784ad99793227c92b4df0): earlier app-side shortcut work carried into current history.
- [Chat and split-editor shortcut correction](https://github.com/trypear/pearai-submodule/commit/18e66c7fec6ca5e816c922cefa087bdadc061bd2): earlier extension work.
- [Configuration cleanup](https://github.com/trypear/pearai-submodule/commit/a9baa47be30d9f9c526f5ccb3b862370faa33746): removed hard-coded Supabase configuration. No configuration values are copied into the portfolio.
- Website history also includes download-link updates, countdown/animation fixes, and merge commits. All 34 linked history records are retained in src/contributions.ts.
- The MaxFSP legacy editor fork points to veerbia/pearai-app. Its one author-filtered commit is another copy of the shortcut work and is not counted again. Legacy PR URLs 155, 171, and 279 returned 404 and are not presented as verified PR links.

## Other public repositories checked

Author PR searches returned no matches for PearAI-Roo-Code, expo-template, pearai-mcp-templates, pearai-aider, pearai-hackathon, pearai-inventory, and pearai-server-issues-public. The master repo returned no matches on retry. Ralli’s PR search repeatedly returned service errors; it is a website fork, and inherited history is not independent contribution evidence. Authored-issue searches were checked, but several failed. Reviewer-filtered PR searches returned no matches in the extension, website, and documentation repositories; the editor review search returned a service error. Issues and review/comment activity are not represented by the verified PR count.

## Portfolio presentation

Highlight four representative merged changes: Linux downloads, v1 release preparation, workspace-aware chat, and responsive documentation video. Expose all 16 verified PRs and separately labelled commit history. Keep backend/authentication and Docker experience grounded in the supplied résumé rather than inventing public PR links. Infer no performance metrics from PR titles.
