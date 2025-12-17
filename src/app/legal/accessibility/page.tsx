import Link from "next/link";

export default function AccessibilityPage() {
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

        <h1 className="text-4xl font-bold text-gray-900 mb-6">Accessibility Statement</h1>
        <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Demo Site Status</h2>
            <p className="text-gray-700 mb-4">
              <strong>This StudentRide website is a demonstration and test site only.</strong> This 
              accessibility statement reflects our commitment to inclusive design, but please note that 
              as a demo/test site, accessibility features may not be fully implemented or tested.
            </p>
            <p className="text-gray-700 font-semibold">
              <strong>This site should NOT be used for actual ridesharing regardless of accessibility features.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Commitment to Accessibility</h2>
            <p className="text-gray-700 mb-4">
              We are committed to making this demo site accessible to all users, including those with 
              disabilities. We aim to follow web accessibility best practices, though as a test/demo 
              platform, full compliance may not be achieved.
            </p>
            <p className="text-gray-700">
              <strong>Our goal:</strong> To create an inclusive demo experience that demonstrates 
              accessibility considerations, recognizing that this is a testing environment.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Standards and Guidelines</h2>
            <p className="text-gray-700 mb-4">
              We strive to follow the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards, 
              though as a demo/test site, we acknowledge that:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Not all features may meet WCAG 2.1 Level AA standards</li>
              <li>Accessibility testing may be incomplete</li>
              <li>Some features may not be accessible to all users</li>
              <li>Browser and assistive technology compatibility may vary</li>
            </ul>
            <p className="text-gray-700 font-semibold">
              <strong>This is a demo site, and accessibility is a work in progress.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Accessibility Features</h2>
            <p className="text-gray-700 mb-4">
              The demo site may include the following accessibility features:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Semantic HTML structure</li>
              <li>Alt text for images (where implemented)</li>
              <li>Keyboard navigation support (may be incomplete)</li>
              <li>Color contrast considerations</li>
              <li>Responsive design for various screen sizes</li>
              <li>Form labels and error messages</li>
            </ul>
            <p className="text-gray-700">
              <strong>Note:</strong> Since this is a demo/test site, not all features may be fully 
              accessible, and some accessibility improvements may be incomplete.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Known Limitations</h2>
            <p className="text-gray-700 mb-4">
              <strong>As a demo/test site, there are known accessibility limitations:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Incomplete keyboard navigation in some areas</li>
              <li>Missing or incomplete ARIA labels in some components</li>
              <li>Limited screen reader testing and optimization</li>
              <li>Some interactive elements may not be fully accessible</li>
              <li>Third-party components may have accessibility issues</li>
              <li>Map features may have limited accessibility support</li>
            </ul>
            <p className="text-gray-700 font-semibold">
              <strong>This demo site is not production-ready and should not be relied upon for accessibility compliance.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Assistive Technologies</h2>
            <p className="text-gray-700 mb-4">
              This demo site may work with various assistive technologies, including:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Screen readers (JAWS, NVDA, VoiceOver, etc.)</li>
              <li>Screen magnification software</li>
              <li>Voice recognition software</li>
              <li>Keyboard-only navigation</li>
            </ul>
            <p className="text-gray-700">
              <strong>However, compatibility is not guaranteed on this demo/test site.</strong> 
              Some features may not work properly with all assistive technologies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Feedback and Reporting Issues</h2>
            <p className="text-gray-700 mb-4">
              While we appreciate feedback on accessibility issues, please note that this is a demo/test 
              site and may not be actively maintained or updated based on accessibility feedback.
            </p>
            <p className="text-gray-700 font-semibold">
              <strong>This is not a production service, and accessibility improvements may not be prioritized.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. No Accessibility Guarantees</h2>
            <p className="text-gray-700 mb-4">
              <strong>As a demo/test site, we make NO guarantees regarding:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>WCAG compliance at any level</li>
              <li>Compatibility with all assistive technologies</li>
              <li>Accessibility of all features and functions</li>
              <li>Continuity of accessibility features across updates</li>
              <li>Legal compliance with accessibility regulations (ADA, AODA, etc.)</li>
            </ul>
            <p className="text-gray-700 font-semibold">
              <strong>This demo site is provided "as is" with no accessibility warranties or guarantees.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Third-Party Content</h2>
            <p className="text-gray-700 mb-4">
              This demo site may include third-party content, widgets, or services (such as maps, 
              analytics, etc.) that may not be accessible. We are not responsible for the accessibility 
              of third-party content on this test site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Continuous Improvement</h2>
            <p className="text-gray-700 mb-4">
              While we aim to improve accessibility, this is a demo/test site and may not be actively 
              developed or maintained. Accessibility improvements may be limited or delayed.
            </p>
            <p className="text-gray-700 font-semibold">
              <strong>Do not rely on this demo site for accessible ridesharing services.</strong>
            </p>
          </section>

          <section className="bg-red-50 border-l-4 border-red-500 p-4 mt-8">
            <p className="text-red-900 font-bold text-lg">
              IMPORTANT: This is a TEST SITE ONLY. Accessibility features are not guaranteed, 
              and this site should NOT be used for actual ridesharing regardless of accessibility 
              considerations. No accessibility compliance is guaranteed.
            </p>
          </section>
        </div>

        <div className="mt-8 flex gap-4">
          <Link 
            href="/legal/disclaimer" 
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← Disclaimer
          </Link>
        </div>
      </div>
    </div>
  );
}

