import type { Metadata } from 'next';
import { LegalPage, SalesEmail } from '@/components/LegalPage';

export const metadata: Metadata = {
    title: 'Privacy Policy | StepVision Hotel Supplies',
};

export default function PrivacyPolicyPage() {
    return (
        <LegalPage
            title="Privacy Policy"
            lastUpdated="21 October 2026"
            intro={
                <>
                    StepVision Hotel Supplies LLC (&quot;StepVision&quot;, &quot;we&quot;, &quot;us&quot;) respects your privacy.
                    This policy explains what information we collect through this website, how we use it, and the choices
                    you have.
                </>
            }
            sections={[
                {
                    title: 'Information we collect',
                    paragraphs: [
                        'When you contact us or request a quote, we collect the details you give us, such as your name, email address, phone number, company and the products you are interested in.',
                        'Products you add to your quote cart are stored only in your own browser, so the cart is still there when you come back. They are not sent to us until you send your quote request.',
                        'Like most websites, our hosting provider automatically records basic technical information, such as your IP address, browser type and the pages you visit, to keep the site secure and working.',
                    ],
                },
                {
                    title: 'How we use your information',
                    paragraphs: [
                        'We use your information to answer your enquiries, prepare quotations, supply products and keep in touch with you about your orders.',
                        'We do not sell or rent your personal information to anyone.',
                    ],
                },
                {
                    title: 'Sharing your information',
                    paragraphs: [
                        'We share information only with service providers that help us run this website and our business (for example hosting, email and messaging services such as WhatsApp), and only as far as they need it to provide their service. We may also disclose information when the law requires it.',
                    ],
                },
                {
                    title: 'How long we keep it',
                    paragraphs: [
                        'We keep your information for as long as we need it to deal with your enquiry or order and to meet our legal and accounting obligations.',
                    ],
                },
                {
                    title: 'Your choices',
                    paragraphs: [
                        <>
                            You can ask us to show, correct or delete the personal information we hold about you by emailing{' '}
                            <SalesEmail />. You can remove items from your quote cart at any time on the quote cart page, or
                            empty it by clearing your browser&apos;s site data.
                        </>,
                    ],
                },
                {
                    title: 'Changes to this policy',
                    paragraphs: [
                        'We may update this policy from time to time. The date at the top of this page shows when it was last changed.',
                    ],
                },
                {
                    title: 'Contact us',
                    paragraphs: [
                        <>
                            Questions about this policy can be sent to <SalesEmail /> or by phone on{' '}
                            <a href="tel:0568978100" className="text-primary-600 hover:underline">056 897 8100</a>.
                        </>,
                    ],
                },
            ]}
        />
    );
}
