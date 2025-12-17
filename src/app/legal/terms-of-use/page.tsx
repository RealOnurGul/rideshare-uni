import Link from "next/link";

export default function TermsOfUsePage() {
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

        <h1 className="text-4xl font-bold text-gray-900 mb-6">Terms of Use</h1>
        <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing and using this StudentRide website, you acknowledge and agree to these Terms of Use. 
              However, <strong>this is a DEMO/TEST SITE ONLY</strong> and these terms reflect that this is not 
              a real, production service.
            </p>
            <p className="text-gray-700 font-semibold">
              <strong>CRITICAL: This site should NOT be used for actual ridesharing or transportation needs.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Demo Site Status</h2>
            <p className="text-gray-700 mb-4">
              <strong>This StudentRide platform is a demonstration and testing environment only.</strong> It is 
              provided solely for:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Testing and development purposes</li>
              <li>Demonstrating platform features and functionality</li>
              <li>Educational and evaluation purposes</li>
            </ul>
            <p className="text-gray-700 font-semibold">
              <strong>DO NOT use this site for actual ridesharing. DO NOT rely on this platform for 
              transportation. DO NOT use real personal information.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. No Service Guarantees</h2>
            <p className="text-gray-700 mb-4">
              This demo site is provided "AS IS" and "AS AVAILABLE" with no warranties or guarantees of any kind. 
              Specifically:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li><strong>NO availability guarantees</strong> - The site may be unavailable at any time</li>
              <li><strong>NO functionality guarantees</strong> - Features may not work as expected</li>
              <li><strong>NO data safety guarantees</strong> - Data may be lost, deleted, or exposed</li>
              <li><strong>NO security guarantees</strong> - The site is not production-ready</li>
              <li><strong>NO liability protection</strong> - Use at your own risk</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Prohibited Uses</h2>
            <p className="text-gray-700 mb-4">
              You agree NOT to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Use this site for actual ridesharing or transportation</li>
              <li>Enter real, sensitive personal information</li>
              <li>Enter real payment information or financial data</li>
              <li>Rely on this site for any real-world purpose</li>
              <li>Attempt to use this site commercially</li>
              <li>Expect any level of data protection or privacy</li>
              <li>Hold us liable for any issues arising from use of this test site</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. User Content and Data</h2>
            <p className="text-gray-700 mb-4">
              Any content, data, or information you submit to this demo site:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>May be deleted, modified, or lost at any time without notice</li>
              <li>May be visible to other test users or administrators</li>
              <li>Is not protected by any privacy or data protection policies</li>
              <li>May be used for testing and development purposes</li>
            </ul>
            <p className="text-gray-700 font-semibold">
              <strong>DO NOT submit real personal information, real ride requests, or any data you 
              need to keep private or secure.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>We disclaim all liability for any damages arising from use of this demo/test site</li>
              <li>We are not responsible for any data loss, security breaches, or privacy violations</li>
              <li>We are not liable for any transportation, safety, or real-world consequences</li>
              <li>Use of this site is at your own risk with no warranties or protections</li>
            </ul>
            <p className="text-gray-700 font-semibold">
              <strong>This is a test site. You assume all risks by using it.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Indemnification</h2>
            <p className="text-gray-700">
              You agree to indemnify and hold harmless the operators of this demo site from any claims, 
              damages, losses, or expenses arising from your use of this test platform. <strong>This includes 
              any consequences of using this demo site for actual ridesharing, which is strictly prohibited.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Modifications to Terms</h2>
            <p className="text-gray-700">
              These terms may be modified at any time without notice. Since this is a demo/test site, 
              we reserve the right to change, suspend, or discontinue any aspect of the platform at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Termination</h2>
            <p className="text-gray-700 mb-4">
              We may terminate, suspend, or restrict access to this demo site at any time without notice 
              or liability. All data may be deleted upon termination.
            </p>
            <p className="text-gray-700">
              <strong>No notice will be provided if this test site is shut down or reset.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. No Real Service</h2>
            <p className="text-gray-700 mb-4">
              <strong>This is not a real ridesharing service.</strong> StudentRide, as presented on this 
              demo site, is a test/demonstration platform only. There is no actual service, no real 
              ridesharing operations, and no production system.
            </p>
            <p className="text-gray-700 font-semibold">
              <strong>DO NOT attempt to use this site for actual transportation needs. 
              DO NOT rely on any bookings, confirmations, or features.</strong>
            </p>
          </section>

          <section className="bg-red-50 border-l-4 border-red-500 p-4 mt-8">
            <p className="text-red-900 font-bold text-lg">
              FINAL WARNING: This is a TEST SITE ONLY. Do not use for real ridesharing. 
              Use at your own risk with no guarantees or protections. All liability is disclaimed.
            </p>
          </section>
        </div>

        <div className="mt-8 flex gap-4">
          <Link 
            href="/legal/privacy-policy" 
            className="text-indigo-600 hover:text-indigo-800 font-medium ml-auto"
          >
            Privacy Policy →
          </Link>
        </div>
      </div>
    </div>
  );
}

