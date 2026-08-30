# Pricing Intelligence

Freight-forwarding pricing workspace focused on turning inbound RFQs into profitable quotes faster.

## MVP 0.1

- Pricing Inbox / RFQ queue
- Structured shipment extraction workspace
- Missing-information detection
- Buy / sell / gross-profit / margin calculations
- Recommended sell based on target margin
- Quote status workflow: New → Ready → Sent → Won/Lost
- Revenue pipeline dashboard
- Rate Memory view
- Browser persistence via localStorage
- Responsive single-page interface suitable for GitHub Pages

## Product direction

The system should become an email-first freight pricing intelligence layer rather than another TMS. The intended workflow is:

Inbound RFQ email → classify request → extract shipment data → identify missing fields → retrieve historical/vendor rates → normalize costs → recommend sell price → operator approval → send quote → monitor customer response → record win/loss and pricing intelligence.

## Next build priorities

1. Real RFQ intake from email and pasted messages.
2. AI extraction into a normalized freight schema.
3. Customer, vendor and lane pricing memory.
4. Multi-option vendor rate comparison and landed buy-cost normalization.
5. Real quote document/email generation.
6. Follow-up detection and win/loss intelligence.
7. Supabase multi-tenant persistence and authentication.

## Run

Open `index.html` directly or enable GitHub Pages from the repository settings using the `main` branch root.