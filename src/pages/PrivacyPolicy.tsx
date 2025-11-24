import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card>
          <CardContent className="p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                NaijaFreelance ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="font-semibold mb-2">2.1. Information You Provide</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Account information (name, email, password)</li>
                    <li>Profile information (bio, skills, portfolio, profile picture)</li>
                    <li>Payment information (processed securely through payment gateways)</li>
                    <li>Communication data (messages, project requirements)</li>
                    <li>Reviews and ratings</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">2.2. Automatically Collected Information</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Device information (IP address, browser type, device type)</li>
                    <li>Usage data (pages visited, time spent, clicks)</li>
                    <li>Cookies and similar tracking technologies</li>
                    <li>Location data (if enabled)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <div className="space-y-3 text-gray-700">
                <p>We use your information to:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Provide, maintain, and improve our Platform</li>
                  <li>Process transactions and payments</li>
                  <li>Facilitate communication between users</li>
                  <li>Send you important updates and notifications</li>
                  <li>Verify user identity and prevent fraud</li>
                  <li>Respond to your inquiries and support requests</li>
                  <li>Analyze usage patterns to improve user experience</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Information Sharing and Disclosure</h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="font-semibold mb-2">4.1. Public Information</h3>
                  <p>Your profile information, gig listings, and reviews are visible to other users on the Platform.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">4.2. Service Providers</h3>
                  <p>We may share information with third-party service providers who help us operate the Platform, including payment processors, hosting providers, and analytics services.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">4.3. Legal Requirements</h3>
                  <p>We may disclose information if required by law, court order, or government regulation, or to protect our rights and the safety of our users.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">4.4. Business Transfers</h3>
                  <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new entity.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
              <div className="space-y-3 text-gray-700">
                <p>We implement appropriate technical and organizational measures to protect your information:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Secure payment processing through PCI-compliant gateways</li>
                  <li>Regular security audits and updates</li>
                  <li>Access controls and authentication</li>
                  <li>Secure hosting infrastructure</li>
                </ul>
                <p className="mt-4">
                  However, no method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking Technologies</h2>
              <div className="space-y-3 text-gray-700">
                <p>We use cookies and similar technologies to:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Remember your preferences and settings</li>
                  <li>Authenticate your account</li>
                  <li>Analyze Platform usage and performance</li>
                  <li>Provide personalized content</li>
                </ul>
                <p className="mt-4">
                  You can control cookies through your browser settings. However, disabling cookies may limit your ability to use certain features of the Platform.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Your Rights and Choices</h2>
              <div className="space-y-3 text-gray-700">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Access and review your personal information</li>
                  <li>Update or correct your information</li>
                  <li>Delete your account and data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Request a copy of your data</li>
                  <li>Object to certain processing activities</li>
                </ul>
                <p className="mt-4">
                  To exercise these rights, please contact us at privacy@naijafreelance.com or through your account settings.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Data Retention</h2>
              <p className="text-gray-700 mb-4">
                We retain your information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. When you delete your account, we will delete or anonymize your personal information, except where we are required to retain it for legal purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
              <p className="text-gray-700 mb-4">
                Our Platform is not intended for users under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected information from a child, we will take steps to delete such information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. International Data Transfers</h2>
              <p className="text-gray-700 mb-4">
                Your information may be transferred to and processed in countries other than your country of residence. We ensure that appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Communication Monitoring</h2>
              <p className="text-gray-700 mb-4">
                To maintain Platform safety and prevent fraud, we monitor communications on the Platform for attempts to move transactions off-platform, share contact information, or engage in prohibited activities. This monitoring helps protect all users and ensures compliance with our Terms of Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through a notice on the Platform. Your continued use of the Platform after changes become effective constitutes acceptance of the updated Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">13. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:
              </p>
              <p className="text-gray-700">
                Email: privacy@naijafreelance.com<br />
                Support: support@naijafreelance.com<br />
                Address: Lagos, Nigeria
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

