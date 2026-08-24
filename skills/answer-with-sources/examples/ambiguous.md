# Ambiguous examples

Cases where triggering is a judgement call. These exist to make the boundary concrete for anyone
tuning the skill description or debugging why the orchestrator picked the wrong skill.

---

## 1. Question that is partly factual and partly a write request

**User:** What is the approval limit, and can you raise mine to 25,000?

**Judgement:** Fire, but only for the first clause.

**Correct response:**

> The standard approval limit is 10,000 for individual contributors.
>
> Source: Delegation of Authority matrix, row 4.
>
> I cannot change your limit. That is a request to your cost centre owner through the access
> request form.

**Why it is ambiguous:** A single utterance spanning both `useWhen` and `doNotUseWhen`. Splitting
it is correct. Refusing the whole thing is unhelpful; answering the whole thing is unsafe.

---

## 2. "Should I" phrasing over a factual policy question

**User:** Should I submit this expense as travel or as entertainment?

**Judgement:** Fire, if the policy defines the categories.

**Correct response:**

> The Expense Policy classifies client meals as entertainment and transport or accommodation as
> travel.
>
> Source: Expense Policy, appendix A.
>
> Which of those does the expense cover? I can point you to the right category, though the final
> classification is yours.

**Why it is ambiguous:** "Should I" reads like a request for advice, which `doNotUseWhen` excludes.
But the underlying question is a lookup with a documented answer. Answer the documented part and
leave the decision with the user.

---

## 3. Question about the agent itself

**User:** What sources do you have access to?

**Judgement:** Do not fire. This is a capability question, not a knowledge question.

**Correct response:** Handled by the agent's own instructions, listing configured sources at the
level of granularity the deployment allows.

**Why it is ambiguous:** It is phrased as a factual question and the answer is arguably retrievable.
But routing it through a retrieval skill produces either an empty result or, worse, a hallucinated
source list.

---

## 4. Historical question where sources have been superseded

**User:** What was the travel policy in 2023?

**Judgement:** Fire, but be explicit about what is reachable.

**Correct response:**

> My approved sources hold the current policy, updated in 2026. I do not have the 2023 version, so
> I cannot tell you what it said. Records management may hold prior versions.

**Why it is ambiguous:** A well-formed factual question inside the knowledge domain, where the
correct answer is a gap report rather than content. The failure mode to avoid is answering with the
current policy while implying it was also the 2023 policy.

---

## 5. Very short or contextless input

**User:** retention?

**Judgement:** Fire, but clarify before retrieving.

**Correct response:**

> Retention of what? Records, data, or staff? Each has a different policy.

**Why it is ambiguous:** Retrieval on a one-word prompt returns whichever document scores highest,
which is close to random. One clarifying question costs a turn and prevents a confidently wrong
answer. This is the one case where asking before answering is preferred over answering first.
