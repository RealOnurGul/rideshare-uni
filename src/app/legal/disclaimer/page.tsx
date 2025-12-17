import Link from "next/link";

export default function DisclaimerPage() {
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

        <h1 className="text-4xl font-bold text-gray-900 mb-6">Disclaimer</h1>
        <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-8">
          <section className="bg-red-50 border-l-4 border-red-500 p-6">
            <h2 className="text-2xl font-bold text-red-900 mb-4">⚠️ CRITICAL DEMO SITE DISCLAIMER</h2>
            <p className="text-red-900 font-bold text-lg mb-4">
              THIS WEBSITE IS A DEMONSTRATION AND TEST SITE ONLY. IT SHOULD NOT BE USED FOR ACTUAL 
              RIDESHARING OR ANY REAL-WORLD PURPOSE.
            </p>
            <p className="text-red-800 font-semibold">
              This StudentRide platform is provided solely for testing, development, and demonstration 
              purposes. There are NO guarantees, warranties, or protections of any kind.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. No Real Service</h2>
            <p className="text-gray-700 mb-4">
              <strong>StudentRide, as presented on this website, is NOT a real ridesharing service.</strong> 
              This is a demo/test platform created for:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Testing and development purposes</li>
              <li>Demonstrating platform features and functionality</li>
              <li>Educational and evaluation purposes</li>
              <li>Portfolio and demonstration purposes</li>
            </ul>
            <p className="text-gray-700 font-semibold">
              <strong>DO NOT attempt to use this site for actual transportation needs. 
              DO NOT rely on any rides, bookings, or services offered through this demo site.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. No Safety Guarantees</h2>
            <p className="text-gray-700 mb-4">
              <strong>THIS DEMO SITE PROVIDES NO SAFETY GUARANTEES WHATSOEVER.</strong> Specifically:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li><strong>No background checks:</strong> Users are not verified or screened</li>
              <li><strong>No safety protocols:</strong> No real safety measures are in place</li>
              <li><strong>No insurance:</strong> No transportation insurance coverage exists</li>
              <li><strong>No emergency support:</strong> No real emergency response system</li>
              <li><strong>No verification:</strong> User identities and credentials are not verified</li>
            </ul>
            <p className="text-gray-700 font-bold text-lg">
              <strong>USING THIS DEMO SITE FOR ACTUAL RIDESHARING IS EXTREMELY DANGEROUS AND STRICTLY PROHIBITED.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. No Data Safety or Privacy</h2>
            <p className="text-gray-700 mb-4">
              <strong>ALL DATA ON THIS DEMO SITE IS UNPROTECTED AND UNSAFE:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Personal information may be accessed by unauthorized parties</li>
              <li>Data is not encrypted or securely stored</li>
              <li>No privacy protections or data security measures are in place</li>
              <li>All data may be deleted, modified, or exposed without notice</li>
              <li>No compliance with data protection regulations (GDPR, CCPA, etc.)</li>
            </ul>
            <p className="text-gray-700 font-semibold">
              <strong>DO NOT enter real personal information, payment details, or any sensitive data.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. No Liability</h2>
            <p className="text-gray-700 mb-4">
              <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM ALL LIABILITY FOR:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Any injuries, damages, or losses resulting from use of this demo site</li>
              <li>Any consequences of attempting to use this site for actual ridesharing</li>
              <li>Data loss, security breaches, or privacy violations</li>
              <li>Site unavailability, errors, or malfunctions</li>
              <li>Any real-world consequences of using this test platform</li>
            </ul>
            <p className="text-gray-700 font-semibold">
              <strong>You use this demo site at your own risk with no liability protection.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. No Warranties</h2>
            <p className="text-gray-700 mb-4">
              This demo site is provided "AS IS" and "AS AVAILABLE" with NO WARRANTIES of any kind, 
              express or implied, including but not limited to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Warranties of merchantability</li>
              <li>Warranties of fitness for a particular purpose</li>
              <li>Warranties of accuracy or reliability</li>
              <li>Warranties of security or privacy</li>
              <li>Warranties of uninterrupted or error-free operation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Prohibited Uses</h2>
            <p className="text-gray-700 mb-4">
              <strong>YOU ARE STRICTLY PROHIBITED FROM:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Using this demo site for actual ridesharing or transportation</li>
              <li>Entering real personal information or payment details</li>
              <li>Relying on this site for any real-world purpose</li>
              <li>Holding us liable for any consequences of using this test site</li>
              <li>Expecting any level of service, protection, or guarantee</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Site Availability</h2>
            <p className="text-gray-700 mb-4">
              This demo site may be:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Taken offline at any time without notice</li>
              <li>Reset or wiped clean during testing</li>
              <li>Modified or changed without warning</li>
              <li>Experiencing errors, bugs, or malfunctions</li>
            </ul>
            <p className="text-gray-700 font-semibold">
              <strong>No availability or uptime guarantees are provided.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Indemnification</h2>
            <p className="text-gray-700">
              You agree to indemnify, defend, and hold harmless the operators of this demo site from any 
              claims, damages, losses, liabilities, and expenses (including legal fees) arising from your 
              use of this test platform or violation of these terms.
            </p>
          </section>

          <section className="bg-red-50 border-l-4 border-red-500 p-6 mt-8">
            <h2 className="text-2xl font-bold text-red-900 mb-4">FINAL DISCLAIMER</h2>
            <p className="text-red-900 font-bold text-lg mb-4">
              THIS IS A TEST SITE ONLY. IT IS NOT A REAL RIDESHARING SERVICE. DO NOT USE IT FOR ACTUAL 
              TRANSPORTATION. DO NOT ENTER REAL DATA. DO NOT EXPECT ANY PROTECTIONS OR GUARANTEES.
            </p>
            <p className="text-red-800 font-semibold">
              Use of this demo site is at your own risk. All liability is disclaimed. No warranties are 
              provided. This is strictly a testing and demonstration environment with no real-world 
              application or service provided.
            </p>
          </section>
        </div>

        <div className="mt-8 flex gap-4">
          <Link 
            href="/legal/cookie-policy" 
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← Cookie Policy
          </Link>
          <Link 
            href="/legal/accessibility" 
            className="text-indigo-600 hover:text-indigo-800 font-medium ml-auto"
          >
            Accessibility Statement →
          </Link>
        </div>
      </div>
    </div>
  );
}

