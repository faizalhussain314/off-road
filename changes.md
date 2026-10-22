# Task: Update MadProTek Adventure Trail 2026 Registration, Payment, WhatsApp Notifications & Ticket Verification

Act as a **senior full-stack Next.js and TypeScript engineer**. Inspect the existing `off-road-main 2` project and implement the following changes directly in the existing codebase.

## 1. Inspect the Existing Application First

The project uses:
- Next.js 14 App Router and TypeScript.
- Tailwind CSS.
- MySQL with JSON-file fallback persistence.
- Cashfree Payments and manual UPI QR payments.
- Registration and participant ticket dashboards.
- An admin dashboard with manual verification and QR ticket validation.
- QR-code ticket generation and Nodemailer email functionality.

Before editing, inspect the relevant components, API routes, database helpers, registration models, payment webhooks, and ticket-generation workflows.

**Do not rebuild the application, replace the database, remove existing features, or create duplicate payment and ticket systems.** Adapt the existing implementation and preserve backward compatibility with stored registrations.

## 2. Improve Day 1 and Day 2 Registration Cards

Update the ticket-selection cards in the registration page.

Every card must clearly explain in simple English:
- What the selected ticket is for.
- Which event day or days it covers.
- What the participant receives or can participate in.
- Whether they need to bring their own 4×4 vehicle or whether the package provides an alternative experience.
- Any relevant eligibility requirements or restrictions.

Clearly distinguish single-day and two-day access. Do not invent inclusions, benefits, or pricing; use the existing settings and confirmed event-package details.

Keep the design responsive and consistent with the existing MadProTek visual identity.

## 3. Remove the Separate Vehicle Documents Step

Remove the separate **Vehicle Documents** step from the registration wizard.

Move all relevant uploads into the existing **Vehicle Scrutineering / Legal Documents** section.

Organise the section into two groups:

**A. Required legal documents**
- Vehicle Registration Certificate (RC).
- Valid vehicle insurance certificate.
- Valid Pollution Under Control (PUC) certificate, where applicable.
- Driver's valid driving licence.
- Vehicle-owner authorisation, if the registered driver is not the owner.
- Any additional documents required by the event's confirmed rules.

**B. Vehicle inspection photos**
- Front view.
- Rear view.
- Left-side view.
- Right-side view.
- Other existing inspection photos, if applicable.

Clearly explain why each document is needed. Display required fields, upload progress, supported file formats, file-size restrictions, and validation errors.

Update the registration API, document-storage logic, participant dashboard, and admin scrutineering view so existing uploads remain accessible.

## 4. Automatically Send a WhatsApp Thank-You Message After Payment

This is a mandatory feature.

Immediately after a payment is **successfully confirmed by the payment gateway**, automatically send a WhatsApp message to the participant's registered WhatsApp number.

Use this message:

"Hi {{participantName}}! 👋

Thank you for registering for MadProTek Adventure Trail 2026! 🏁🚙

✅ Your payment has been received successfully.

Our team is reviewing your registration and vehicle scrutineering documents. Your official event ticket will be sent to this WhatsApp number shortly after verification.

Registration ID: {{registrationId}}

Thank you for being part of the adventure!

— MadProTek Adventure Trail 2026 Team"

### Payment rules

- For Cashfree payments, trigger the message only after the existing verified webhook or trusted server-side payment verification confirms success.
- For manual UPI payments, do not send the paid-confirmation message merely because the participant uploaded a transaction screenshot. Send it only after an authorised administrator verifies the payment.
- Never trust a client-side success page alone as proof of payment.
- Do not send duplicate messages when a webhook is retried, a payment callback fires multiple times, or the participant refreshes the page.
- Save notification status, timestamp, provider message ID, and errors using the existing persistence architecture or an appropriately designed extension.
- A notification failure must not incorrectly reverse a successfully confirmed payment.

If an authorised administrator rejects a manual payment, display the appropriate payment-rejected or action-required status instead of claiming that payment was received.

## 5. Configure Real WhatsApp Messaging

The event contact number is **8489199319**. Configure this number as the event's designated WhatsApp contact where appropriate.

The automatic payment notification must go to the **participant's registered WhatsApp number**, not just the organiser's number.

Inspect the existing integrations before choosing an implementation. If no WhatsApp Business messaging integration exists, add a server-side integration using the official WhatsApp Business Platform Cloud API or a compatible provider.

Requirements:
- Read credentials from environment variables.
- Never expose access tokens or API secrets in client-side code.
- Validate and normalise phone numbers, including country code handling.
- Use approved WhatsApp message templates when the provider requires them.
- Record delivery status and provider errors.
- Handle timeouts, API errors, and safe retries without duplicate messages.
- Document the required environment variables and configuration steps.
- Do not pretend a message was sent if no real provider has accepted it.

If credentials are unavailable, implement the integration and configuration requirements, provide a clear setup message, and do not fabricate successful delivery.

## 6. Send the Generated Ticket Only After Manual Verification

Keep payment confirmation and ticket issuance as separate states.

Implement this workflow:

