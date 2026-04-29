## 3D Print Quote Request Portal — PRD

1. Project Overview
   An internal web portal that allows customers to submit 3D print quote requests and enables admin staff to review, price, and manage those requests. The system replaces informal quote processes (email/chat) with a structured, trackable workflow.

## Goal: Streamline the quote request lifecycle from submission to approval/rejection with clear status tracking and centralized communication.

2. Research
   Real-World Systems
1. Printforge (printforge.com.au)
   Free-to-start 3D print business platform with cost calculator, kanban job tracking, client CRM, invoicing, and shareable quote request links.

- What works: Upload STL → auto-calculates material weight, print time, and cost breakdown. Quote requests via shareable links (rate-limited, revocable). Full pipeline from request → PDF quote → invoice → payment. Integrates Shopify, Stripe, Xero.
- Weakness: Geared toward print shop owners, not internal corporate use. Too many features for a prototype.

2. AutoQuote3D (autoquote3d.com)
   Embeddable instant-quote widget with smart pricing engine, Stripe payments, and visual order pipeline dashboard. 100+ print shops using it.

- What works: Customers upload file → pick material → get price in under 30 seconds. Admin dashboard has a visual pipeline (quote → payment → delivery). Bulk discounts, tiered pricing, and custom themes built in.
- Weakness: Requires Stripe/payments from day one. No manual review step before quoting.

3. Printerhive (printerhive.com)
   Embeddable quote calculator + full production management. Generates instant estimates, then routes requests to an admin dashboard for final confirmation.

- What works: Two-step flow — customer gets a fast estimate first, then admin reviews and confirms final price. Requests land in one dashboard with customer data, model preview, notes, and status pipeline. Clean handoff between quoting and production.
- Weakness: Tightly coupled with their broader production management suite. Less flexible for custom workflows.
  Common User Problems
  Problem Evidence
  Quotes scattered across email/WhatsApp Every competitor mentions replacing "spreadsheet chaos" and "email threads"
  Customers don't know what info to provide Systems that force structured forms (material, quantity, purpose) get better-quality requests
  Admins waste time calculating prices manually Every platform has a cost calculator — this is a universal pain point
  No visibility into quote status Customers constantly ask "where is my quote?" — status pipelines solve this
  Files get lost or mismatched Centralized file storage tied to quote records is standard in every system
  Ideas to Apply

