# Browser acceptance checklist

## Smoke

- application starts
- target page loads
- primary happy path completes
- no blocking console error or related failed request

## Acceptance

- all user-visible acceptance criteria
- primary happy path
- highest-risk validation or error path
- navigation, persistence, and refresh behavior when relevant
- screenshots and reproduction steps for failures

## Exploratory

Include acceptance coverage plus:

- adjacent workflows and boundaries
- empty, loading, error, recovery, and permission states
- responsive behavior at relevant viewports
- keyboard and focus behavior for changed controls

## Regression

Include acceptance coverage plus:

- previously affected critical journeys
- project-defined browsers and viewports
- comparison with an approved baseline when one exists