1. Participant registers and selects a package.
2. Participant completes payment, or submits a manual UPI payment for review.
3. Confirmed payment triggers the automatic WhatsApp thank-you message.
4. The participant dashboard displays payment status and registration/scrutineering status.
5. Admin reviews payment and the required registration documents.
6. After all required verification checks are passed, the admin can use **Send Ticket via WhatsApp**.
7. Generate or retrieve the official ticket and send its secure ticket link to the participant's registered WhatsApp number.
8. Update the dashboard only after the provider confirms that the send request has been accepted. Show delivery confirmation separately if the provider supplies actual delivery status.

Keep the ticket button disabled until the necessary verification requirements are satisfied.

Prevent sending an unverified, cancelled, unpaid, or otherwise ineligible ticket. Avoid accidentally issuing duplicate tickets or creating duplicate ticket records.

If existing event rules allow any package to skip a particular scrutineering requirement, follow those existing rules rather than imposing a new blanket restriction.

## 7. Update the Participant Dashboard

Update the existing `app/my-ticket/page.tsx` and related components and APIs.

Display:
- Registration ID and selected ticket package.
- Payment status.
- Document-review status.
- Scrutineering status.
- Ticket issuance status.
- WhatsApp notification status, where available.
- Clear next steps if any action is pending or rejected.

After confirmed payment, show this message:

"Thank you! Your payment has been received. Your registration and vehicle documents are being reviewed. Your official ticket will be sent to your WhatsApp shortly after verification."

For an unverified manual UPI payment, show:

"Your payment proof has been submitted and is awaiting verification. Your payment will be confirmed after our team reviews it."

Do not display a valid, usable ticket as issued before the ticket-issuance requirements are satisfied.

## 8. Update the Admin Dashboard

Update `app/admin/page.tsx` and the related API routes.

Ensure administrators can:
- Search and filter registrations.
- Review payment confirmation.
- Inspect uploaded legal documents and vehicle photos.
- Approve or reject documents and scrutineering.
- See clear reasons for rejection.
- Confirm manual UPI payments.
- Generate or retrieve the official ticket.
- Send the ticket using the **Send Ticket via WhatsApp** button.
- See message-sending status and errors.
- Retry failed notifications safely.
- Verify that ticket issuance is not duplicated.

Enforce authorisation and verification on the server. Hiding a button in the user interface is not sufficient security.

## 9. Preserve Existing QR Ticket Validation

The current dashboard already includes ticket validation and QR scanning. **Do not break or replace it.**

Verify that:
- QR codes contain the expected secure ticket identifier or validation token.
- The validation endpoint checks the actual stored ticket and registration status.
- Unissued or ineligible tickets are rejected.
- Invalid or tampered tickets are rejected.
- A previously checked-in ticket cannot be reused for a second check-in.
- Valid tickets remain scannable from the existing admin scanner.
- Existing participant registrations and ticket records continue to work.

Use atomic or transactional validation where supported, so simultaneous scans cannot admit the same ticket twice.

## 10. Backend, Database and Security Requirements

Inspect the database adapter and existing JSON fallback before changing data structures.

- Maintain compatibility with MySQL and JSON persistence.
- Validate all status transitions on the server.
- Use idempotency for payment callbacks and WhatsApp notifications.
- Keep payment verification secrets, WhatsApp credentials, and ticket-generation secrets server-side.
- Validate upload MIME types, file sizes, and access permissions.
- Protect uploaded identity documents from unauthorised public access.
- Avoid storing duplicate participant, payment, or ticket records.
- Do not delete existing data or overwrite production configuration.
- Add database migrations or safe schema updates if required.
- Make sure new fields have sensible defaults for older registrations.

## 11. Testing and Completion Criteria

Run the available linting, TypeScript checks, production build, and relevant automated tests.

Test the following cases:

1. Successful Cashfree payment sends exactly one WhatsApp thank-you message.
2. Repeated payment webhooks do not send duplicate messages.
3. Unverified UPI screenshots do not trigger a paid-confirmation message.
4. An administrator-approved UPI payment triggers the thank-you message.
5. WhatsApp provider failure is recorded without corrupting payment status.
6. Unverified registrations cannot receive an official ticket.
7. An authorised administrator can verify the registration and send the ticket.
8. An already-issued ticket cannot accidentally be duplicated.
9. Ticket validation rejects invalid and unissued tickets.
10. Reusing a checked-in QR code is rejected.
11. Existing registrations still work with the revised document structure.
12. Day 1 and Day 2 ticket cards are understandable on desktop and mobile.
13. The participant and admin dashboards display consistent statuses.
14. Existing payment, promo-code, scanner, and registration functionality remains operational.

Fix any regressions caused by these changes.

## 12. Final Report

After completing the code changes, provide:
- A concise list of files modified.
- The exact registration and payment workflow implemented.
- The WhatsApp integration provider used and any required environment variables.
- Any setup steps still requiring credentials or administrator action.
- Test and build results, including any failures.
- A clear distinction between features tested locally and features verified against a real WhatsApp provider.

**Do not stop after producing a plan or mockup. Make the actual code changes, test them, and report honestly what works and what still requires configuration.**