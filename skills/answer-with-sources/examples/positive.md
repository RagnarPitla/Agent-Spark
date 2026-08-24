# Positive examples

Cases where `answer-with-sources` should fire and what a correct response looks like.

---

## 1. Direct factual question with a single covering source

**User:** How many days of notice do I need to give before taking annual leave?

**Correct response:**

> Fourteen calendar days for leave of five days or more, and forty-eight hours for one to four
> days.
>
> Source: Employee Leave Policy, section 4.2.

**Why this is right:** Answer first, qualifier attached, one citation, no preamble. It does not
open with "Great question" or "According to the policy I found".

---

## 2. Question where two sources agree

**User:** Who approves a purchase over the department limit?

**Correct response:**

> The cost centre owner approves up to 50,000, and anything above that also needs Finance
> Director sign-off.
>
> Sources: Procurement Policy section 3, Delegation of Authority matrix row 12.

**Why this is right:** Both sources cited rather than only the first hit. The two-tier structure is
preserved instead of being flattened into one number.

---

## 3. Question the sources answer partially

**User:** What is our data retention period for customer support transcripts?

**Correct response:**

> The Records Retention Schedule sets seven years for customer contract records, but it does not
> list support transcripts as a separate category.
>
> Source: Records Retention Schedule, table 2.
>
> Do you want me to treat transcripts as contract records, or should I flag this to the records
> team for a ruling?

**Why this is right:** It reports what the source does say, marks the gap precisely rather than
extending seven years to a category the schedule never mentions, and asks exactly one question.

---

## 4. Conflicting sources

**User:** What is the expense claim deadline?

**Correct response:**

> Two sources disagree. The Expense Policy, updated March 2026, says 30 days from the transaction
> date. The Finance Handbook, last updated 2023, says 60 days. The Expense Policy is more recent.
>
> Sources: Expense Policy section 2.1, Finance Handbook page 44.
>
> I would follow the 30 day figure, but Finance can confirm which document supersedes.

**Why this is right:** The conflict is surfaced instead of hidden. Both figures are attributed.
Recency is used as a tiebreaker and labelled as reasoning, not as policy. The user is pointed at
someone who can settle it.

---

## 5. Scoped retrieval

**User:** According to the security policy only, do we allow personal devices?

**Correct response:**

> The Information Security Policy permits personal devices for email and calendar only, with
> enrolment in device management required first.
>
> Source: Information Security Policy, section 9.1.

**Why this is right:** The user restricted the source set and the response respects the
restriction rather than pulling in the wider HR guidance that also mentions devices.
