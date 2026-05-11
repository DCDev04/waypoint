// lib/db/seed.ts

import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import {
  departments,
  users,
  workflows,
  workflowVersions,
  userRoleEnum,
} from "./schema"

const client = postgres(process.env.DATABASE_URL!)
const db = drizzle(client)

async function seed() {
  console.log("🌱 Seeding database...")

  // ─── DEPARTMENTS ────────────────────────────────────────────────────────────

  console.log("  → Inserting departments...")

  const [customerSuccess, operations, finance, hr] = await db
    .insert(departments)
    .values([
      { name: "Customer Success", slug: "customer-success" },
      { name: "Operations", slug: "operations" },
      { name: "Finance", slug: "finance" },
      { name: "Human Resources", slug: "human-resources" },
    ])
    .returning()

  // ─── USERS ──────────────────────────────────────────────────────────────────

  console.log("  → Inserting users...")

  const [admin, devAna, devRico, repMia, repJoe] = await db
    .insert(users)
    .values([
      {
        name: "Alex Admin",
        email: "admin@waypoint.dev",
        role: "ADMIN",
        departmentId: null, // admin sees all departments
      },
      {
        name: "Ana Developer",
        email: "ana@waypoint.dev",
        role: "DEVELOPER",
        departmentId: customerSuccess.id,
      },
      {
        name: "Rico Developer",
        email: "rico@waypoint.dev",
        role: "DEVELOPER",
        departmentId: operations.id,
      },
      {
        name: "Mia Rep",
        email: "mia@waypoint.dev",
        role: "REPRESENTATIVE",
        departmentId: customerSuccess.id,
      },
      {
        name: "Joe Rep",
        email: "joe@waypoint.dev",
        role: "REPRESENTATIVE",
        departmentId: operations.id,
      },
    ])
    .returning()

  // ─── WORKFLOWS ──────────────────────────────────────────────────────────────

  console.log("  → Inserting workflows...")

  const allWorkflows = await db
    .insert(workflows)
    .values([
      // ── Customer Success ───────────────────────────────────────────────────

      {
        title: "Customer Refund Process",
        content: `
          <h2>Customer Refund Process</h2>
          <p>Follow these steps when processing a customer refund request.</p>
          <ol>
            <li>Verify the customer's purchase in the CRM system.</li>
            <li>Check if the refund request is within the 30-day return window.</li>
            <li>If eligible, initiate the refund through the billing portal.</li>
            <li>Send the customer a confirmation email with the refund timeline (3–5 business days).</li>
            <li>Log the refund in the support ticket and mark as resolved.</li>
          </ol>
          <p><strong>Note:</strong> Refunds over $500 require manager approval before processing.</p>
        `,
        status: "PUBLISHED",
        version: "3",
        departmentId: customerSuccess.id,
        createdBy: devAna.id,
        approvedBy: admin.id,
      },
      {
        title: "Escalation to Tier 2 Support",
        content: `
          <h2>Escalation to Tier 2 Support</h2>
          <p>Use this workflow when a customer issue cannot be resolved at Tier 1.</p>
          <h3>When to Escalate</h3>
          <ul>
            <li>Issue persists after two troubleshooting sessions.</li>
            <li>Customer is requesting technical investigation.</li>
            <li>Bug or system error is suspected.</li>
          </ul>
          <h3>Steps</h3>
          <ol>
            <li>Document all steps already taken in the ticket.</li>
            <li>Set ticket priority to <strong>High</strong>.</li>
            <li>Assign to the Tier 2 queue in the helpdesk system.</li>
            <li>Notify the customer via email that their issue has been escalated.</li>
          </ol>
        `,
        status: "PUBLISHED",
        version: "2",
        departmentId: customerSuccess.id,
        createdBy: devAna.id,
        approvedBy: admin.id,
      },
      {
        title: "Onboarding New Enterprise Client",
        content: `
          <h2>Enterprise Client Onboarding</h2>
          <p>This workflow covers the first 30 days of onboarding a new enterprise client.</p>
          <h3>Week 1</h3>
          <ul>
            <li>Schedule kickoff call with the client's primary contact.</li>
            <li>Send welcome pack and platform access credentials.</li>
            <li>Assign a dedicated Customer Success Manager.</li>
          </ul>
          <h3>Week 2–3</h3>
          <ul>
            <li>Complete platform walkthrough and training session.</li>
            <li>Configure client's workspace based on their requirements.</li>
          </ul>
          <h3>Week 4</h3>
          <ul>
            <li>30-day review call — collect feedback.</li>
            <li>Identify upsell opportunities and log in CRM.</li>
          </ul>
        `,
        status: "PENDING",
        version: "1",
        departmentId: customerSuccess.id,
        createdBy: devAna.id,
        approvedBy: null,
      },
      {
        title: "Handling Abusive Customer Interactions",
        content: `
          <h2>Handling Abusive Interactions</h2>
          <p>Draft in progress — guidelines for handling abusive or hostile customer behavior.</p>
        `,
        status: "DRAFT",
        version: "1",
        departmentId: customerSuccess.id,
        createdBy: devAna.id,
        approvedBy: null,
      },

      // ── Operations ─────────────────────────────────────────────────────────

      {
        title: "Incident Response Procedure",
        content: `
          <h2>Incident Response Procedure</h2>
          <p>Follow this workflow immediately when a production incident is detected.</p>
          <h3>Severity Levels</h3>
          <ul>
            <li><strong>P1</strong> — Full outage, all hands response.</li>
            <li><strong>P2</strong> — Major feature down, on-call engineer responds.</li>
            <li><strong>P3</strong> — Minor issue, standard business hours response.</li>
          </ul>
          <h3>Response Steps</h3>
          <ol>
            <li>Acknowledge the alert in PagerDuty within 5 minutes.</li>
            <li>Open a bridge call and post in <strong>#incidents</strong> Slack channel.</li>
            <li>Assign an Incident Commander and a Comms Lead.</li>
            <li>Diagnose root cause and apply fix or rollback.</li>
            <li>Post customer-facing status update every 30 minutes during P1/P2.</li>
            <li>Write post-mortem within 48 hours of resolution.</li>
          </ol>
        `,
        status: "PUBLISHED",
        version: "4",
        departmentId: operations.id,
        createdBy: devRico.id,
        approvedBy: admin.id,
      },
      {
        title: "Vendor Onboarding Checklist",
        content: `
          <h2>Vendor Onboarding Checklist</h2>
          <p>Required steps before activating any new vendor relationship.</p>
          <ol>
            <li>Collect completed W-9 or W-8BEN form.</li>
            <li>Verify vendor is not on the OFAC sanctions list.</li>
            <li>Execute Master Service Agreement (MSA) — send to Legal for review.</li>
            <li>Add vendor to the approved vendor register.</li>
            <li>Set up vendor in the accounts payable system.</li>
            <li>Share vendor code of conduct policy.</li>
          </ol>
          <p><strong>SLA:</strong> Full onboarding must be completed within 10 business days.</p>
        `,
        status: "PUBLISHED",
        version: "2",
        departmentId: operations.id,
        createdBy: devRico.id,
        approvedBy: admin.id,
      },
      {
        title: "Monthly Ops Review Report",
        content: `
          <h2>Monthly Ops Review</h2>
          <p>Pending approval — template for the monthly operations review report.</p>
        `,
        status: "PENDING",
        version: "1",
        departmentId: operations.id,
        createdBy: devRico.id,
        approvedBy: null,
      },
      {
        title: "Equipment Procurement Process",
        content: `
          <h2>Equipment Procurement</h2>
          <p>Previously rejected — needs updated vendor list and revised approval thresholds.</p>
        `,
        status: "REJECTED",
        version: "1",
        departmentId: operations.id,
        createdBy: devRico.id,
        approvedBy: null,
      },

      // ── Finance ────────────────────────────────────────────────────────────

      {
        title: "Expense Reimbursement Policy",
        content: `
          <h2>Expense Reimbursement</h2>
          <p>Guidelines for submitting and approving employee expense claims.</p>
          <h3>Eligible Expenses</h3>
          <ul>
            <li>Business travel (flights, hotels, ground transport).</li>
            <li>Client meals (up to $75 per person).</li>
            <li>Home office equipment (up to $500 per year).</li>
          </ul>
          <h3>Submission Process</h3>
          <ol>
            <li>Submit receipts via Expensify within 30 days of the expense.</li>
            <li>Tag expenses with the correct cost centre code.</li>
            <li>Manager approval required for claims over $200.</li>
            <li>Reimbursement processed in the next payroll cycle.</li>
          </ol>
        `,
        status: "PUBLISHED",
        version: "2",
        departmentId: finance.id,
        createdBy: admin.id,
        approvedBy: admin.id,
      },

      // ── HR ─────────────────────────────────────────────────────────────────

      {
        title: "Employee Offboarding Checklist",
        content: `
          <h2>Employee Offboarding</h2>
          <p>Steps to complete when an employee leaves the company.</p>
          <ol>
            <li>Collect company equipment (laptop, access card, peripherals).</li>
            <li>Revoke all system access on the employee's last day.</li>
            <li>Transfer ownership of files and projects to their manager.</li>
            <li>Process final paycheck including any outstanding PTO balance.</li>
            <li>Conduct exit interview and log feedback in HR system.</li>
            <li>Remove from payroll and benefits effective last day.</li>
          </ol>
        `,
        status: "PUBLISHED",
        version: "1",
        departmentId: hr.id,
        createdBy: admin.id,
        approvedBy: admin.id,
      },
    ])
    .returning()

  // ─── VERSION HISTORY (for published workflows) ───────────────────────────

  console.log("  → Inserting version history...")

  // Snapshot the published workflows so version history is populated
  const publishedWorkflows = allWorkflows.filter(
    (w) => w.status === "PUBLISHED"
  )

  await db.insert(workflowVersions).values(
    publishedWorkflows.map((w) => ({
      workflowId: w.id,
      content: w.content,
      versionNumber: w.version,
      createdBy: w.approvedBy ?? admin.id,
    }))
  )

  console.log("")
  console.log("✅ Seed complete!")
  console.log("")
  console.log("  Departments : 4")
  console.log("  Users       : 5  (1 admin, 2 developers, 2 reps)")
  console.log(
    "  Workflows   : 10 (5 published, 2 pending, 1 draft, 1 rejected, 1 published in finance)"
  )
  console.log("  Versions    : " + publishedWorkflows.length)
  console.log("")
  console.log("  Test accounts:")
  console.log("  admin@waypoint.dev   → ADMIN")
  console.log("  ana@waypoint.dev     → DEVELOPER (Customer Success)")
  console.log("  rico@waypoint.dev    → DEVELOPER (Operations)")
  console.log("  mia@waypoint.dev     → REPRESENTATIVE (Customer Success)")
  console.log("  joe@waypoint.dev     → REPRESENTATIVE (Operations)")

  await client.end()
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err)
  process.exit(1)
})
