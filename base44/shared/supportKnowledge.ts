// Server-side support knowledge for the Live Help assistant.
//
// Condensed from the app's Help Center (src/lib/helpContent.js) so the assistant
// answers only from real, written guides. It lives server-side so the client can
// never inject grounding content into the model prompt. Admin-only guides are
// withheld from non-admin staff, matching the Help Center's own filtering.

export const ALLOWED_PAGES = [
  '/board',
  '/customers',
  '/inventory',
  '/staff-tasks',
  '/reminders',
  '/sales',
  '/templates',
  '/units',
  '/help',
  '/clock',
  '/quickbooks',
];

type Article = { title: string; adminOnly?: boolean; body: string };

const ARTICLES: Article[] = [
  {
    title: 'Create your account',
    body: 'Sign up from the welcome screen with your email and a password, then enter the short code we email you. After that you log in with email and password, and "Forgot password?" emails you a reset link. If your shop already uses ShopClutter, an admin invites you by email instead and you accept the invite and set your own password. Everyone sees the shared job board, customers, and inventory; money and time figures (profit, pay rates, clock details) are admin-only.',
  },
  {
    title: 'Set up your shop',
    adminOnly: true,
    body: 'Open Admin in the top bar. Admin > Default Rates sets your on-site and off-site labor rates, service call fee, in-town and out-of-town pickup and return fees, and job and sales tax rates; new jobs start from these and stay editable. Also there: the overtime rule (federal weekly or daily), and overlapping job timers. Admin > Branding sets your shop name, logo, address, phone, and email, shown on estimates, invoices, the app header, and the login screen. These settings can be changed any time; existing jobs keep the numbers they had.',
  },
  {
    title: 'Add your staff',
    adminOnly: true,
    body: 'Admin > Staff Directory, then Add. Fill in name, contact info, role title, pay rate, and hire date. The pay rate feeds labor cost and profit and is admin-only. To give someone a login, invite them by email; until then they still exist as a staff record you can assign work to. When someone leaves, set them inactive rather than deleting. Each staff member can have an employee ID, which is what they enter in the clock portal.',
  },
  {
    title: 'Bring in your existing data',
    adminOnly: true,
    body: 'Importing is a Team-and-up tool; on Solo and Pro it is locked in the Admin menu and tapping it goes to Plan & Billing. Admin > Import Data. Choose one at a time: Customers, Equipment & units, Jobs & history, Parts & inventory, or Sales. Import customers first, because units, jobs and sales link to a customer by name. Download the template or upload your own CSV. The file is read on your device and never uploaded. Match columns (starred ones are required), check the preview for problem rows, review possible duplicates (skip, update, or add new), then import and read the results; failed rows can be downloaded with error notes and re-imported. Re-running an import is safe because duplicates are caught first.',
  },
  {
    title: 'Add a customer',
    body: 'Open Customers and tap Add. Name and phone are the minimum; email and address help with on-site visits and reminders. Tap a phone number anywhere to call or text. A customer profile lists every job and unit, plus the visit count used for loyalty. Use notes for gate codes, preferred contact times, or special handling. You can start a new job straight from a customer profile.',
  },
  {
    title: 'Take in a new job',
    body: 'On the Job Board tap "New Job". Pick On-site (you go to them) or Off-site (they bring it in), which decides the fees and whether an address is needed. Optionally start from a template to pre-fill equipment type, problem, parts, and labor. Pick or add the customer. Enter equipment type, make, model, serial number, and the problem. Set pickup/delivery fees if needed (they fill from Default Rates). Optionally print a unit label. Save to create the job; it starts in Intake at the top of the board.',
  },
  {
    title: 'Read the Job Board',
    body: 'The board opens showing Intake jobs. The status button switches to any status or All and shows counts. The units card shows open, on-site, and off-site counts; tap a count to filter. Search finds a ticket number, customer, or unit, and a matching customer name opens their profile. "My Assignments" lists jobs assigned to you and can hide everyone else\'s. Reminders and appointments due today show under "Today\'s Schedule". The QR button scans a unit label to jump to its job or prints a new label. Each job card shows customer, equipment, status, and visit count, with phone and text shortcuts.',
  },
  {
    title: 'Move a job through its statuses',
    body: 'Statuses in order: Intake (new work just in), Diagnosed (looked it over), Estimate Sent (waiting on the customer), Approved (they said go), In Progress (active work), Waiting on Parts (blocked on delivery), Ready for Pickup (finished), Closed (done and billed). Change status from the job page or right on the job card; the board, counts, and badge grid update to match. A Closed job is locked from edits unless you are an admin.',
  },
  {
    title: 'Add parts, labor, and expenses to a job',
    body: 'On the job page add parts (description, part number, quantity, price), labor lines (description, hours, hourly rate), and expenses for money spent directly on the job (mark billable and reimbursed). Apply a parts discount and a labor discount, each fixed or percentage. A loyalty discount comes off the whole ticket subtotal. The job page totals parts, labor, expenses, fees, discounts, and tax. Administrators also see a profit figure comparing what the job earns against labor pay cost.',
  },
  {
    title: 'Keep a job timeline',
    body: 'On the job page open the timeline and add a note about what you did or found; entries are stamped with who and when. You can attach photos (damage, a serial plate, completed work). The timeline becomes the story of the job for later questions.',
  },
  {
    title: 'Assign a job to a technician',
    adminOnly: true,
    body: 'Open the job, tap Assign, and choose the staff member; more than one can be assigned. The assigned person sees it under "My Assignments" and can filter "Assigned to me". Open the assignments list on the job to add or remove people.',
  },
  {
    title: 'Create and send an estimate',
    body: 'On the job page tap Estimate; it opens with job, customer, and equipment filled in. List parts and labor, add discounts or adjust tax. The estimate shows each line, discounts, tax, and the final total. Use print for a clean branded estimate, or the text button to send the customer a summary. Once the customer approves, set the job status to Approved.',
  },
  {
    title: 'Invoice a job and record payment',
    body: 'On the job page tap Invoice; it carries over job, customer, equipment, parts, labor, and expenses. Review lines, tax, fees, and discounts. Record each payment as it comes in; partial payments are fine and the balance updates, showing paid once it reaches zero. Print a branded invoice or text a summary with the amount due. When done and settled, set the job to Closed.',
  },
  {
    title: 'Manage parts inventory',
    body: 'Open Inventory and use the Parts tab. Add a part with name, part number, category, supplier, stock quantity, unit cost, and reorder threshold. Use Restock when a shipment arrives. Parts at or below their reorder threshold stand out. From a part you can build a supplier order. Use "Add Category" to manage categories. A part keeps a purchase history of what you bought and paid.',
  },
  {
    title: 'Sell units and equipment',
    body: 'Open Inventory and use the Units for Sale tab; add a unit with name, make, model, condition, cost, and price. Mark it sold when it sells, which records the sale and drops it off the list. Customer equipment lives under Units, tied to the customer, each with a label number. Print a unit label with its number and QR code, or print a whole sheet of labels for a batch. Scan a label anywhere to open the unit or its open job.',
  },
  {
    title: 'Clock in and out',
    body: 'Tap "Clock" in the top bar, then enter your employee ID to clock in or out for your shift. On a job you can also clock in and out of that specific job to measure time on it; these job timers are an admin tool and are separate from your shift clock. Admins can allow overlapping timers. If you are clocked into a job, the active timer shows on the Job Board with a direct way to clock out. You can always see and manage your own clock; detailed times for everyone are admin-only.',
  },
  {
    title: 'Review staff timecards',
    adminOnly: true,
    body: 'Admin > Staff Directory, then open a staff member\'s timecard, or open the time clock area to see everyone. Time is grouped by week with each day\'s hours; open a week to see the clock-in and clock-out entries behind the totals. Edit a wrong entry and add a short correction note. Overtime follows the rule set in Default Rates.',
  },
  {
    title: 'Give staff tasks',
    body: 'Open the More menu in the bottom bar and tap Tasks. Add a task with a title and who it is for. Tasks are separate from repair jobs and are for chores like ordering, cleaning, or callbacks. Mark tasks done as they finish so you can see what is outstanding.',
  },
  {
    title: 'Reminders and appointments',
    body: 'Tap the Reminders button on the Job Board, or open Reminders from the More menu. Add a reminder with a title, due date, and priority; set the appointment type to General, On-site, or Off-site. Attach a customer to bring along their address and contact (tap to call or text). Anything due today shows on the Job Board under "Today\'s Schedule". Reminders you create are personal to you. Mark one complete when handled.',
  },
  {
    title: 'Use job templates',
    body: 'Open the More menu and tap Templates. Build a template with a name, equipment type, usual problem description, parts, and labor, and optionally a flat rate and its own default rates. At intake, pick the template and its parts and labor fill in; everything stays editable and the template is unchanged. Update a template when prices or usual parts change.',
  },
  {
    title: 'Reach customers and use quick actions',
    body: 'Wherever a customer\'s phone number appears, tapping it starts a call or text. From an estimate or invoice, the text button sends a summary with the total or amount due. A job has a ready-made pickup/delivery message you can send. Voice intake lets you start a job by describing it out loud. The QR button scans a unit label to jump to that unit or its open job.',
  },
  {
    title: 'Track reimbursements',
    adminOnly: true,
    body: 'Admin > Reimbursements gathers expenses staff marked as paid out of pocket. Each entry shows the job, who paid, and the amount. Once paid back, mark the expense reimbursed so it clears off the list.',
  },
  {
    title: 'Record a sale',
    body: 'Tap Sales in the bottom bar. Record a sale with its line items, price, and tax; sales are separate from repair invoices and are for parts or units sold over the counter. Add each item on its own line with quantity and price. The sales list shows what is paid and what is outstanding. Tap any sale to open its full detail.',
  },
  {
    title: 'Read your reports',
    adminOnly: true,
    body: 'Admin > Reports. Pick a period at the top (month, year, or custom). Sections cover Profit & Loss, Employee Earnings, Job and Sales breakdowns, Parts, Expenditures, and Time on Jobs. Profit & Loss shows money in against money out. Employee earnings shows hours and pay by staff and is payroll-sensitive. Tap any staff member, job, or sale to drill in, and use print on any report to save or share it.',
  },
  {
    title: 'Set up loyalty discounts',
    adminOnly: true,
    body: 'Loyalty discounts are a Team-and-up tool; on Solo and Pro the menu entry is locked and goes to Plan & Billing. Admin > Loyalty Discounts. Create a milestone with a visit count and a discount (percentage or fixed); the discount applies to the whole ticket subtotal. Visit count is based on the customer\'s job tickets, shown on their profile and job cards. When a customer reaches a milestone an admin reminder appears; open their latest job to apply it or dismiss it. Loyalty reminders and discount details are admin-only.',
  },
  {
    title: 'Review change history',
    adminOnly: true,
    body: 'Admin > Change History. Filter by category, action, or who made the change; each entry shows what changed, who did it, and when. Time and pay changes are recorded here so there is a clear record on money-related records.',
  },
  {
    title: 'Manage your plan and billing',
    adminOnly: true,
    body: 'Admin > Plan & Billing. The page shows your current plan and what each tier includes. Reports, jobs and invoicing are on every plan, including Solo. Job templates, the time clock, loyalty discounts, late pickup fees and importing your records are unlocked by plan (most at Team and up). Tap "Change plan" to move up or down through checkout; your data stays with the shop. A lock on a feature means it is not in your current plan and takes you here to compare and upgrade.',
  },
  {
    title: 'Keep a shop roadmap',
    adminOnly: true,
    body: 'Admin > Roadmap. Add an idea or task under a topic with any details, grouping related ideas by topic. Tick off notes as you get to them so the list shows what is still ahead.',
  },
  {
    title: 'Connect QuickBooks',
    adminOnly: true,
    body: 'QuickBooks sync is a Team-and-up tool; on Solo and Pro the Admin menu entry is locked and goes to Plan & Billing. Admin > QuickBooks, administrators only. Tap Connect QuickBooks and sign in to the QuickBooks company this shop keeps its books in. Each shop connects its own company and no shop shares books with another. Choose the direction: Both ways, To QuickBooks, or From QuickBooks. Tap Sync now; the result shows how many records were added, updated, left alone, or failed, and every run is kept in the list below. Customers sync in both directions today. Where the same customer exists on both sides, the ShopClutter details are kept and any difference found in QuickBooks is reported in the run instead of overwriting anything. Invoices and payments do not sync yet. Payroll needs Intuit\'s Payroll API approval for this app and shows as not available yet. Disconnect removes the connection and the stored sign-in, and your customers and jobs stay put. The app also needs its own Intuit keys in place before a company can be connected.',
  },
];

export function buildKnowledge(isAdmin: boolean): string {
  return ARTICLES.filter((a) => isAdmin || !a.adminOnly)
    .map((a) => `### ${a.title}\n${a.body}`)
    .join('\n\n');
}

export const ACTIONS_DOC = `Supported app actions (propose at most ONE, and only when it clearly helps):
- create_reminder: add a personal reminder for the user. Set action_title to a short title and action_due_date to YYYY-MM-DD.
- complete_task: mark one of the user's open tasks as done. Set action_task_id to an id from the open tasks list.
- open_page: take the user to a screen. Set action_path to exactly one of: ${ALLOWED_PAGES.join(', ')}.
Use action_type "none" when no action is clearly useful.`;