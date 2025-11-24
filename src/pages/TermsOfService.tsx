import { Card, CardContent } from "@/components/ui/card";

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card>
          <CardContent className="p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using NaijaFreelance ("the Platform"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
              <p className="text-gray-700 mb-4">
                NaijaFreelance is a marketplace platform that connects clients with freelancers. We provide a platform for freelancers to offer their services and for clients to find and hire freelancers. We are not a party to any agreement between clients and freelancers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
              <div className="space-y-3 text-gray-700">
                <p>3.1. You must be at least 18 years old to use our Platform.</p>
                <p>3.2. You are responsible for maintaining the confidentiality of your account credentials.</p>
                <p>3.3. You agree to provide accurate, current, and complete information during registration.</p>
                <p>3.4. You are responsible for all activities that occur under your account.</p>
                <p>3.5. You must notify us immediately of any unauthorized use of your account.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. User Conduct</h2>
              <div className="space-y-3 text-gray-700">
                <p>You agree not to:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe upon the rights of others</li>
                  <li>Post false, misleading, or fraudulent information</li>
                  <li>Engage in spam, phishing, or other malicious activities</li>
                  <li>Attempt to circumvent our payment system or fees</li>
                  <li>Take communication off-platform to avoid fees</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Use the Platform for any illegal purpose</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Freelancer Obligations</h2>
              <div className="space-y-3 text-gray-700">
                <p>5.1. Freelancers must provide accurate information about their skills and services.</p>
                <p>5.2. Freelancers must deliver work that meets the agreed-upon requirements.</p>
                <p>5.3. Freelancers must complete work within the agreed timeline.</p>
                <p>5.4. Freelancers must maintain professional communication with clients.</p>
                <p>5.5. Freelancers must not request payment outside of the Platform.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Client Obligations</h2>
              <div className="space-y-3 text-gray-700">
                <p>6.1. Clients must provide clear and accurate project requirements.</p>
                <p>6.2. Clients must make timely payments for services rendered.</p>
                <p>6.3. Clients must review and approve completed work in a timely manner.</p>
                <p>6.4. Clients must communicate professionally with freelancers.</p>
                <p>6.5. Clients must not request work outside of the Platform to avoid fees.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Payments and Fees</h2>
              <div className="space-y-3 text-gray-700">
                <p>7.1. All payments are processed through secure payment gateways.</p>
                <p>7.2. NaijaFreelance charges a 20% commission on completed orders.</p>
                <p>7.3. Payments are held in escrow until work is completed and approved.</p>
                <p>7.4. Refunds are subject to our refund policy and dispute resolution process.</p>
                <p>7.5. All fees are non-refundable unless required by law.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Intellectual Property</h2>
              <div className="space-y-3 text-gray-700">
                <p>8.1. Freelancers retain ownership of their work until payment is completed.</p>
                <p>8.2. Upon full payment, clients receive a license to use the delivered work as agreed.</p>
                <p>8.3. The Platform and its content are protected by intellectual property laws.</p>
                <p>8.4. Users grant NaijaFreelance a license to use their content for Platform purposes.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Dispute Resolution</h2>
              <div className="space-y-3 text-gray-700">
                <p>9.1. Users are encouraged to resolve disputes directly through communication.</p>
                <p>9.2. If a dispute cannot be resolved, users may request Platform mediation.</p>
                <p>9.3. Our support team will review disputes and make fair decisions.</p>
                <p>9.4. Platform decisions are final and binding.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                NaijaFreelance is not liable for any damages arising from the use of our Platform, including but not limited to direct, indirect, incidental, or consequential damages. We are not responsible for the quality, safety, or legality of services provided by freelancers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Termination</h2>
              <div className="space-y-3 text-gray-700">
                <p>11.1. We may terminate or suspend your account at any time for violations of these terms.</p>
                <p>11.2. You may close your account at any time through your account settings.</p>
                <p>11.3. Upon termination, your right to use the Platform immediately ceases.</p>
                <p>11.4. Outstanding obligations must be fulfilled before account closure.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify these Terms of Service at any time. We will notify users of significant changes via email or Platform notification. Continued use of the Platform after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">13. Governing Law</h2>
              <p className="text-gray-700 mb-4">
                These Terms of Service are governed by the laws of Nigeria. Any disputes shall be resolved in the courts of Nigeria.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">14. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have questions about these Terms of Service, please contact us at:
              </p>
              <p className="text-gray-700">
                Email: legal@naijafreelance.com<br />
                Support: support@naijafreelance.com
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

