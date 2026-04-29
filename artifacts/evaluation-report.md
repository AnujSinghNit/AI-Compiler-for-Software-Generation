# Evaluation Report

Generated: 2026-04-29T14:51:37.607Z

## Summary

OpenAI is optional. The core evaluation is reliability, validation, repair, and runtime execution.

- Total prompts: 20
- Success rate: 100%
- Average latency: 4ms
- Average repairs: 3.30
- Clarification needed: 3

## Provider Modes

- fallback: 20

## Failure Types

- CONFLICTING_REQUIREMENT: 3

## Results

| ID | Category | Provider mode | Result | Latency ms | Repairs | Issues | Failure types |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| product_crm | product | fallback | pass | 22 | 6 | 0 | none |
| product_marketplace | product | fallback | pass | 9 | 4 | 0 | none |
| product_booking | product | fallback | pass | 9 | 1 | 0 | none |
| product_lms | product | fallback | pass | 4 | 7 | 0 | none |
| product_project | product | fallback | pass | 3 | 3 | 0 | none |
| product_support | product | fallback | pass | 5 | 3 | 0 | none |
| product_inventory | product | fallback | pass | 2 | 1 | 0 | none |
| product_finance | product | fallback | pass | 2 | 4 | 0 | none |
| product_events | product | fallback | pass | 3 | 4 | 0 | none |
| product_hr | product | fallback | pass | 2 | 3 | 0 | none |
| edge_vague | edge | fallback | pass | 1 | 1 | 0 | none |
| edge_conflict_auth | edge | fallback | pass | 1 | 1 | 1 | CONFLICTING_REQUIREMENT |
| edge_conflict_premium | edge | fallback | pass | 2 | 4 | 1 | CONFLICTING_REQUIREMENT |
| edge_admin_conflict | edge | fallback | pass | 2 | 3 | 1 | CONFLICTING_REQUIREMENT |
| edge_missing_roles | edge | fallback | pass | 2 | 1 | 0 | none |
| edge_many_features | edge | fallback | pass | 3 | 6 | 0 | none |
| edge_midway_revision | edge | fallback | pass | 3 | 7 | 0 | none |
| edge_under_specified_data | edge | fallback | pass | 2 | 3 | 0 | none |
| edge_hallucination_guard | edge | fallback | pass | 2 | 1 | 0 | none |
| edge_access_pressure | edge | fallback | pass | 1 | 3 | 0 | none |
