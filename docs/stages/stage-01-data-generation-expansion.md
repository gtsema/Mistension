# Stage 01 — Data Generation Expansion

## Goal
Expand the test data generator (`randomStringUtils.js`) with Russian medical and identity data formats.

## Scope
- `%cyr[N]`: Generate random Cyrillic strings for Russian language fields.
- `%fio`, `%fio_male`, `%fio_female`: Realistic Russian full names (Surname, Name, Patronymic).
- `%oms`: 16-digit Russian compulsory medical insurance policy (OMC).
- `%inn`: 10/12-digit Russian tax identification number (ИНН) with checksum.
- `%passport`: Russian passport series and number (`%d4 %d6`).
- `%phone`: Russian mobile phone number format (`+7 (9XX) XXX-XX-XX`).
- `%date(min, max)`: Dynamic date range generator.

## Acceptance Criteria
- All new template tags correctly parse and generate valid format strings.
- SNILS, INN, and OMS satisfy official verification algorithms.
- Unit tests added to verify generation logic.
