import Link from "next/link";

export default function CookiePolicyPage() {
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

        <h1 className="text-4xl font-bold text-gray-900 mb-6">Cookie Policy</h1>
        <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Demo Site Disclaimer</h2>
            <p className="text-gray-700 mb-4">
              <strong>THIS WEBSITE IS A DEMONSTRATION AND TEST SITE ONLY.</strong> This StudentRide platform 
              is not intended for actual use. Cookie usage on this demo site is for testing purposes only.
            </p>
            <p className="text-gray-700 font-semibold">
              <strong>NO PRIVACY GUARANTEES:</strong> Cookies on this demo site are not subject to the same 
              privacy protections as production services. Cookie data may be accessed, shared, or used in 
              ways that would not be acceptable on a real service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. What Are Cookies</h2>
            <p className="text-gray-700 mb-4">
              Cookies are small text files that are placed on your device when you visit a website. They are 
              used to remember your preferences, maintain your session, and provide analytics.
            </p>
            <p className="text-gray-700">
              <strong>On this demo site, cookies are used for testing and demonstration purposes only.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Types of Cookies We Use</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Essential Cookies</h3>
              <p className="text-gray-700 mb-2">
                These cookies are necessary for the demo site to function, including:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Authentication cookies (NextAuth session management)</li>
                <li>Security cookies for login sessions</li>
              </ul>
              <p className="text-gray-700 font-semibold">
                <strong>Note:</strong> Even essential cookies on this test site are not guaranteed to be 
                secure or protected.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Analytics Cookies</h3>
              <p className="text-gray-700 mb-2">
                We use Vercel Analytics to collect usage data on this demo site:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Page views and navigation patterns</li>
                <li>User interactions and engagement metrics</li>
                <li>Performance and error tracking</li>
              </ul>
              <p className="text-gray-700 font-semibold">
                <strong>Warning:</strong> Analytics data on this test site may include identifying information 
                and is not subject to production-level privacy protections.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Functional Cookies</h3>
              <p className="text-gray-700 mb-2">
                These cookies enable enhanced functionality on the demo site:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>User preferences and settings</li>
                <li>Form data and temporary storage</li>
              </ul>
              <p className="text-gray-700">
                <strong>All functional cookies on this test site are temporary and may be cleared at any time.</strong>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Third-Party Cookies</h2>
            <p className="text-gray-700 mb-4">
              This demo site may use cookies from third-party services including:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li><strong>Vercel Analytics</strong> - For usage analytics and performance monitoring</li>
              <li><strong>NextAuth</strong> - For authentication and session management</li>
              <li><strong>Map Services</strong> - For location and mapping features</li>
            </ul>
            <p className="text-gray-700 font-semibold">
              <strong>We are not responsible for third-party cookie practices on this demo/test site.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Cookie Consent</h2>
            <p className="text-gray-700 mb-4">
              <strong>By using this demo/test site, you acknowledge that:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Cookies will be placed on your device</li>
              <li>Cookie data may not be protected or secure</li>
              <li>You understand this is a test site with no privacy guarantees</li>
              <li>Cookie consent mechanisms may not function as they would on a production site</li>
            </ul>
            <p className="text-gray-700 font-semibold">
              <strong>DO NOT use this demo site if you do not consent to cookie usage for testing purposes.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Managing Cookies</h2>
            <p className="text-gray-700 mb-4">
              You can manage cookies through your browser settings:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Block all cookies (may prevent the demo site from functioning)</li>
              <li>Delete cookies after each session</li>
              <li>View and manage individual cookies</li>
            </ul>
            <p className="text-gray-700">
              <strong>Note:</strong> Since this is a demo/test site, cookie management features may not work 
              as expected. The site is not optimized for cookie preferences.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. No Cookie Protection Guarantees</h2>
            <p className="text-gray-700 mb-4">
              <strong>This demo site does NOT guarantee:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Secure cookie transmission or storage</li>
              <li>Protection from cookie-based tracking</li>
              <li>Compliance with cookie consent regulations</li>
              <li>Proper cookie expiration or deletion</li>
              <li>Privacy protection for cookie data</li>
            </ul>
            <p className="text-gray-700 font-semibold">
              <strong>Use this test site with the understanding that cookie data is not protected.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Changes to Cookie Policy</h2>
            <p className="text-gray-700">
              This cookie policy may be changed at any time without notice. Since this is a demo/test site, 
              cookie usage and policies may change during testing and development.
            </p>
          </section>

          <section className="bg-red-50 border-l-4 border-red-500 p-4 mt-8">
            <p className="text-red-900 font-bold text-lg">
              FINAL WARNING: This is a TEST SITE. Cookies are used for testing purposes only. 
              No cookie data is guaranteed to be safe, secure, or private. Do not use this demo site 
              if you require cookie privacy protections.
            </p>
          </section>
        </div>

        <div className="mt-8 flex gap-4">
          <Link 
            href="/legal/privacy-policy" 
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← Privacy Policy
          </Link>
          <Link 
            href="/legal/disclaimer" 
            className="text-indigo-600 hover:text-indigo-800 font-medium ml-auto"
          >
            Disclaimer →
          </Link>
        </div>
      </div>
    </div>
  );
}

