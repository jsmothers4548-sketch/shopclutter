import React from 'react';
import useBrand from '@/hooks/useBrand';
import LegalPageLayout from '@/components/LegalPageLayout';

const LAST_UPDATED = 'September 25, 2026';

export default function Terms() {
  const brand = useBrand();

  const contactLines = [
    brand.address,
    brand.phone ? `Phone: ${brand.phone}` : '',
    brand.email ? `Email: ${brand.email}` : '',
  ].filter(Boolean);

  const sections = [
    {
      heading: 'Acceptance',
      body: [
        'By creating an account or using this app you agree to these terms. If you are using it for a business, you confirm that you are allowed to accept them on that business’s behalf.',
      ],
    },
    {
      heading: 'The service',
      body: [
        `${brand.name} is a management tool for repair shops: job tracking, customers and equipment, estimates and invoices, parts, labor, inventory, scheduling and reporting.`,
      ],
    },
    {
      heading: 'Your account',
      body: [
        'Keep your login details private and give each staff member their own account. You are responsible for what happens under the accounts your business creates.',
      ],
    },
    {
      heading: 'Your data',
      body: [
        'The records you enter belong to you. We store and process them only to provide the service, and we do not sell them or share them for marketing.',
      ],
    },
    {
      heading: 'Acceptable use',
      body: [
        'Use the app lawfully and only for your own business data. Do not attempt to reach another business’s records, disrupt the service, or use it to store unlawful content.',
      ],
    },
    {
      heading: 'Fees',
      body: [
        'The service is currently provided without charge. If that changes, we will give you notice before any charge applies.',
      ],
    },
    {
      heading: 'Availability',
      body: [
        'We work to keep the app available and your data safe, but it is provided “as is” without warranties and we cannot guarantee uninterrupted availability.',
      ],
    },
    {
      heading: 'Limitation of liability',
      body: [
        'To the extent allowed by law, we are not liable for indirect or consequential losses — including lost profits or lost data — arising from your use of the app.',
      ],
    },
    {
      heading: 'Ending your use',
      body: [
        'You can stop using the app at any time and ask for your data to be deleted. We may suspend access if these terms are broken.',
      ],
    },
    {
      heading: 'Changes to these terms',
      body: [
        'We may update these terms; the date at the top of the page shows the latest version. Continuing to use the app means you accept the update.',
      ],
    },
    {
      heading: 'Governing law',
      body: [
        'These terms are governed by the laws of the state in which the business is located.',
      ],
    },
    {
      heading: 'Contact us',
      body: [
        `Questions about these terms can be sent to ${brand.name}.`,
        ...(contactLines.length
          ? contactLines
          : ['Contact details are published by the shop and available on request.']),
      ],
    },
  ];

  return (
    <LegalPageLayout
      title="Terms of Service"
      updated={LAST_UPDATED}
      intro={`These terms cover your use of the ${brand.name} shop management app.`}
      sections={sections}
    />
  );
}