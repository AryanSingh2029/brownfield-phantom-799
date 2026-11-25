# The Phantom ₹799

You’ve joined the team that maintains a card support simulator. A customer says they ordered one pizza but sees two ₹799 entries. A second customer reports the same thing. Extend the existing app so a support agent can tell what happened in each case.

## Run the simulator

Install Node.js 22 or newer before the workshop. Choose this folder in IBM Bob, open the terminal, and run:

```sh
npm start
```

Open [http://127.0.0.1:7990](http://127.0.0.1:7990). The other terminal command you need is `npm test`. The simulator uses local, fictional data and requires no npm installation or service credentials. If port 7990 is busy, set the `PORT` environment variable and restart.

## First checkpoint · Investigate a payment

Start by opening both cases and inspecting their entries. Ask Bob to trace the path from the sample data to the selected-entry panel. In Plan mode, have it propose the smallest set of changes, then review that plan before generating code.

- Add a payment timeline for the open case. Group entries by `paymentRef` within that case and show events oldest first. Keep the existing statement and its entry details working.
- In Case 214, the two pizza entries share a reference. Show one payment with an authorisation followed by a posted charge. The amount posted is ₹799.00.
- In Case 215, the two pizza entries have different references. Show two payments with ₹799.00 posted for each. Matching merchants or amounts alone do not link payments.
- Show an authorisation-only payment as pending or authorised. It contributes zero to the amount posted.

## Second checkpoint · Replay a batch

Your facilitator will hand out a JSON batch with a `caseId` and an `events` array. Add a way to load it into the open case while the app is running.

- Merge the batch into the matching case. Keep existing entries, and skip identical events already seen under the same event ID. Reject conflicting data under an existing ID or a batch for another case without changing the open case.
- Use event time for the timeline. A batch can list a refund before the original charge.
- A refund reduces the amount posted for that payment. Display the refund and the net amount. Use integer paise for arithmetic.
- Loading the same batch twice should produce the same entries and totals as loading it once. In-memory changes are enough.

Ask Bob for test cases before applying the final fix. Run the original tests and add coverage for the two pizza cases plus the out-of-order refund and repeated import. Add a short note to this README explaining how to use your feature. Be ready to demo both cases and one test.

## Optional IBM Bob prompts

Use these one at a time. Confirm Bob’s explanation against the app, review its proposed changes, and check the result yourself before moving on. You can adapt the prompts or write your own.

**1. Understand the existing app**

> Read this README and trace how the sample payment data reaches the statement and selected-entry panel. Point me to the relevant files and functions. Using the two pizza cases, explain how a payment reference differs from an event ID. Keep this step read-only.

**2. Plan the first checkpoint**

> In Plan mode, propose the smallest change that adds a payment timeline to the open case. List the files you’d change, the existing behaviour to preserve, and how we can check both ₹799 cases. Stop after the plan so I can review it.

**3. Build the first version**

> Implement the first checkpoint using the plan we agreed on. Keep the statement and entry details working. Run the baseline tests, then tell me what to click in both cases to check the new timeline.

**4. Plan and debug the replay** *(once you get the second batch)*

> Read the second checkpoint and inspect the new JSON batch. Pick one failure this input could expose and write a regression test for it. Run the test and explain what the result tells us before changing the payment logic. If the app can’t load the batch yet, outline the smallest way to add that capability.

**5. Finish the second checkpoint**

> Implement the batch replay rules from the README and run the tests. Walk me through how to check the refund in the UI, import the same file again, and confirm that the number of entries and net amount stay the same.

**6. Review and document**

> Review our diff against both checkpoints. Point out any missing test or behaviour change with a concrete example. Add a short README note on using the timeline and replay feature, and give me a brief demo checklist.

## Code map

| File | Role |
| --- | --- |
| `data/cases.json` | The two fictional cases and their original card events |
| `server.mjs` | Local server for the page, browser scripts, and case data |
| `public/app.js` | Case selection, statement rows, and the selected-entry panel |
| `public/statement.js` | Statement mapping and display formatting |
| `test/statement.test.js` | Baseline checks for the existing statement |

Each event has an `id`, `paymentRef`, `type`, `merchant`, `amountPaise`, and UTC `occurredAt` timestamp. The simulator recognises `authorisation`, `capture` (a posted charge), and `refund`. The UI displays times in IST. Payment rules in this exercise are fictional and are supplied in the checkpoints.
