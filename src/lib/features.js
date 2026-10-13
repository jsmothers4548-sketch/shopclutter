// The public feature catalog. Drives the features index, each detail page,
// and the showcase sections on the homepage.
import {
  ClipboardList,
  Receipt,
  Package,
  Users,
  CalendarClock,
  Clock,
  BarChart3,
  MapPin,
  Mic,
  Upload,
} from 'lucide-react';
import { MARKETING_IMAGES as IMG } from '@/lib/marketingImages';

export const FEATURES = [
  {
    slug: 'job-tracking',
    icon: ClipboardList,
    title: 'Job tracking, intake to closed',
    tagline: 'One board for every unit in the shop.',
    image: IMG.bench,
    imageAlt: 'A mechanic repairing a riding mower engine on a workbench in a small engine shop',
    intro:
      'A unit comes through the door and gets a ticket. From that moment you can see exactly where it stands, and so can anyone else holding a wrench.',
    sections: [
      {
        heading: 'A board that matches your bench',
        body: 'Every open job sits on one board, grouped by where it actually is: Intake, Diagnosed, Estimate Sent, Approved, In Progress, Waiting on Parts, Ready for Pickup, Closed. Color-coded counts tell you at a glance how much work is sitting in each stage.',
      },
      {
        heading: 'Move a job with one tap',
        body: 'Change the status from the job card or the job page and the board, the counts and the timeline all follow. Closed jobs lock from further edits unless an admin reopens them, so finished work stays intact.',
      },
      {
        heading: 'Know who has it',
        body: 'Assign a job to one tech or several, and each person can filter the board down to just their own list. Nobody has to ask who is on the mower.',
      },
      {
        heading: 'Search that actually finds it',
        body: 'Search by ticket number, customer or unit, or scan the QR label on the machine and land straight on its ticket.',
      },
    ],
    bullets: [
      'Eight shop-floor statuses',
      'Assignments and a "my jobs" filter',
      'Ticket search and QR scan',
      'Timeline of what happened, with photos',
    ],
  },
  {
    slug: 'estimates-invoices',
    icon: Receipt,
    title: 'Estimates, invoices & payments',
    tagline: 'Quote it, bill it, get paid — without the Sunday night pile.',
    image: IMG.paperwork,
    imageAlt: 'A printed repair estimate on a workbench beside a wrench and a spark plug',
    intro:
      'Build the estimate while the unit is still on the bench, send it to the customer, and turn the same job into an invoice when the work is done.',
    sections: [
      {
        heading: 'Estimates the customer can approve',
        body: 'Itemize parts, labor, pickup and delivery fees, discounts and tax. Print or save a clean, branded estimate, or text a summary with the total straight to the customer.',
      },
      {
        heading: 'Invoices that carry the whole job',
        body: 'The invoice pulls in the job, customer, equipment, parts, labor and expenses you already entered, so you are not retyping anything.',
      },
      {
        heading: 'Payments and running balances',
        body: 'Record deposits and partial payments as they come in. The balance updates each time, and the job shows as settled once it reaches zero.',
      },
      {
        heading: 'Profit on every ticket',
        body: 'Admins see what a job earned against the pay cost of the labor on it, so you learn which work is actually worth taking.',
      },
    ],
    bullets: [
      'Branded estimates and invoices',
      'Text or print in a tap',
      'Deposits and partial payments',
      'Per-job profit for admins',
    ],
  },
  {
    slug: 'parts-inventory',
    icon: Package,
    title: 'Parts, labor & inventory',
    tagline: 'Every part and every hour, on the right ticket.',
    image: IMG.shelves,
    imageAlt: 'Shelves of small engine parts and oil organized in a repair shop aisle',
    intro:
      'Log what you used and what you spent, and keep the shelf count honest at the same time.',
    sections: [
      {
        heading: 'Parts and labor on the job',
        body: 'Add each part with its number and price, and each labor line with its hours and rate. The rate starts from your shop default and stays editable per line.',
      },
      {
        heading: 'Inventory that stays current',
        body: 'Parts at or below their reorder point stand out so you order before you run out mid-job. Restock in a tap when the shipment lands.',
      },
      {
        heading: 'Supplier orders',
        body: 'Build a supplier order from the parts you need, text or email it, then restock when it arrives.',
      },
      {
        heading: 'Cost history',
        body: 'A part keeps a record of what you bought and what you paid, so you can see how its cost has moved over time.',
      },
    ],
    bullets: [
      'Parts, labor and expenses per job',
      'Reorder points and restocking',
      'Supplier orders',
      'Part purchase history',
    ],
  },
  {
    slug: 'customers',
    icon: Users,
    title: 'Customers & equipment history',
    tagline: 'The whole history, attached to the person who owns it.',
    image: IMG.storefront,
    imageAlt: 'A small engine repair shop storefront lit up at dusk with mowers by the door',
    intro:
      'Every customer keeps their contact details, their units and every repair you have done for them.',
    sections: [
      {
        heading: 'Tap to call or text',
        body: 'Wherever a phone number shows — a customer profile, a job card, a job page — tapping it starts the call or the text on your phone.',
      },
      {
        heading: 'Units and labels',
        body: 'Each unit a customer brings in gets its own record and label number, tied back to the job it came in on.',
      },
      {
        heading: 'Visit count and loyalty',
        body: 'A customer\u2019s visit count comes from their tickets, and it feeds the loyalty milestones you set up for the shop.',
      },
      {
        heading: 'Notes worth keeping',
        body: 'Gate codes, preferred contact times, how they like to be reached — keep it on the profile so the next person does not have to ask.',
      },
    ],
    bullets: [
      'Full job and unit history',
      'Tap-to-call and tap-to-text',
      'Unit labels and QR codes',
      'Notes and loyalty visits',
    ],
  },
  {
    slug: 'scheduling',
    icon: CalendarClock,
    title: 'Appointments, reminders & scheduling',
    tagline: 'The day, in one list.',
    image: IMG.phone,
    imageAlt: 'A mechanic holding a phone showing a repair job ticket in a shop',
    intro:
      'On-site visits, drop-offs, callbacks and follow-ups live in one place, so nothing slips while you are under a hood.',
    sections: [
      {
        heading: 'Appointments for the shop',
        body: 'Book general, on-site and off-site appointments with a date, a time window, the customer and notes. Upcoming and past tabs keep the list readable.',
      },
      {
        heading: 'Turn one into a reminder',
        body: 'Tick "Remind me" on an appointment and it lands in your own reminder list with the time, customer and address already filled in.',
      },
      {
        heading: 'Today, on the board',
        body: 'Anything due today shows on the job board under Today\u2019s Schedule, and the Reminders button carries a count of what is waiting.',
      },
      {
        heading: 'Personal reminders',
        body: 'Your reminder list is yours. Other staff do not see it.',
      },
    ],
    bullets: [
      'On-site, off-site and general bookings',
      'Appointments become reminders',
      'Today\u2019s schedule on the board',
      'A private reminder list per user',
    ],
  },
  {
    slug: 'crew-time',
    icon: Clock,
    title: 'Time clock, timecards & crew pay',
    tagline: 'Hours that turn into timecards by themselves.',
    image: IMG.crew,
    imageAlt: 'Two mechanics reviewing work together at a bench in a small engine shop',
    intro:
      'The crew clocks in and out from their phone, and the hours land in weekly timecards with overtime already worked out.',
    sections: [
      {
        heading: 'Clock in from anywhere',
        body: 'A simple clock portal takes an employee ID and records the shift. Job timers let a tech clock in and out of a specific job to measure where the time really goes.',
      },
      {
        heading: 'Weekly timecards',
        body: 'Time groups by week with each day\u2019s hours shown. Open a week to see the individual entries behind the total.',
      },
      {
        heading: 'Overtime your way',
        body: 'Choose the federal weekly rule or a daily rule in your shop settings, so the figures match how you actually pay.',
      },
      {
        heading: 'Correct and record',
        body: 'Fix a wrong entry and add a short correction note, so there is always a record of why it changed.',
      },
    ],
    bullets: [
      'Shift clock and per-job timers',
      'Weekly timecards',
      'Federal or daily overtime',
      'Corrections with notes',
    ],
  },
  {
    slug: 'reports',
    icon: BarChart3,
    title: 'Profit reports & tax',
    tagline: 'Know what actually pays.',
    image: IMG.hands,
    imageAlt: 'Close-up of a mechanic\u2019s hands with a wrench on a small engine',
    intro:
      'Revenue, costs, profit and tax collected across any period — by job, by person, by part.',
    sections: [
      {
        heading: 'Profit & loss',
        body: 'See what came in against what went out over a month, a year, or a range you pick.',
      },
      {
        heading: 'Employee earnings',
        body: 'Hours worked, pay earned and what each person brought in. Payroll-sensitive, so it stays admin-only.',
      },
      {
        heading: 'Parts and expenditures',
        body: 'Parts spending, part history and out-of-pocket expenditures, so you can see where the money is going.',
      },
      {
        heading: 'Time on jobs',
        body: 'A report on where the crew\u2019s hours actually land, job by job.',
      },
      {
        heading: 'Drill in and print',
        body: 'Tap any staff member, job or sale to open its full detail, and print any report to save or share.',
      },
    ],
    bullets: [
      'Profit & loss by period',
      'Employee earnings',
      'Parts, expenditures and time on jobs',
      'Drill-down detail and printing',
    ],
  },
  {
    slug: 'directions',
    icon: MapPin,
    title: 'Job directions & on-site routing',
    tagline: 'Save the address once, route to it from the job.',
    image: IMG.serviceCall,
    imageAlt: 'A service van parked at a rural home while a mechanic carries a toolbox to the door',
    intro:
      'Off-site work needs an address, and a way to get there without retyping it into your phone at the curb.',
    sections: [
      {
        heading: 'The address lives on the job',
        body: 'Enter the off-site address at intake — it can be different from the customer\u2019s own address. It shows on the job page alongside the customer details.',
      },
      {
        heading: 'One tap to route',
        body: 'Tap Get Directions on the job and your phone\u2019s map app opens with the address already set as the destination.',
      },
      {
        heading: 'Falls back to the customer',
        body: 'If you did not enter a separate off-site address, the customer\u2019s own address is used instead.',
      },
    ],
    bullets: [
      'Off-site address kept on the ticket',
      'One-tap directions from the job page',
      'Works with the map app on your phone',
    ],
  },
  {
    slug: 'voice-qr',
    icon: Mic,
    title: 'Voice intake & QR unit labels',
    tagline: 'Talk it in, scan it back.',
    image: IMG.voice,
    imageAlt: 'A mechanic speaking into a phone while resting a hand on a push mower',
    intro:
      'Start a job by describing it out loud, and put a scannable label on every unit that comes through the door.',
    sections: [
      {
        heading: 'Voice intake',
        body: 'Describe the job and the form fills itself in — handy when your hands are full of a carburetor.',
      },
      {
        heading: 'QR unit labels',
        body: 'Print a label with the unit number and a QR code, or print a whole sheet at once for a batch of new units.',
      },
      {
        heading: 'Scan to jump',
        body: 'Scan any label in the app and land straight on that unit or its open job.',
      },
    ],
    bullets: [
      'Describe a job out loud',
      'Print single labels or full sheets',
      'Scan to open a unit or ticket',
    ],
  },
  {
    slug: 'migration',
    icon: Upload,
    title: 'Bring your records over',
    tagline: 'Your spreadsheet, imported without the retyping.',
    image: IMG.migration,
    imageAlt: 'A laptop on a workbench beside a stack of old paper customer ledgers',
    intro:
      'Move customers, equipment, jobs, parts and sales over from the spreadsheet you already keep.',
    sections: [
      {
        heading: 'Start from a template or your own file',
        body: 'Download a template to see the exact columns, or just upload the CSV you already have. You do not have to reshape it first.',
      },
      {
        heading: 'Your file stays on your device',
        body: 'The file is read in the app on your own device and is never uploaded anywhere. Only the finished records are saved to your shop.',
      },
      {
        heading: 'Match your columns',
        body: 'Column names are matched automatically. Check the list, fix anything it got wrong, and choose which column feeds each field.',
      },
      {
        heading: 'Duplicates caught before they land',
        body: 'Rows that look like records you already have are shown for review — skip it, update the existing record, or add it as new. Nothing is written until you confirm.',
      },
    ],
    bullets: [
      'CSV and template import',
      'The file never leaves your device',
      'Column matching and row preview',
      'Duplicate review before writing',
    ],
  },
];

export function getFeature(slug) {
  return FEATURES.find((f) => f.slug === slug) || null;
}

// A few features worth surfacing on the homepage, in this order.
export const HOMEPAGE_FEATURE_SLUGS = [
  'job-tracking',
  'estimates-invoices',
  'directions',
];