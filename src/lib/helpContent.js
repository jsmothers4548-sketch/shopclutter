// Written help content for ShopClutter, organized by everyday workflow.
// Each article is a task-focused guide: what it's for, then the steps.
// Keep entries accurate to the app's real controls and screens.

export const HELP_TOPICS = [
  {
    key: 'start',
    label: 'Getting Started',
    description: 'Create your account and set up your shop.',
  },
  {
    key: 'jobs',
    label: 'Customers & Jobs',
    description: 'Take in work and move it through the shop.',
  },
  {
    key: 'money',
    label: 'Estimates & Invoices',
    description: 'Quote the job, bill it, and take payment.',
  },
  {
    key: 'inventory',
    label: 'Inventory & Units',
    description: 'Parts on the shelf and units you sell.',
  },
  {
    key: 'staff',
    label: 'Staff & Time',
    description: 'Your team, assignments, and the time clock.',
  },
  {
    key: 'tools',
    label: 'Daily Tools',
    description: 'Reminders, tasks, and job templates.',
  },
  {
    key: 'reports',
    label: 'Sales & Reports',
    description: 'Money in, profit, and shop performance.',
  },
];

export const HELP_ARTICLES = [
  {
    id: 'create-account',
    topic: 'start',
    title: 'Create your account',
    summary: 'Sign up and log in for the first time.',
    steps: [
      {
        heading: 'Sign up',
        body: 'From the welcome screen choose to create an account and enter your email and a password.',
      },
      {
        heading: 'Verify your email',
        body: 'We send a short code to your email. Enter it on the next screen to finish creating the account.',
      },
      {
        heading: 'Log in',
        body: 'After that you log in with your email and password. Use "Forgot password?" on the login screen if you ever need to reset it.',
      },
      {
        heading: 'Joining an existing shop',
        body: 'If your shop already uses ShopClutter, you do not sign up on your own — an admin sends you an invite and you accept it from the email.',
      },
    ],
  },
  {
    id: 'set-up-shop',
    topic: 'start',
    title: 'Set up your shop',
    summary: 'Set your rates and your shop details once, so jobs and paperwork come out right.',
    steps: [
      {
        heading: 'Open your admin tools',
        body: 'Tap "Admin" in the top bar to open the menu. Everything below lives there.',
      },
      {
        heading: 'Set your default rates',
        body: 'Admin → Default Rates. Enter your labor rates, service call fee, pickup and return fees, and your tax rate. New jobs start from these numbers, and you can still change any of them on an individual job.',
      },
      {
        heading: 'Add your shop branding',
        body: 'Admin → Branding. Add your shop name, logo, address, phone, and email. These appear at the top of your estimates and invoices and on the login screen.',
      },
    ],
  },
  {
    id: 'add-staff',
    topic: 'start',
    title: 'Add your staff',
    summary: 'Create staff records so you can assign jobs and track time.',
    steps: [
      {
        heading: 'Open the staff directory',
        body: 'Admin → Staff Directory, then tap Add to create a staff member.',
      },
      {
        heading: 'Fill in their details',
        body: 'Name and contact info, a role title, their pay rate, and their hire date. The pay rate is used for labor cost and profit figures.',
      },
      {
        heading: 'Invite them to log in',
        body: 'To give someone their own login, invite them by email from the staff directory. They set their own password from the invite email.',
      },
    ],
  },
  {
    id: 'add-customer',
    topic: 'jobs',
    title: 'Add a customer',
    summary: 'Create a customer profile that ties their equipment and jobs together.',
    steps: [
      {
        heading: 'Add the customer',
        body: 'Open Customers and tap Add. Enter their name and phone at minimum; email and address are optional.',
      },
      {
        heading: 'Reach them fast',
        body: 'From a customer profile you can tap their phone number to call or text, so you never have to copy it by hand.',
      },
      {
        heading: 'See their history',
        body: 'A customer profile lists every job and unit on record, plus their visit count used for loyalty milestones.',
      },
    ],
  },
  {
    id: 'intake-job',
    topic: 'jobs',
    title: 'Take in a new job',
    summary: 'Create a job ticket when equipment comes into the shop.',
    steps: [
      {
        heading: 'Start a new job',
        body: 'On the Job Board tap "New Job".',
      },
      {
        heading: 'Choose where the work happens',
        body: 'Pick On-site (you go to them) or Off-site (they bring it in). This decides which service and pickup fees apply.',
      },
      {
        heading: 'Optionally start from a template',
        body: 'If you have a template for common work, choose it to pre-fill the parts and labor. You can still change everything.',
      },
      {
        heading: 'Pick or add the customer',
        body: 'Search for an existing customer or add a new one on the spot.',
      },
      {
        heading: 'Describe the equipment and problem',
        body: 'Enter the equipment type, make, model, serial number, and what the customer says is wrong. Save to create the ticket.',
      },
      {
        heading: 'Label the unit (optional)',
        body: 'If you printed a label for a new unit, you can print it right from the intake screen so it matches the ticket.',
      },
    ],
  },
  {
    id: 'job-board',
    topic: 'jobs',
    title: 'Read the Job Board',
    summary: 'Find any job and see what needs attention.',
    steps: [
      {
        heading: 'Status filter',
        body: 'The board opens showing Intake jobs, so new work is right in front of you. Tap the status button to switch to any other status or All.',
      },
      {
        heading: 'Location counts',
        body: 'The units card shows how many jobs are open, on-site, or off-site. Tap a count to filter the board to that group.',
      },
      {
        heading: 'Search',
        body: 'Use the search box for a ticket number, customer, or unit. A matching customer name is clickable and opens their full profile.',
      },
      {
        heading: 'Your assignments',
        body: 'The "My Assignments" button lists jobs assigned to you. Tap "Assigned to me" to hide everyone else\'s work.',
      },
      {
        heading: 'QR code',
        body: 'The QR button lets you scan a unit label to jump straight to its job, or print a label for a new unit.',
      },
    ],
  },
  {
    id: 'job-status',
    topic: 'jobs',
    title: 'Move a job through its statuses',
    summary: 'Track each ticket from intake to closed.',
    steps: [
      {
        heading: 'The statuses',
        body: 'A job moves through: Intake, Diagnosed, Estimate Sent, Approved, In Progress, Waiting on Parts, Ready for Pickup, and Closed.',
      },
      {
        heading: 'Change the status',
        body: 'Open the job and use the status control to set where it is now. The board and counts update to match.',
      },
      {
        heading: 'Closed jobs',
        body: 'A Closed job is locked from further edits unless you are an admin, so finished work stays intact.',
      },
    ],
  },
  {
    id: 'assign-job',
    topic: 'jobs',
    title: 'Assign a job to a technician',
    summary: 'Put a name on a ticket so everyone knows who has it.',
    steps: [
      {
        heading: 'Assign from the job',
        body: 'Open the job and tap Assign, then choose the staff member.',
      },
      {
        heading: 'What they see',
        body: 'The assigned person sees the job under "My Assignments" and can filter the board with "Assigned to me".',
      },
    ],
  },
  {
    id: 'estimate',
    topic: 'money',
    title: 'Create and send an estimate',
    summary: 'Quote the work before you start.',
    steps: [
      {
        heading: 'Open the estimate',
        body: 'On the job page tap Estimate. It opens with the job and customer details already filled in.',
      },
      {
        heading: 'Add parts and labor',
        body: 'List the parts and labor lines for the job. Add discounts or adjust tax if the customer gets a break.',
      },
      {
        heading: 'Print or share it',
        body: 'Use the print control to produce a clean, branded estimate you can print or save and send to the customer.',
      },
      {
        heading: 'Record their answer',
        body: 'Once the customer approves, set the job status to Approved so it is clear the work can go ahead.',
      },
    ],
  },
  {
    id: 'invoice',
    topic: 'money',
    title: 'Invoice a job and record payment',
    summary: 'Bill the finished work and track what is owed.',
    steps: [
      {
        heading: 'Open the invoice',
        body: 'On the job page tap Invoice. It carries over the job, customer, parts, and labor.',
      },
      {
        heading: 'Review the charges',
        body: 'Check the lines, tax, and any discounts. Adjust anything that changed during the job.',
      },
      {
        heading: 'Record payments',
        body: 'As the customer pays, record the payment against the invoice. The balance updates, and the job shows as paid once the balance reaches zero.',
      },
      {
        heading: 'Print it',
        body: 'Use the print control for a branded invoice to hand over or send.',
      },
    ],
  },
  {
    id: 'inventory-parts',
    topic: 'inventory',
    title: 'Manage parts inventory',
    summary: 'Keep track of what is on the shelf and what to reorder.',
    steps: [
      {
        heading: 'Open the parts tab',
        body: 'Open Inventory and use the Parts tab. On a phone, filter by category with the dropdown.',
      },
      {
        heading: 'Add or edit a part',
        body: 'Add a part with its name, part number, category, supplier, stock quantity, unit cost, and reorder threshold.',
      },
      {
        heading: 'Restock and reorder',
        body: 'Use Restock to add stock when a shipment arrives, and check parts at or below their reorder threshold to know what to order.',
      },
      {
        heading: 'Organize categories',
        body: 'Use the "Add Category" button to create and manage the categories your parts are grouped under.',
      },
    ],
  },
  {
    id: 'units-for-sale',
    topic: 'inventory',
    title: 'Sell units and equipment',
    summary: 'Track units you own and sell, and units customers bring in.',
    steps: [
      {
        heading: 'Units for sale',
        body: 'Open Inventory and use the Units for Sale tab. Add a unit with its condition, cost, and price.',
      },
      {
        heading: 'Mark it sold',
        body: 'When a unit sells, mark it sold so it drops off the for-sale list and the sale is recorded.',
      },
      {
        heading: 'Customer units',
        body: 'Equipment customers bring in lives under Units, tied to the customer. Each unit gets a label number so you can scan it back to its job.',
      },
      {
        heading: 'Labels and QR codes',
        body: 'Print a unit label with its number and QR code, then scan that code anywhere in the app to open the unit or its open job.',
      },
    ],
  },
  {
    id: 'time-clock',
    topic: 'staff',
    title: 'Clock in and out',
    summary: 'Track hours on the shop floor.',
    steps: [
      {
        heading: 'Clock portal',
        body: 'Tap "Clock" in the top bar to open the clock portal, then enter your ID to clock in or out for your shift.',
      },
      {
        heading: 'Job timers',
        body: 'On a job you can clock in and out of that specific job to measure time spent on it. Admins can turn on overlapping timers in settings if you need to run more than one at a time.',
      },
      {
        heading: 'Clock out from anywhere',
        body: 'If you are clocked into a job, the active timer shows on the Job Board with a direct way to clock out, so you are never stuck.',
      },
    ],
  },
  {
    id: 'staff-tasks',
    topic: 'staff',
    title: 'Give staff tasks',
    summary: 'Hand out day-to-day work that is not a repair job.',
    steps: [
      {
        heading: 'Open tasks',
        body: 'Open the More menu in the bottom bar and tap Tasks.',
      },
      {
        heading: 'Create a task',
        body: 'Add a task with a title and who it is for. Tasks are separate from repair jobs and are for chores like ordering, cleaning, or callbacks.',
      },
    ],
  },
  {
    id: 'reminders',
    topic: 'tools',
    title: 'Reminders and appointments',
    summary: 'Keep track of callbacks, follow-ups, and scheduled visits.',
    steps: [
      {
        heading: 'Open reminders',
        body: 'Tap the Reminders button on the Job Board, or open Reminders from the More menu.',
      },
      {
        heading: 'Create one',
        body: 'Add a reminder with a title, due date, and a priority. Set the appointment type to General, On-site, or Off-site.',
      },
      {
        heading: 'Link a customer',
        body: 'Attach a customer so the address and contact come along, which is handy for on-site visits.',
      },
      {
        heading: 'Today\'s schedule',
        body: 'Anything due today shows on the Job Board under "Today\'s Schedule", and the Reminders button shows a count of what is due.',
      },
    ],
  },
  {
    id: 'templates',
    topic: 'tools',
    title: 'Use job templates',
    summary: 'Pre-fill common jobs so intake is faster and consistent.',
    steps: [
      {
        heading: 'Open templates',
        body: 'Open the More menu and tap Templates.',
      },
      {
        heading: 'Build a template',
        body: 'Give it a name and set the equipment type, the usual problem description, the parts, and the labor. You can also set a flat rate.',
      },
      {
        heading: 'Use it at intake',
        body: 'When you start a new job, pick the template and its parts and labor fill in automatically. Everything stays editable.',
      },
    ],
  },
  {
    id: 'sales',
    topic: 'reports',
    title: 'Record a sale',
    summary: 'Ring up counter sales that are not repair jobs.',
    steps: [
      {
        heading: 'Open sales',
        body: 'Tap Sales in the bottom bar.',
      },
      {
        heading: 'Make the sale',
        body: 'Record a sale with its line items, price, and tax. Sales are separate from repair invoices and are for parts or units sold over the counter.',
      },
      {
        heading: 'Track payment',
        body: 'The sales list shows what is paid and what is still outstanding, so you can follow up on balances.',
      },
    ],
  },
  {
    id: 'reports',
    topic: 'reports',
    title: 'Read your reports',
    summary: 'See how the shop is doing.',
    steps: [
      {
        heading: 'Open reports',
        body: 'Admin → Reports. Pick a period at the top to look at a month, a year, or a custom range.',
      },
      {
        heading: 'Choose a section',
        body: 'Reports cover Profit & Loss, Employee Earnings, Job and Sales breakdowns, Parts, Expenditures, and Time on Jobs. Tap a section to open it.',
      },
      {
        heading: 'Drill in and print',
        body: 'Tap any staff member, job, or sale to open its full details, and use the print control on any report to save or share it.',
      },
    ],
  },
  {
    id: 'loyalty',
    topic: 'reports',
    title: 'Set up loyalty discounts',
    summary: 'Reward repeat customers automatically.',
    steps: [
      {
        heading: 'Open loyalty',
        body: 'Admin → Loyalty Discounts.',
      },
      {
        heading: 'Create a milestone',
        body: 'Set a visit count and a discount, either a percentage or a fixed amount. The discount applies to the whole ticket subtotal.',
      },
      {
        heading: 'Apply it',
        body: 'When a customer reaches a milestone, a reminder appears for admins. Open their latest job to apply the discount, or dismiss it.',
      },
    ],
  },
  {
    id: 'billing',
    topic: 'reports',
    title: 'Manage your plan and billing',
    summary: 'Change your plan or review your subscription.',
    steps: [
      {
        heading: 'Open billing',
        body: 'Admin → Plan & Billing.',
      },
      {
        heading: 'Compare plans',
        body: 'The page shows your current plan and what each tier includes. Features like reports, the time clock, and templates are unlocked by plan.',
      },
      {
        heading: 'Change plan',
        body: 'Tap "Change plan" and follow the checkout to move up or down. Your data stays with the shop.',
      },
    ],
  },
  {
    id: 'change-history',
    topic: 'reports',
    title: 'Review change history',
    summary: 'See a record of important changes made in the shop.',
    steps: [
      {
        heading: 'Open the history',
        body: 'Admin → Change History.',
      },
      {
        heading: 'Filter the log',
        body: 'Filter by category, action, or who made the change. Each entry shows what changed, who did it, and when.',
      },
      {
        heading: 'Why it matters',
        body: 'Time and pay changes are recorded here, so there is always a clear record of who changed what on money-related records.',
      },
    ],
  },
];

// Split an article into searchable text.
const articleText = (a) =>
  [a.title, a.summary, ...a.steps.map((s) => `${s.heading} ${s.body}`)]
    .join(' ')
    .toLowerCase();

export const filterArticles = (query) => {
  const q = (query || '').trim().toLowerCase();
  if (!q) return HELP_ARTICLES;
  const words = q.split(/\s+/);
  return HELP_ARTICLES.filter((a) => {
    const text = articleText(a);
    return words.every((w) => text.includes(w));
  });
};

export const topicLabel = (key) =>
  HELP_TOPICS.find((t) => t.key === key)?.label || 'Help';