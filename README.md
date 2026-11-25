# The Phantom ₹799

“I ordered one pizza. Why are there two ₹799 entries on my card?”

Ananya wants an answer. A few minutes later, Kabir calls about the same restaurant and the same amount. You maintain the tool their support agent uses. Today the agent can click each statement entry and inspect its details, but has to piece together the story and remember what they told each customer.

Your assignment is to extend the existing app so an agent can **explain a payment, save a case decision, and revisit that decision when new activity changes the answer**. Both customer cases and the refund file are included from the start.

## Open your first case

Clone or download the starter, open its folder in IBM Bob, and open a terminal in the directory containing `package.json`. You need Node.js 22 or newer. The app uses fictional local data and has no packages to install.

```sh
npm test
npm start
```

You should see four passing tests. Open [the support desk](http://127.0.0.1:7990/), select **Case 214**, and click each Little Oven Pizza entry. Watch the **Payment reference** in the details panel. Now try **Case 215**. What would you tell each caller?

## 1. Show the payment history

Add a payment timeline to the open case alongside the existing statement. Each event has its own `id`. Events with the same `paymentRef` in that case belong to one payment. Group them by that reference and sort each group by `occurredAt`, oldest first. Two purchases can have the same merchant and amount.

Show what happened and the net amount charged for each payment. An authorisation reserves money and contributes zero to the net. A capture adds a posted charge. A refund subtracts money. Do the arithmetic in integer paise and display rupees.

| Pizza activity | What the agent should see |
| --- | --- |
| Ananya · Case 214 | One payment with a ₹799 authorisation followed by a ₹799 capture. Net charged for pizza is ₹799. |
| Kabir · Case 215 | Two separate payments, each with a posted charge of ₹799. Together they account for ₹1,598 in pizza charges. |

An authorisation-only payment should appear as pending, with zero posted. The agent should still be able to open individual statement entries.

## 2. Save the agent’s decision

Let the agent record a note and mark the open case **Explained** or **Needs review**. Keep the decision and note with that customer when switching cases or refreshing the page. Local browser storage is sufficient.

Try recording “One ₹799 pizza charge posted” for Ananya and marking her case **Explained**. For Kabir, record “Customer reports one order. Two separate charges posted” and select **Needs review**.

## 3. Reopen a case when the answer changes

Ananya receives a ₹200 refund. The payment provider’s update includes the refund **and** two events the agent has already seen. Give the agent a file picker to import the supplied [refund batch](fixtures/replay-batch.json) into the open case.

- Merge events by event ID. Skip identical repeats. If an ID has conflicting details or the file belongs to another case, explain the problem and reject the entire batch without changing any records or decisions.
- Show the refund after the charge according to event time, even when the refund appears first in the file. Ananya’s pizza payment should now show ₹799 charged, ₹200 refunded and **₹599 net**.
- When an import changes a payment’s net amount in an **Explained** case, move that case to **Needs review** and retain the agent’s note. Other cases keep their own records and decisions.
- The agent can review the refund and mark the case **Explained** again. Importing the same file again must leave it explained. Keep the imported events across refreshes so a previously processed refund stays counted exactly once.

## What to demonstrate

1. Show how the two customers’ pizza histories lead to different answers.
2. Save a decision and note for each customer. Refresh and show both were retained.
3. Import the refund into Ananya’s explained case. Show the ₹599 net, the reopened case and the retained note.
4. Mark Ananya’s case explained again, refresh, and import the same file. Show that she still has five statement entries, a ₹599 pizza payment and an explained case. Check that Kabir’s case still has its original entries and decision.
5. Run the original tests and your new tests. Cover the two pizza histories, refund ordering, reopening, repeat imports, and rejected batches. Walk through one test and one engineering decision you made with Bob. Add a short usage note describing your finished feature.

## Where to look

| File | What you’ll find |
| --- | --- |
| `data/cases.json` | The customers and their starting card activity |
| `server.mjs` | The local server and routes for the page, scripts and case data |
| `public/app.js` | Case selection, statement rows and entry details |
| `public/statement.js` | Statement mapping and display formatting |
| `test/statement.test.js` | Tests for the original behaviour |
| `fixtures/replay-batch.json` | Ananya’s refund and two repeated events |

## Optional IBM Bob prompts

If you’re new to Bob, copy **one prompt at a time** into the same conversation. Read the response and try the suggested checks before continuing. You can also work independently using the requirements above.

**1. Explore the starter**

```text
Read this README and run the baseline tests. Trace one pizza event from data/cases.json to the entry details on screen. Show me where to click in each case and explain how an event ID differs from a payment reference. Stop before editing code.
```

**2. Make a plan**

```text
Plan the three features in this README using the existing app. Identify the files to change, how to keep events and decisions with the right case after refresh, and how to decide whether an import should reopen a case. Give me a short implementation and test plan for review.
```

**3. Build the timeline**

```text
Implement the payment history from part 1. Add tests for Ananya’s one payment, Kabir’s two payments and an authorisation-only payment. Run the tests and tell me how to check both pizza histories in the UI.
```

**4. Save decisions**

```text
Implement part 2. Let me save a status and note per case. Walk me through saving different decisions for Ananya and Kabir, switching between them, and refreshing to check that both decisions survive.
```

**5. Build and test the refund flow**

```text
Read part 3 and fixtures/replay-batch.json. First write a regression test for this sequence: import the refund into an explained case, review and close it again, then replay the same file. Run the test and explain its first failure. Implement the import, persistence and reopening rules. Cover wrong-case and conflicting batches, run the tests again, and give me the UI steps to verify the result.
```

**6. Prepare the demo**

```text
Review our changes against “What to demonstrate”. Run the full test suite, flag any unmet requirement with a concrete example, and help me resolve it. Add a short usage note. Give me a demo checklist and ask me to explain why a repeated refund file leaves an explained case closed.
```
