import React from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';

export interface LegalSection {
    title: string;
    paragraphs: React.ReactNode[];
}

export interface LegalPageProps {
    title: string;
    lastUpdated: string;
    intro: React.ReactNode;
    sections: LegalSection[];
}

// Shared layout for the privacy policy and terms pages linked from the footer.
export const LegalPage: React.FC<LegalPageProps> = ({ title, lastUpdated, intro, sections }) => (
    <div className="min-h-screen bg-neutral-50">
        <div className="container py-8">
            <Breadcrumb items={[{ label: title }]} />

            <div className="bg-white rounded-xl shadow-md p-6 md:p-12 max-w-4xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">{title}</h1>
                <p className="text-sm text-neutral-500 mb-8">Last updated: {lastUpdated}</p>
                <p className="text-lg text-neutral-700 leading-relaxed mb-8">{intro}</p>

                <div className="space-y-8">
                    {sections.map((section, index) => (
                        <section key={section.title}>
                            <h2 className="text-xl md:text-2xl font-bold text-neutral-900 mb-3">
                                {index + 1}. {section.title}
                            </h2>
                            <div className="space-y-3">
                                {section.paragraphs.map((paragraph, i) => (
                                    <p key={i} className="text-neutral-700 leading-relaxed">
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

export const SalesEmail = () => (
    <a href="mailto:sales@stepvisionhotelsupplies.com" className="text-primary-600 hover:underline">
        sales@stepvisionhotelsupplies.com
    </a>
);
