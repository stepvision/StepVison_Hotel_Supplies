import type { Metadata } from 'next';
import { LegalPage, SalesEmail } from '@/components/LegalPage';

export const metadata: Metadata = {
    title: 'Terms & Conditions | StepVision Hotel Supplies',
};

export default function TermsConditionsPage() {
    return (
        <LegalPage
            title="Terms & Conditions"
            lastUpdated="21 October 2026"
            intro={
                <>
                    These terms apply to your use of the StepVision Hotel Supplies LLC website. By using this website you
                    agree to them. If you do not agree, please do not use the website.
                </>
            }
            sections={[
                {
                    title: 'About this website',
                    paragraphs: [
                        'This website presents our range of hospitality supplies and engineering products for information. It is not an online shop: no sale is made through the website.',
                    ],
                },
                {
                    title: 'Quotes and orders',
                    paragraphs: [
                        'A quote request sent through this website is an enquiry, not an order. Prices, availability, delivery times and other terms are confirmed in the written quotation we send you.',
                        'An order is only accepted once we confirm it in writing. Each order is governed by the terms stated in its quotation or order confirmation.',
                    ],
                },
                {
                    title: 'Product information',
                    paragraphs: [
                        'We try to keep product descriptions and images accurate, but colours, finishes and specifications may differ slightly from what is shown, and products may change without notice. Please confirm any detail that matters to you before ordering.',
                    ],
                },
                {
                    title: 'Intellectual property',
                    paragraphs: [
                        'The content of this website, including text, images, logos and design, belongs to StepVision or its suppliers and may not be copied or used for commercial purposes without our written permission. Brand names of products shown belong to their respective owners.',
                    ],
                },
                {
                    title: 'Use of the website',
                    paragraphs: [
                        'You agree not to misuse the website, for example by trying to gain unauthorised access, disrupting its operation or sending false enquiries.',
                    ],
                },
                {
                    title: 'Limitation of liability',
                    paragraphs: [
                        'The website is provided "as is". To the extent permitted by law, we are not liable for any loss arising from the use of this website or from temporary unavailability of the website.',
                    ],
                },
                {
                    title: 'Governing law',
                    paragraphs: [
                        'These terms are governed by the laws of the United Arab Emirates.',
                    ],
                },
                {
                    title: 'Changes and contact',
                    paragraphs: [
                        <>
                            We may update these terms from time to time; the date at the top of this page shows when they were
                            last changed. Questions can be sent to <SalesEmail />.
                        </>,
                    ],
                },
            ]}
        />
    );
}
