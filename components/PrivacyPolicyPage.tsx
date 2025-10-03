import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
    return (
        <div className="w-full max-w-4xl mx-auto animate-fade-in-up text-light-text dark:text-cyber-text">
            <div className="text-center mb-12">
                <h2 className="text-4xl sm:text-5xl font-bold text-light-cyan dark:text-cyber-cyan">Privacy Policy</h2>
                <p className="mt-4 text-lg text-light-text-secondary dark:text-cyber-text-secondary">
                    Your privacy is critically important to us.
                </p>
                 <p className="mt-2 text-sm text-light-text-secondary dark:text-cyber-text-secondary/80">Last Updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="space-y-8 text-base leading-relaxed text-light-text-secondary dark:text-cyber-text-secondary policy-content">
                <section>
                    <h3 className="text-2xl font-bold text-light-text dark:text-cyber-text mb-3">1. Introduction</h3>
                    <p>
                        Welcome to Synthetica ("we", "us", "our"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains what information we collect, how we use it, and what rights you have in relation to it. This policy applies to all information collected through our website and services.
                    </p>
                </section>
                 <section>
                    <h3 className="text-2xl font-bold text-light-text dark:text-cyber-text mb-3">2. Information We Collect</h3>
                    <p>We collect personal information that you voluntarily provide to us when you register an account, express an interest in obtaining information about us or our products and services, or otherwise when you contact us.</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                        <li><strong>Account Information:</strong> When you create an account, we collect your name, email address, phone number (optional), and a hashed password.</li>
                        <li><strong>Analysis Content:</strong> We process the URLs, text, and images you submit for analysis. This data is sent to our AI service provider (Google Gemini) for processing but is not stored permanently on our servers in connection with your personal account after the analysis is complete. Your analysis history is stored locally in your browser and is tied to your account for access across devices.</li>
                        <li><strong>Subscription Information:</strong> If you subscribe to a paid plan, we collect payment information through our secure third-party payment processor. We do not store your full credit card details on our servers.</li>
                    </ul>
                </section>
                <section>
                    <h3 className="text-2xl font-bold text-light-text dark:text-cyber-text mb-3">3. How We Use Your Information</h3>
                    <p>We use the information we collect or receive:</p>
                     <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>To create and manage your account.</li>
                        <li>To provide and maintain our services, including processing your analysis requests.</li>
                        <li>To manage your subscriptions and payments.</li>
                        <li>To communicate with you, including responding to your inquiries and sending important service-related notices.</li>
                        <li>To improve our website and services. We may use anonymized and aggregated analysis data to understand trends and enhance our AI models.</li>
                    </ul>
                </section>
                <section>
                    <h3 className="text-2xl font-bold text-light-text dark:text-cyber-text mb-3">4. Data Storage and Security</h3>
                    <p>
                        We use industry-standard security measures to protect your information. Your account information is stored securely, and analysis history is managed within your user account scope. While we strive to protect your personal information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.
                    </p>
                </section>
                 <section>
                    <h3 className="text-2xl font-bold text-light-text dark:text-cyber-text mb-3">5. Your Rights</h3>
                    <p>You have the right to access, update, or delete your personal information at any time through your Profile page. You can also delete individual history items or clear your entire analysis history. If you wish to delete your account permanently, please contact us.</p>
                </section>
                 <section>
                    <h3 className="text-2xl font-bold text-light-text dark:text-cyber-text mb-3">6. Changes to This Policy</h3>
                    <p>We may update this Privacy Policy from time to time. The updated version will be indicated by a "Last Updated" date. We encourage you to review this policy frequently to be informed of how we are protecting your information.</p>
                </section>
                 <section>
                    <h3 className="text-2xl font-bold text-light-text dark:text-cyber-text mb-3">7. Contact Us</h3>
                    <p>If you have questions or comments about this policy, you may email us at <a href="mailto:privacy@synthetica.mock" className="font-semibold text-light-cyan dark:text-cyber-cyan hover:underline">privacy@synthetica.mock</a>.</p>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
