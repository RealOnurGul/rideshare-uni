import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-yellow-900 mb-3">⚠️ IMPORTANT DEMO SITE NOTICE</h2>
          <p className="text-yellow-800 font-semibold">
            This website is a DEMO/TEST SITE ONLY. This platform should NOT be used for actual ridesharing. 
            There are NO guarantees regarding data safety, security, or privacy. All data may be deleted, 
            modified, or exposed without notice. This is strictly a testing environment.
          </p>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Demo Site Disclaimer</h2>
            <p className="text-gray-700 mb-4">
              <strong>THIS WEBSITE IS A DEMONSTRATION AND TEST SITE ONLY.</strong> This StudentRide platform 
              is not intended for actual use. It is provided solely for testing and demonstration purposes. 
              <strong> DO NOT use this site for actual ridesharing or transportation needs.</strong>
            </p>
            <p className="text-gray-700">
              <strong>NO DATA GUARANTEES:</strong> We make no guarantees regarding the safety, security, 
              privacy, or retention of any data entered into this demo site. All data may be deleted, 
              modified, accessed by unauthorized parties, or lost at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information Collection</h2>
            <p className="text-gray-700 mb-4">
              As a demo/test site, this platform may collect various types of information including:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Personal information you voluntarily enter (name, email, phone number, university)</li>
              <li>Location data when using map features</li>
              <li>Usage data and analytics (via Vercel Analytics)</li>
              <li>Cookies and tracking technologies</li>
              <li>Ride booking information and messages</li>
            </ul>
            <p className="text-gray-700 font-semibold">
              <strong>WARNING:</strong> All data entered is stored in a test database and may be accessed, 
              modified, or deleted without your knowledge or consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Data Usage</h2>
            <p className="text-gray-700 mb-4">
              Data collected on this demo site may be used for:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Testing and development purposes</li>
              <li>Demonstrating platform features</li>
              <li>Debugging and troubleshooting</li>
              <li>Analytics and performance monitoring</li>
            </ul>
            <p className="text-gray-700 font-semibold">
              <strong>NO COMMERCIAL USE:</strong> This is a test site. Do not provide real personal information 
              or expect any level of data protection.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
            <p className="text-gray-700 mb-4">
              <strong>NO SECURITY GUARANTEES:</strong> This demo site does not provide enterprise-grade 
              security. Data transmission and storage may not be encrypted or protected. We make no 
              guarantees about data security or protection from unauthorized access.
            </p>
            <p className="text-gray-700">
              <strong>DO NOT enter sensitive personal information, payment details, or any data you 
              wish to keep private.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Retention and Deletion</h2>
            <p className="text-gray-700 mb-4">
              Data on this demo site may be deleted at any time without notice. There is no data retention 
              policy, and all information may be permanently removed during testing, updates, or database 
              resets.
            </p>
            <p className="text-gray-700">
              <strong>You have no rights to data deletion or access requests on this test site.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Third-Party Services</h2>
            <p className="text-gray-700 mb-4">
              This demo site uses third-party services including:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Vercel Analytics (for usage analytics)</li>
              <li>NextAuth (for authentication)</li>
              <li>Map services (for location features)</li>
            </ul>
            <p className="text-gray-700">
              These services may collect their own data. We are not responsible for their privacy practices 
              on this demo/test site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cookies</h2>
            <p className="text-gray-700 mb-4">
              This demo site uses cookies and similar tracking technologies. See our{" "}
              <Link href="/legal/cookie-policy" className="text-indigo-600 hover:text-indigo-800 underline">
                Cookie Policy
              </Link>{" "}
              for more information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. No Legal Rights</h2>
            <p className="text-gray-700 mb-4">
              <strong>By using this demo/test site, you acknowledge and agree that:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>You have no privacy rights or data protection rights on this test platform</li>
              <li>This is not a production service and has no privacy guarantees</li>
              <li>All data you enter may be publicly visible or accessible</li>
              <li>You use this site at your own risk with no expectation of privacy</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact</h2>
            <p className="text-gray-700">
              This is a demo/test site. For questions about this privacy policy or the demo site, 
              please be aware that this platform is not a real service and there is no customer support.
            </p>
          </section>

          <section className="bg-red-50 border-l-4 border-red-500 p-4 mt-8">
            <p className="text-red-900 font-bold text-lg">
              FINAL WARNING: This is a TEST SITE. Do not use for real ridesharing. 
              Do not provide real personal data. No data is safe or private on this demo platform.
            </p>
          </section>
        </div>

        <div className="mt-8 flex gap-4">
          <Link 
            href="/legal/terms-of-use" 
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← Terms of Use
          </Link>
          <Link 
            href="/legal/cookie-policy" 
            className="text-indigo-600 hover:text-indigo-800 font-medium ml-auto"
          >
            Cookie Policy →
          </Link>
        </div>
      </div>
    </div>
  );
}