1. Two-step quote flow — give customers a rough estimate instantly, but require admin review before final pricing (Printerhive's model). Best of both worlds: speed for customers, control for admins.
2. Status pipeline dashboard — visual board (Pending → Quoted → Accepted → Production → Delivered). Admins at a glance see bottlenecks. Customers see progress without asking.
3. Structured request form — force required fields: file upload, material preference, quantity, description, and purpose. Prevents back-and-forth "can you clarify?" messages.
4. Centralized file + notes per quote — every uploaded file, admin note, price revision, and customer message lives on one quote page. No scattered context.
5. Quote expiry dates — quotes should have a validity period (e.g., 14 days). Prevents customers from accepting outdated prices when material costs change.

---

3. Problem Understanding

- Customers lack a single place to submit requests with all required details
- Admins have no centralized dashboard to track, prioritize, and respond to quotes
- No standardized status tracking — both sides guess where a request stands
- File attachments, specs, and pricing details get scattered across messages

---

4. Users
   | Role | Description |
   |-------------|-------------|
   | Customer | Internal or external user who submits a print quote request and tracks its progress |
   | Admin | Staff member who reviews requests, calculates pricing, communicates with customers, and updates status |
   | Super Admin | Manages users, materials catalog, pricing templates, and system settings |

---

## 5. MVP Features

**Customer:**

- Register / Login
- Submit new quote request (upload file, describe specs, select material preferences)
- View list of own quote requests with status
- View quote details and admin responses/notes
- Accept or decline a quote
  **Admin:**
- Dashboard with quote request overview
- View and manage all incoming quote requests
- Add internal notes, pricing, and estimated delivery date
- Update quote status
- Communicate with customer via notes/rejections
  **System:**
- File upload support (STL, OBJ, 3MF, images)
- Status-based workflow
- Basic email or in-app notifications on status changes

---

6. Customer Flow

1. Customer logs in
1. Clicks "New Quote Request"
1. Fills form: uploads file(s), selects material (or "recommend"), describes purpose/quantity/notes
1. Submits → request enters "Pending" status
1. Receives notification when admin responds
1. Views quote with pricing and details
1. Chooses to Accept (moves to "Accepted" → proceeds to production) or Decline (moves to "Declined")

---

7. Admin Flow
1. Admin logs in and sees dashboard of quote requests grouped by status
1. Clicks into a "Pending" request
1. Reviews uploaded files, specs, and notes
1. Calculates pricing, adds notes, sets estimated delivery date
1. Submits quote → status moves to "Quoted"
1. Notifies customer
1. Awaits customer response → updates to "Accepted" or "Declined"
1. For accepted quotes, can further update to "In Production", "Completed", "Shipped/Delivered"

---

8. Page Structure
   Customer Pages:

- /login — Authentication
- /dashboard — Overview of customer's quote requests
- /quote/new — Submit new request form
- /quote/:id — View quote details, pricing, status, and actions (accept/decline)
  Admin Pages:
- /admin/login — Admin authentication
- /admin/dashboard — Overview of all quotes with filters
- /admin/quotes/:id — View request details, add pricing, notes, update status
- /admin/settings — Manage materials, pricing templates (post-MVP)

---

9. Database Design
   Users Table

- id, name, email, password_hash, role (customer/admin), created_at
  QuoteRequests Table
- id, user_id (FK), status, material_preference, quantity, description, created_at, updated_at
  QuoteAttachments Table
- id, quote_id (FK), file_name, file_path, file_type, uploaded_at
  QuoteDetails Table
- id, quote_id (FK), admin_id (FK), price, currency, estimated_delivery, admin_notes, created_at
  StatusHistory Table (audit trail)
- id, quote_id (FK), from_status, to_status, changed_by (FK), changed_at, note

---

10. Status Flow
    Pending → Under Review → Quoted → (Accepted | Declined)
    ↓
    In Production → Completed → Delivered
    ↓
    Cancelled (at any point)

| Status        | Who Sets It | Meaning                                  |
| ------------- | ----------- | ---------------------------------------- |
| Pending       | Customer    | Request submitted, awaiting admin review |
| Under Review  | Admin       | Admin is actively reviewing the request  |
| Quoted        | Admin       | Pricing provided to customer             |
| Accepted      | Customer    | Customer approved the quote              |
| Declined      | Customer    | Customer rejected the quote              |
| In Production | Admin       | Print job has started                    |
| Completed     | Admin       | Printing process finished                |
| Delivered     | Admin       | Order delivered to customer              |
| Cancelled     | Either      | Quote or order cancelled                 |

---

## 11. Validation Rules

**Quote Request Form:**

- File upload required (at least 1 file)
- Allowed file types: `.stl`, `.obj`, `.3mf`, `.png`, `.jpg`, `.pdf`
- Max file size: 25MB per file, max 5 files
- Description: required, min 10 chars
- Quantity: required, minimum 1, integer only
  **Admin Quote Submission:**
- Price required, must be > 0
- Estimated delivery date required and must be in the future
- Admin notes required when declining
  **Authentication:**
- Email must be valid format
- Password: minimum 8 characters

---

12. Future Improvements

- 3D file viewer (browser-based STL/OBJ preview)
- Automated pricing calculator based on file volume/material
- Material library with specs and pricing per gram
- Multi-language support
- Customer approval workflow with digital signature
- Integration with production scheduling / printer management
- Advanced analytics dashboard (conversion rates, average turnaround, revenue)
- Payment gateway integration for upfront deposits
- API for third-party integrations
- Bulk quote requests for recurring customers

---
