# Workplace practice, 20 questions per round

All 30 full-course units now offer 20-item grammar, listening, response selection,
contextual spelling, picture statements, mixed practice, passage reading, and passage
listening rounds. The seven picture-course themes also use 20-item rounds. Wrong-answer
review contains only the missed items, so its length can be shorter than 20.

Content is original, inspired by TOEIC workplace communication tasks. This is not an
ETS test, a calibrated simulation, or a TOEIC score predictor. Grammar now selects all twenty items from an 80-item advanced bank, with no
basic-unit allocation. Response distractors share the subject matter of the prompt
but fail to address the intended request or question. Each workplace text has an
additional revised inference or cross-message decision question. Comprehension draws five
texts from a shared 30-text bank, with four questions per text. Material is reused across
units for review; there are not 3,600 independently authored questions. Response questions
have three choices; grammar, comprehension and picture questions have four. Spelling
is supplementary practice, not an official Listening & Reading question type.

Source guidance: https://www.ets.org/toeic/about/faq/product-specific-faq/toeic-listening-reading.html

Authored sources are in content/. Rebuild workplace-content.js with:

    python scripts/build-workplace-content.py
    node tests/workplace-content.test.cjs

The generated bank includes 380 grammar items (80 active advanced items; 300 retained for historical review), 120 comprehension questions across
30 workplace texts, 60 response items, 60 contextual spelling items, and 28 distinct
picture assets. Every 20-item category set has distinct question IDs and distinct
prompts or pictures within the round.

Validation before deployment:
- Static assertions: 30 units, 180 category sets, 3,600 assigned question slots.
- Chromium mobile viewport 390 x 844: all 240 full-course rounds, 4,980 answer
  submissions including wrong-answer retries, no test errors.
- Chromium mobile viewport: all 21 picture-course rounds, 420 answers, no errors.
- Validated 95/100 scoring, one-item wrong-answer retry, 20-item round boundaries,
  five passage review sections, hidden listening transcripts, failed/interrupted/stale
  speech callback gating, old-score and note preservation, image loading, and overflow.
- Speech synthesis was mocked to validate control flow, not real voice quality or
  physical iPhone audio playback. Browser engine was Chromium, not Safari.

Browser scripts: tests/workplace-browser-check.js and
 tests/workplace-picture-browser-check.js. Older browser-check scripts are historical
 checks for the previous short-question release and are superseded for these flows.

New results use toeic3 namespaced score keys. Existing scores, notes, completion flags
and wrong-answer history remain. Main-course export/import accepts all historical score formats.
Reading results continue to use the existing independent local reading store.
