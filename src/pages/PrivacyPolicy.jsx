import React from 'react';
import useBrand from '@/hooks/useBrand';
import LegalPageLayout from '@/components/LegalPageLayout';

const LAST_UPDATED = 'September 25, 2026';

export default function PrivacyPolicy() {
  const brand = useBrand();

  const contactLines = [
    brand.address,
    brand.phone ? `Phone: ${brand.phone}` : '',
    brand.email ? `Email: ${brand.email}` : '',
  ].filter(Boolean);

  const sections = [
    {
      heading: 'Information we collect',
      body: [
        'Account information: when a staff member signs in with an email and password or a Google account, we store their name, email address and access level.',
        'Shop records entered by staff: customer names, phone numbers, email addresses and service addresses; equipment details such as make, model and serial number; job notes and photos; estimates and invoices; parts, labor hours, payments, expenses and other financial records.',
      ],
    },
    {
      heading: 'How we use it',
      body: [
        'Only to run the shop: opening and tracking jobs, producing estimates and invoices, scheduling, managing inventory and reporting on the business. We do not use your information for advertising and we do not run marketing campaigns against it.',
      ],
    },
    {
      heading: 'We never sell your data',
      body: [
        'We do not sell, rent or trade customer or shop data. We do not share it with third parties for their own marketing, and we do not sell it to data brokers.',
      ],
    },
    {
      heading: 'Who can see it',
      body: [
        'Access is limited to the staff accounts your business creates. An administrator controls who is added and what level of access they have. The hosting and infrastructure providers that keep the service running process data on our behalf and only for that purpose.',
      ],
    },
    {
      heading: 'How long we keep it',
      body: [
        'Records stay while your shop uses the app. You can ask us to delete a customer, a job or your whole account, and we will remove the data unless we are required by law to keep it — for example, tax and accounting records.',
      ],
    },
    {
      heading: 'Security',
      body: [
        'Data is transmitted over an encrypted connection and stored on access-controlled servers. No system is perfect, so we also rely on good habits: a strong password and a separate account for every staff member.',
      ],
    },
    {
      heading: 'Your choices',
      body: [
        'You can ask to see, correct or delete the information we hold, and ask any question about how it is handled, using the contact details below.',
      ],
    },
    {
      heading: 'Children',
      body: ['This app is a business tool and is not intended for children under 13.'],
    },
    {
      heading: 'Changes to this policy',
      body: [
        'If this policy changes we will update the date at the top of the page. Continuing to use the app after a change means you accept the updated policy.',
      ],
    },
    {
      heading: 'Contact us',
      body: [
        `Questions about this policy can be sent to ${brand.name}.`,
        ...(contactLines.length
          ? contactLines
          : ['Contact details are published by the shop and available on request.']),
      ],
    },
  ];

  return (
    <LegalPageLayout
      title="Privacy Policy"
      updated={LAST_UPDATED}
      intro={`${brand.name} ("we", "us") provides this shop management app. This policy explains what information the app stores, how it is used and the choices you have.`}
      sections={sections}
    />
  );
}