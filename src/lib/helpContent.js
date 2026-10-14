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
    description: 'Reminders, appointments, tasks, and job templates.',
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
        body: 'From the welcome screen choose to create an account and enter your email and a password. Use a password you will remember — it protects your shop data.',
      },
      {
        heading: 'Verify your email',
        body: 'We send a short code to your email. Enter it on the next screen to finish creating the account. If it does not arrive, check your spam folder and use the resend option.',
      },
      {
        heading: 'Log in',
        body: 'After that you log in with your email and password. Use "Forgot password?" on the login screen if you ever need to reset it — we email you a link to set a new one.',
      },
      {
        heading: 'Joining an existing shop',
        body: 'If your shop already uses ShopClutter, you do not sign up on your own — an admin sends you an invite and you accept it from the email, then set your own password.',
      },
      {
        heading: 'What you can see',
        body: 'Everyone in a shop sees the shared job board, customers, and inventory. Money and time figures — profit, pay rates, and clock details — are only shown to shop administrators.',
      },
    ],
  },
  {
    id: 'set-up-shop',
    topic: 'start',
    adminOnly: true,
    title: 'Set up your shop',
    summary: 'Set your rates and your shop details once, so jobs and paperwork come out right.',
    steps: [
      {
        heading: 'Open your admin tools',
        body: 'Tap "Admin" in the top bar to open the menu. Everything below lives there, and only administrators see this menu.',
      },
      {
        heading: 'Set your default rates',
        body: 'Admin → Default Rates. Enter your on-site and off-site labor rates, service call fee, in-town and out-of-town pickup and return fees, and your job and sales tax rates. New jobs start from these numbers, and you can still change any of them on an individual job.',
      },
      {
        heading: 'Set your overtime rule',
        body: 'In Default Rates choose whether overtime follows the federal weekly rule or a daily rule, so your time reports match how you actually pay.',
      },
      {
        heading: 'Allow overlapping job timers',
        body: 'If your techs sometimes need to track time on more than one job at once, turn on overlapping timers in Default Rates. Leave it off if a tech should only ever be on one job.',
      },
      {
        heading: 'Add your shop branding',
        body: 'Admin → Branding. Add your shop name, logo, address, phone, and email. These appear at the top of your estimates and invoices, in the app header, and on the login screen.',
      },
      {
        heading: 'Revisit any time',
        body: 'These settings are not one-time. Change them whenever your rates or details change — existing jobs keep the numbers they already had, while new jobs pick up the new ones.',
      },
    ],
  },
  {
    id: 'add-staff',
    topic: 'start',
    adminOnly: true,
    title: 'Add your staff',
    summary: 'Create staff records so you can assign jobs and track time.',
    steps: [
      {
        heading: 'Open the staff directory',
        body: 'Admin → Staff Directory, then tap Add to create a staff member.',
      },
      {
        heading: 'Fill in their details',
        body: 'Name and contact info, a role title, their pay rate, and their hire date. The pay rate is used for labor cost and profit figures, and is only visible to administrators.',
      },
      {
        heading: 'Invite them to log in',
        body: 'To give someone their own login, invite them by email from the staff directory. They accept the invite and set their own password. Until they have a login they still exist as a staff record you can assign work to.',
      },
      {
        heading: 'Mark someone inactive',
        body: 'When a staff member leaves, set their status to inactive instead of deleting them. Their name stays on past jobs and time records, but they drop off the active list.',
      },
      {
        heading: 'Employee IDs',
        body: 'Each staff member can have an employee ID. That ID is what they enter in the clock portal to clock in and out, so keep it short and easy to remember.',
      },
      {
        heading: 'How many people your plan allows',
        body: 'Solo is a one-person plan, so adding staff members and staff logins is part of Pro and up. On Solo the staff screen explains this and shows your plan options; anyone already on your staff list stays exactly as they are, and can still be edited or marked inactive. Upgrading unlocks adding your crew and giving each person their own login.',
      },
    ],
  },
  {
    id: 'bring-in-data',
    topic: 'start',
    adminOnly: true,
    title: 'Bring in your existing data',
    summary: 'Move customers, jobs, inventory and sales over from a spreadsheet.',
    steps: [
      {
        heading: 'Which plans include it',
        body: 'Bringing in your existing records is part of Team and up. On Solo and Pro, Import Data shows a lock in the Admin menu, and tapping it takes you to Plan & Billing to compare.',
      },
      {
        heading: 'Open the importer',
        body: 'Admin → Import Data. Only administrators see this menu.',
      },
      {
        heading: 'Pick what you are bringing in',
        body: 'Choose Customers, Equipment & units, Jobs & history, Parts & inventory, or Sales. Do one at a time so you can check each one as you go.',
      },
      {
        heading: 'Order matters',
        body: 'Import customers first. Equipment, jobs and sales are linked to a customer by name, so those customers need to be in the app already. If a job cannot find its customer, that row is left out and you can bring it in after.',
      },
      {
        heading: 'Start from a template or your own file',
        body: 'Download the template to see the exact columns, fill it in, and bring it back. If you already keep your records in a spreadsheet, just upload your CSV file instead — you do not have to reshape it first.',
      },
      {
        heading: 'Your file stays on your device',
        body: 'The file is read in the app on the device you are using and is never uploaded anywhere. Only the finished records are saved to your shop.',
      },
      {
        heading: 'Match your columns',
        body: 'ShopClutter matches your column names to its own fields automatically. Check the list and change anything it got wrong, then choose which column feeds each field. Anything marked with a star has to be matched before you can continue.',
      },
      {
        heading: 'Check the rows',
        body: 'The preview shows how many rows are ready and how many need attention. Rows with a problem — a missing name, a price that is not a number — are listed by row number and are left out of the import. Fix them in your file and bring it back, or import the good rows now and the rest later.',
      },
      {
        heading: 'Review the matches',
        body: 'ShopClutter looks for rows that look like records you already have, and shows you what it found. For each one choose to skip it, update the existing record with the new details, or add it as a new record. Nothing is written until you confirm.',
      },
      {
        heading: 'Import and read the results',
        body: 'The last screen shows how many records were added, updated, skipped and failed. If any rows failed, download them with their error notes, fix them in your spreadsheet, and import just that file again.',
      },
      {
        heading: 'If something goes wrong partway',
        body: 'Large files are imported in batches. If the import stops before it finishes, the results screen tells you exactly how many records were saved before it stopped. Because every import checks for duplicates first, running it again is safe — the records that already made it in show up in the duplicate review instead of being added twice.',
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
        body: 'Open Customers and tap Add. Enter their name and phone at minimum; email and address are optional but make on-site visits and reminders easier.',
      },
      {
        heading: 'Reach them fast',
        body: 'From a customer profile you can tap their phone number to call or text, so you never have to copy it by hand.',
      },
      {
        heading: 'See their history',
        body: 'A customer profile lists every job and unit on record, plus their visit count used for loyalty milestones. Tap any job to open it.',
      },
      {
        heading: 'Add notes and instructions',
        body: 'Use the notes area for anything the shop should remember about this customer — gate codes, preferred contact times, or special handling.',
      },
      {
        heading: 'Start a job from here',
        body: 'You can create a new job straight from a customer profile, so their details are already attached to the ticket.',
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
        body: 'Pick On-site (you go to them) or Off-site (they bring it in). This decides which service and pickup fees apply, and whether an off-site address is needed.',
      },
      {
        heading: 'Optionally start from a template',
        body: 'If you have a template for common work, choose it to pre-fill the equipment type, problem description, parts, and labor. You can still change everything after it fills in.',
      },
      {
        heading: 'Pick or add the customer',
        body: 'Search for an existing customer or add a new one on the spot without leaving the screen.',
      },
      {
        heading: 'Describe the equipment and problem',
        body: 'Enter the equipment type, make, model, serial number, and what the customer says is wrong. The more you note now, the less you have to chase down later.',
      },
      {
        heading: 'Enter the off-site address',
        body: 'On an off-site job you must enter the address where the work happens. It can differ from the customer\'s own address. That address is what the Get Directions button on the job routes to, so it is worth getting right at intake.',
      },
      {
        heading: 'Set pickup and delivery fees',
        body: 'If you are picking up or returning equipment, choose the pickup type (None, In-town, or Out-of-town). The matching fees fill in from your Default Rates and stay editable on the job.',
      },
      {
        heading: 'Label the unit (optional)',
        body: 'If you printed a label for a new unit, you can print it right from the intake screen so the label matches the ticket number.',
      },
      {
        heading: 'Save the ticket',
        body: 'Save to create the job. It starts in the Intake status and appears at the top of the Job Board, ready to diagnose.',
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
        body: 'The board opens showing Intake jobs, so new work is right in front of you. Tap the status button to switch to any other status or All, and each status shows how many jobs are in it.',
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
        body: 'The "My Assignments" button lists jobs assigned to you. Tap "Assigned to me" to hide everyone else\'s work and focus on your own list.',
      },
      {
        heading: 'Today\'s schedule',
        body: 'Reminders and appointments due today show on the board under "Today\'s Schedule", so you can see the day at a glance.',
      },
      {
        heading: 'QR code',
        body: 'The QR button lets you scan a unit label to jump straight to its job, or print a label for a new unit.',
      },
      {
        heading: 'Quick actions on a card',
        body: 'Each job card shows the customer, equipment, status, and visit count. Tap the card to open the job, or use the phone and text shortcuts on the card to reach the customer without opening it.',
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
        heading: 'What each one means',
        body: 'Intake is new work just in. Diagnosed is after you have looked it over. Estimate Sent is waiting on the customer. Approved means they said go. In Progress is active work. Waiting on Parts is blocked on a delivery. Ready for Pickup is finished and waiting for them. Closed is done and billed.',
      },
      {
        heading: 'Change the status',
        body: 'Open the job and use the status control to set where it is now, or change it right from the job card on the board. The board, counts, and badge grid update to match.',
      },
      {
        heading: 'Closed jobs',
        body: 'A Closed job is locked from further edits unless you are an admin, so finished work stays intact. Reopen it by setting the status back only if you truly need to.',
      },
    ],
  },
  {
    id: 'job-costs',
    topic: 'jobs',
    title: 'Add parts, labor, and expenses to a job',
    summary: 'Build up what a job costs so the estimate and invoice are correct.',
    steps: [
      {
        heading: 'Parts',
        body: 'On the job page, add each part you used with its description, part number, quantity, and price. Parts feed the job total and, if the part came from inventory, tie back to your stock.',
      },
      {
        heading: 'Labor',
        body: 'Add labor lines with a description, the hours, and the hourly rate. The rate starts from your default rate and stays editable per line.',
      },
      {
        heading: 'Expenses',
        body: 'Use expenses for money you spent directly on a job — a sublet, a trip, a bought-in part. Mark whether it is billable to the customer and whether it has been reimbursed to the person who paid.',
      },
      {
        heading: 'Discounts',
        body: 'Apply a parts discount and a labor discount on the job, each as a fixed amount or a percentage. A loyalty discount, when applied, comes off the whole ticket subtotal.',
      },
      {
        heading: 'See the totals',
        body: 'The job page totals everything — parts, labor, expenses, fees, discounts, and tax — so you always know the running figure before you bill.',
      },
      {
        heading: 'Profit (admins only)',
        body: 'Administrators also see a profit figure that compares what the job earns against the pay cost of the labor on it. Technicians do not see this.',
      },
    ],
  },
  {
    id: 'directions',
    topic: 'jobs',
    title: 'Get directions to an off-site job',
    summary: 'Open your phone\'s maps with the job address already set.',
    steps: [
      {
        heading: 'Where it is',
        body: 'Open an off-site job and look for the address card. The address you entered at intake shows there, with a "Get Directions" button.',
      },
      {
        heading: 'Tap it',
        body: 'Tapping "Get Directions" opens your phone\'s map app with that address already set as the destination, so routing starts without retyping anything.',
      },
      {
        heading: 'If no address is set',
        body: 'When a job has no separate off-site address, the customer\'s own address is used instead. Add or correct the address on the job to change where it routes.',
      },
      {
        heading: 'Before you leave',
        body: 'The same card gives you tap-to-call and tap-to-text, so you can let the customer know you are on the way.',
      },
    ],
  },
  {
    id: 'job-timeline',
    topic: 'jobs',
    title: 'Keep a job timeline',
    summary: 'Record what happened on a job, with photos, as you go.',
    steps: [
      {
        heading: 'Add an entry',
        body: 'On the job page open the timeline and add a note about what you did or found. Entries are stamped with who wrote them and when.',
      },
      {
        heading: 'Attach photos',
        body: 'You can attach photos to a timeline entry — useful for documenting damage, a serial plate, or work completed before it leaves the shop.',
      },
      {
        heading: 'Why keep it',
        body: 'The timeline becomes the story of the job: what came in, what you tried, and what you did. It is handy when a customer asks questions later.',
      },
    ],
  },
  {
    id: 'assign-job',
    topic: 'jobs',
    adminOnly: true,
    title: 'Assign a job to a technician',
    summary: 'Put a name on a ticket so everyone knows who has it.',
    steps: [
      {
        heading: 'Assign from the job',
        body: 'Open the job and tap Assign, then choose the staff member. You can assign more than one person if a job is shared.',
      },
      {
        heading: 'What they see',
        body: 'The assigned person sees the job under "My Assignments" and can filter the board with "Assigned to me".',
      },
      {
        heading: 'Change or remove',
        body: 'Open the assignments list on the job to add another person or remove someone when the work moves on.',
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
        body: 'On the job page tap Estimate. It opens with the job, customer, and equipment details already filled in.',
      },
      {
        heading: 'Add parts and labor',
        body: 'List the parts and labor lines for the job. Add discounts or adjust tax if the customer gets a break.',
      },
      {
        heading: 'Check the total',
        body: 'The estimate shows each line, any discounts, tax, and the final total the customer will see. Review it before sending.',
      },
      {
        heading: 'Print or share it',
        body: 'Use the print control to produce a clean, branded estimate you can print or save and send, or use the text button to send a summary to the customer\'s phone.',
      },
      {
        heading: 'Record their answer',
        body: 'Once the customer approves, set the job status to Approved so it is clear the work can go ahead. If they decline, note it and close or hold the job.',
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
        body: 'On the job page tap Invoice. It carries over the job, customer, equipment, parts, labor, and expenses.',
      },
      {
        heading: 'Review the charges',
        body: 'Check the lines, tax, fees, and any discounts. Adjust anything that changed during the job before you hand it over.',
      },
      {
        heading: 'Record payments',
        body: 'As the customer pays, record the payment against the job. Partial payments are fine — the balance updates each time and the job shows as paid once the balance reaches zero.',
      },
      {
        heading: 'Print it',
        body: 'Use the print control for a branded invoice to hand over, or use the text button to send the customer a summary with the amount due.',
      },
      {
        heading: 'Close it out',
        body: 'When the work is done and the balance is settled, set the job to Closed so it is locked and out of the active list.',
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
        heading: 'Restock',
        body: 'Use Restock to add stock when a shipment arrives, so the quantity on hand stays accurate.',
      },
      {
        heading: 'Know what to reorder',
        body: 'Parts at or below their reorder threshold stand out, so you can see at a glance what needs ordering before you run out mid-job.',
      },
      {
        heading: 'Supplier orders',
        body: 'From a part you can put together a supplier order for what you need, then restock when it arrives.',
      },
      {
        heading: 'Organize categories',
        body: 'Use the "Add Category" button to create and manage the categories your parts are grouped under, so a busy shelf stays easy to search.',
      },
      {
        heading: 'Purchase history',
        body: 'A part keeps a record of what you bought and what you paid, so you can see how its cost has moved over time.',
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
        body: 'Open Inventory and use the Units for Sale tab. Add a unit with its name, make, model, condition, cost, and price.',
      },
      {
        heading: 'Mark it sold',
        body: 'When a unit sells, mark it sold so it drops off the for-sale list and the sale is recorded against it.',
      },
      {
        heading: 'Customer units',
        body: 'Equipment customers bring in lives under Units, tied to the customer. Each unit gets a label number so you can scan it back to its job.',
      },
      {
        heading: 'Labels and QR codes',
        body: 'Print a unit label with its number and QR code, then scan that code anywhere in the app to open the unit or its open job.',
      },
      {
        heading: 'Label sheets',
        body: 'You can print a whole sheet of labels at once for a batch of new units, rather than one at a time.',
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
        body: 'Tap "Clock" in the top bar to open the clock portal, then enter your employee ID to clock in or out for your shift.',
      },
      {
        heading: 'Job timers',
        body: 'On a job you can clock in and out of that specific job to measure time spent on it. These job timers are separate from your shift clock and are an admin tool for seeing where time goes.',
      },
      {
        heading: 'Overlapping timers',
        body: 'Admins can turn on overlapping timers in settings if you need to run more than one job timer at a time. Otherwise only one runs at once.',
      },
      {
        heading: 'Clock out from anywhere',
        body: 'If you are clocked into a job, the active timer shows on the Job Board with a direct way to clock out, so you are never stuck without a way to stop it.',
      },
      {
        heading: 'Who sees what',
        body: 'You can always see and manage your own clock. The detailed clock-in and clock-out times for everyone are visible to administrators only.',
      },
    ],
  },
  {
    id: 'timecards',
    topic: 'staff',
    adminOnly: true,
    title: 'Review staff timecards',
    summary: 'Check hours worked, week by week (admins).',
    steps: [
      {
        heading: 'Open timecards',
        body: 'Admin → Staff Directory, then open a staff member and look at their timecard, or open the time clock area to see everyone.',
      },
      {
        heading: 'Read the weeks',
        body: 'Time is grouped by week, with each day\'s hours shown. Open a week to see the individual clock-in and clock-out entries behind the totals.',
      },
      {
        heading: 'Correct an entry',
        body: 'If an entry is wrong, edit it and add a short correction note so there is a record of why it changed.',
      },
      {
        heading: 'Overtime',
        body: 'Overtime is worked out using the rule you set in Default Rates, so the figures here match how you pay.',
      },
    ],
  },
  {
    id: 'staff-tasks',
    topic: 'staff',
    adminOnly: true,
    title: 'Give staff tasks',
    summary: 'Hand out day-to-day work that is not a repair job (admins).',
    steps: [
      {
        heading: 'Admins only',
        body: 'Handing out tasks is an administrator tool. Technicians do not assign tasks — they work the ones they are given.',
      },
      {
        heading: 'Open tasks',
        body: 'Open the More menu in the bottom bar and tap Tasks.',
      },
      {
        heading: 'Create a task',
        body: 'Add a task with a title and who it is for. Tasks are separate from repair jobs and are for chores like ordering, cleaning, or callbacks.',
      },
      {
        heading: 'Track progress',
        body: 'Tasks can be marked done as they are finished, so you can see what is still outstanding without asking.',
      },
    ],
  },
  {
    id: 'reminders',
    topic: 'tools',
    title: 'Keep your own reminders',
    summary: 'Track callbacks and follow-ups, and turn appointments into reminders.',
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
        body: 'Attach a customer so their address and contact come along, which is handy for on-site visits — you can tap to call or text right from the reminder.',
      },
      {
        heading: 'Today\'s schedule',
        body: 'Anything due today shows on the Job Board under "Today\'s Schedule", and the Reminders button shows a count of what is due.',
      },
      {
        heading: 'Reminders from appointments',
        body: 'Appointments have their own page, and you can turn any of them into a reminder. When you schedule or edit an appointment, tick "Remind me" and choose the day you want reminding — the appointment arrives in your list here with its time, customer, and address already filled in. On the Appointments page that booking then shows a "Reminder set" tag, so you can tell at a glance which ones will remind you. Untick the box when editing the appointment to take the reminder away again.',
      },
      {
        heading: 'Yours alone',
        body: 'Reminders you create are personal to you — other staff do not see your reminder list.',
      },
      {
        heading: 'Finish one',
        body: 'Mark a reminder complete when it is handled, and it drops off your active list.',
      },
    ],
  },
  {
    id: 'appointments',
    topic: 'tools',
    title: 'Schedule an appointment',
    summary: 'Book on-site visits, off-site drop-offs, and general shop appointments.',
    steps: [
      {
        heading: 'Open appointments',
        body: 'Open the More menu in the bottom bar and tap Appointments. Every booking for the shop lives here, in one list that the whole shop shares — separate from your own reminder list.',
      },
      {
        heading: 'Create one',
        body: 'Tap Add. Give the appointment a title and a date, which are the only required fields, then choose the type: General for shop business, On-site when you are going to the customer, or Off-site when they are coming to you.',
      },
      {
        heading: 'Add a time',
        body: 'Set a start time, and an end time if you want the whole block on the card. Appointments with a time sort ahead of the rest on the same day, so the day reads in order.',
      },
      {
        heading: 'Link a customer',
        body: 'Pick a customer to carry their name, phone number, and address onto the appointment. For an off-site visit the address sits right on the card, and the card gives you tap-to-call and tap-to-text buttons so you can reach them from the shop or the road.',
      },
      {
        heading: 'Add notes',
        body: 'Use notes for whatever the visit needs — a gate code, the unit to look at, or who to ask for when you arrive.',
      },
      {
        heading: 'Remind yourself',
        body: 'Tick "Remind me" and choose the day to be reminded on. That puts the appointment into your own Reminders list, with the time, customer, and address already filled in, and the appointment card then shows a "Reminder set" tag.',
      },
      {
        heading: 'Work the list',
        body: 'The Upcoming tab shows what is still ahead and the Past tab shows what is finished. On any card, tap the circle to mark the appointment complete, the pencil to change it, or the bin to delete it.',
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
        body: 'Give it a name and set the equipment type, the usual problem description, the parts, and the labor. You can also set a flat rate for the job.',
      },
      {
        heading: 'Set template rates',
        body: 'You can give a template its own default rates, so a recurring job type always starts from the right price. The rates stay editable when the template is used.',
      },
      {
        heading: 'Use it at intake',
        body: 'When you start a new job, pick the template and its parts and labor fill in automatically. Everything stays editable, so a one-off change does not affect the template.',
      },
      {
        heading: 'Keep them current',
        body: 'Update a template when your prices or usual parts change, so new jobs keep starting from accurate numbers.',
      },
    ],
  },
  {
    id: 'quick-actions',
    topic: 'tools',
    title: 'Reach customers and use quick actions',
    summary: 'Call, text, and add jobs without retyping anything.',
    steps: [
      {
        heading: 'Tap to call or text',
        body: 'Wherever a customer\'s phone number appears — on their profile, a job card, or a job page — tapping it starts a call or a text on your phone.',
      },
      {
        heading: 'Send an estimate or invoice by text',
        body: 'From an estimate or invoice, use the text button to send the customer a summary with the total or amount due.',
      },
      {
        heading: 'Pickup and delivery messages',
        body: 'When you need to arrange a pickup or drop-off, the job has a ready-made message you can send with the details filled in.',
      },
      {
        heading: 'Directions to an off-site job',
        body: 'On an off-site job, the address you saved at intake shows on the job page with a "Get Directions" button. Tapping it opens your phone\'s map app with the address already set as the destination, so routing starts without retyping anything. If you did not enter a separate off-site address on the job, the customer\'s own address is used instead.',
      },
      {
        heading: 'Voice intake',
        body: 'You can start a new job by describing it out loud instead of typing, which is handy when your hands are busy in the shop. Each recording is sent off to be transcribed and read, so there is a limit of 30 recordings an hour per person. If you reach it, wait a little while and try again.',
      },
      {
        heading: 'Scan a label',
        body: 'Use the QR button to scan a unit label and jump straight to that unit or its open job.',
      },
    ],
  },
  {
    id: 'reimbursements',
    topic: 'tools',
    adminOnly: true,
    title: 'Track reimbursements',
    summary: 'Keep track of money staff spent on jobs that is owed back (admins).',
    steps: [
      {
        heading: 'Open reimbursements',
        body: 'Admin → Reimbursements. This gathers the expenses staff marked as paid out of pocket.',
      },
      {
        heading: 'See what is owed',
        body: 'Each entry shows the job, who paid, and the amount, so you can see what is still outstanding.',
      },
      {
        heading: 'Mark it paid',
        body: 'Once you have paid someone back, mark the expense as reimbursed so it clears off the list.',
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
        heading: 'Add lines',
        body: 'Add each item on its own line with its quantity and price, so the receipt and your reports are accurate.',
      },
      {
        heading: 'Track payment',
        body: 'The sales list shows what is paid and what is still outstanding, so you can follow up on balances.',
      },
      {
        heading: 'Open a sale',
        body: 'Tap any sale to open its full detail, including the lines, total, and what has been paid.',
      },
    ],
  },
  {
    id: 'reports',
    topic: 'reports',
    adminOnly: true,
    title: 'Read your reports',
    summary: 'See how the shop is doing (admins).',
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
        heading: 'Profit & Loss',
        body: 'Shows what came in against what went out over the period, so you can see whether the shop is ahead.',
      },
      {
        heading: 'Employee earnings',
        body: 'Shows hours and pay by staff member. This is payroll-sensitive, so it is admin-only.',
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
    adminOnly: true,
    title: 'Set up loyalty discounts',
    summary: 'Reward repeat customers automatically.',
    steps: [
      {
        heading: 'Which plans include it',
        body: 'Loyalty discounts are part of Team and up. On Solo and Pro, Loyalty Discounts shows a lock in the Admin menu, and tapping it takes you to Plan & Billing to compare.',
      },
      {
        heading: 'Open loyalty',
        body: 'Admin → Loyalty Discounts.',
      },
      {
        heading: 'Create a milestone',
        body: 'Set a visit count and a discount, either a percentage or a fixed amount. The discount applies to the whole ticket subtotal.',
      },
      {
        heading: 'How visits count',
        body: 'A customer\'s visit count is based on their job tickets, which you can see on their profile and on each job card.',
      },
      {
        heading: 'Apply it',
        body: 'When a customer reaches a milestone, a reminder appears for admins. Open their latest job to apply the discount, or dismiss it if it does not apply this time.',
      },
      {
        heading: 'Only admins see it',
        body: 'Loyalty reminders and the discount details are visible to administrators only, so technicians are not distracted by them.',
      },
    ],
  },
  {
    id: 'change-history',
    topic: 'reports',
    adminOnly: true,
    title: 'Review change history',
    summary: 'See a record of important changes made in the shop (admins).',
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
  {
    id: 'billing',
    topic: 'reports',
    adminOnly: true,
    title: 'Manage your plan and billing',
    summary: 'Change your plan or review your subscription.',
    steps: [
      {
        heading: 'Open billing',
        body: 'Admin → Plan & Billing.',
      },
      {
        heading: 'Compare plans',
        body: 'The page shows your current plan and what each tier includes. Jobs, customers, estimates, invoices, reminders and reports are on every plan, including Solo. Tools like job templates, the time clock, loyalty discounts, late pickup fees and importing your records are unlocked by plan. Multi-Location is coming soon and cannot be bought yet, so its card shows Coming soon instead of a button.',
      },
      {
        heading: 'Change plan',
        body: 'Tap "Change plan" and follow the checkout to move up or down. Your data stays with the shop.',
      },
      {
        heading: 'Locked features',
        body: 'If a feature shows a lock, it is not part of your current plan. Tapping it takes you here so you can compare and upgrade.',
      },
    ],
  },
  {
    id: 'roadmap',
    topic: 'reports',
    adminOnly: true,
    title: 'Keep a shop roadmap',
    summary: 'Note ideas and improvements for the shop (admins).',
    steps: [
      {
        heading: 'Open the roadmap',
        body: 'Admin → Roadmap.',
      },
      {
        heading: 'Add a note',
        body: 'Add an idea or a task under a topic, with any details you want to remember. Group things by topic so related ideas stay together.',
      },
      {
        heading: 'Mark it done',
        body: 'Tick off notes as you get to them, so the list stays a picture of what is still ahead.',
      },
    ],
  },
  {
    id: 'late-pickup-fees',
    topic: 'money',
    adminOnly: true,
    title: 'Charge for late unit pickups',
    summary: 'Set a fee for units left past the pickup window (admins).',
    steps: [
      {
        heading: 'Which plans include it',
        body: 'Late pickup fees are part of Team and up. On Solo and Pro, Late Pickup Fees shows a lock in the Admin menu, and tapping it takes you to Plan & Billing to compare.',
      },
      {
        heading: 'Turn it on',
        body: 'Admin → Late Pickup Fees → Settings. Switch on Charge for late pickups and set how many days a unit can sit ready before the fee applies — 30 by default.',
      },
      {
        heading: 'Choose the one-time fee',
        body: 'Enter the fee as a flat dollar amount or as a percentage of the pre-tax job total. The percentage is worked out from the parts, labor, fees and expenses on that job, before tax.',
      },
      {
        heading: 'Add a daily fee',
        body: 'Switch on Charge every day after to keep charging for each day past the day limit. The one-time fee still applies on its own when the daily fee is off.',
      },
      {
        heading: 'Review the overdue units',
        body: 'The Late pickup fees card at the top of the job board shows how many units are past the window. Open it to see each customer, how long the unit has been ready, and the fee it has earned so far.',
      },
      {
        heading: 'Record the fee on the job',
        body: 'Tap Record on job to put the fee on that job as a billable charge, so it shows on the invoice and in your totals. Nothing is charged automatically, and amounts are worked out fresh from the day the unit was marked ready, so a fee is never added twice.',
      },
    ],
  },
];

// Split an article into searchable text.
const articleText = (a) =>
  [a.title, a.summary, ...a.steps.map((s) => `${s.heading} ${s.body}`)]
    .join(' ')
    .toLowerCase();

// Guides that describe administrator-only tools are hidden from regular users
// and technicians, in the topic list and in search results alike.
export const filterArticles = (query, isAdmin = false) => {
  const pool = isAdmin
    ? HELP_ARTICLES
    : HELP_ARTICLES.filter((a) => !a.adminOnly);
  const q = (query || '').trim().toLowerCase();
  if (!q) return pool;
  const words = q.split(/\s+/);
  return pool.filter((a) => {
    const text = articleText(a);
    return words.every((w) => text.includes(w));
  });
};

export const topicLabel = (key) =>
  HELP_TOPICS.find((t) => t.key === key)?.label || 'Help';