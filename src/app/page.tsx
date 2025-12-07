import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section - With Montreal Background */}
      <section className="relative min-h-screen flex items-center bg-white overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/montreal-downtown.jpg')`
          }}
        >
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-black/40"></div>
          {/* Gradient overlay for text area */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 w-full z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Left Content */}
            <div className="space-y-8 text-white">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm font-medium text-white">2,000+ active students</span>
              </div>

              <div className="space-y-6">
                <h1 className="text-6xl lg:text-8xl font-bold text-white leading-[1.05] tracking-tight drop-shadow-lg">
                  Rideshare for
                  <br />
                  <span className="text-red-400">Canadian</span>
                  <br />
                  students
          </h1>
                <p className="text-xl text-white/90 leading-relaxed max-w-xl drop-shadow">
                  Split costs with verified university students. Travel between cities affordably and safely.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth/signin"
                  className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-purple-50/50 transition-colors text-center"
                >
                  Get Started
                </Link>
                <Link
                  href="/rides"
                  className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors text-center"
                >
                  Browse Rides
                </Link>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2 text-sm text-white/90">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified only
                </div>
                <div className="flex items-center gap-2 text-sm text-white/90">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Secure payments
                </div>
              </div>
            </div>

            {/* Right Content - Clean Ride Cards */}
            <div className="hidden lg:block space-y-4">
              {/* Card 1 */}
              <div className="bg-white border border-purple-100/50 rounded-lg p-5 hover:border-purple-200/50 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                      M
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">Montreal → Toronto</div>
                      <div className="text-sm text-gray-500">Tomorrow, 8:00 AM</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">$35</div>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    3 seats
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    4h 30m
                  </span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white border border-purple-100/50 rounded-lg p-5 hover:border-purple-200/50 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                      Q
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">Quebec City → Montreal</div>
                      <div className="text-sm text-gray-500">Friday, 5:00 PM</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">$25</div>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    2 seats
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    2h 15m
                  </span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white border border-purple-100/50 rounded-lg p-5 hover:border-purple-200/50 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                      O
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">Ottawa → Montreal</div>
                      <div className="text-sm text-gray-500">Sunday, 6:00 PM</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">$20</div>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    4 seats
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    2h 45m
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-purple-50/30 border-y border-purple-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { value: "2,000+", label: "Active Students" },
              { value: "5,200+", label: "Rides Shared" },
              { value: "$120K+", label: "Saved by Students" },
              { value: "50+", label: "Canadian Universities" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl">
              Three simple steps to start saving money.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "1",
                title: "Create Your Account",
                description: "Sign up with your verified university email. We ensure every user is a legitimate student.",
              },
              {
                step: "2",
                title: "Find or Offer Rides",
                description: "Search for rides to your destination or post your own trip to find passengers and split costs.",
              },
              {
                step: "3",
                title: "Travel Together",
                description: "Connect with your driver or passengers, coordinate pickup details, and enjoy a shared journey.",
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-8xl font-bold text-purple-600/20 absolute -top-4 -left-2 leading-none">{item.step}</div>
                <div className="relative pt-12">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-start">
            <div className="space-y-10">
              <div>
                <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  Built for students,
                  <br />
                  <span className="text-purple-600">by students</span>
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  We understand the unique needs of university students. That&apos;s why StudentRide is designed to be simple, safe, and affordable.
                </p>
              </div>

              <div className="space-y-8 pt-4">
                {[
                  {
                    title: "Verified Students Only",
                    description: "Every user must sign in with a verified university email address. No exceptions.",
                    icon: "✓",
                  },
                  {
                    title: "Transparent Pricing",
                    description: "Drivers set fair prices upfront. No hidden fees, no surge pricing. What you see is what you pay.",
                    icon: "$",
                  },
                  {
                    title: "Eco-Friendly Travel",
                    description: "Reduce your carbon footprint by sharing rides instead of driving alone. Better for the planet.",
                    icon: "🌱",
                  },
                ].map((feature, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700 font-bold text-lg">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonials Grid */}
            <div className="space-y-6">
              {[
                {
                  quote: "StudentRide saved me over $200 this semester. Plus I met some cool people from other programs.",
                  name: "Marie L.",
                  university: "McGill University",
                  initials: "ML",
                },
                {
                  quote: "As a driver, I've been able to cover my gas costs for weekend trips home. The platform is so easy to use.",
                  name: "Alex T.",
                  university: "UofT",
                  initials: "AT",
                },
                {
                  quote: "I love that everyone is verified. Makes me feel safe traveling with other students I don't know yet.",
                  name: "Sarah K.",
                  university: "University de Laval",
                  initials: "SK",
                },
              ].map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-white border border-purple-100/50 rounded-xl p-6 hover:border-purple-200/50 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {testimonial.initials}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 leading-relaxed mb-4">
                        &quot;{testimonial.quote}&quot;
                      </p>
                      <div>
                        <div className="font-semibold text-gray-900">{testimonial.name}</div>
                        <div className="text-sm text-gray-500">{testimonial.university}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Canadian Universities Section */}
      <section className="py-32 bg-white border-y border-purple-100/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="text-5xl mb-6">🇨🇦</div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Built for <span className="text-red-600">Canadian</span> Universities
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              StudentRide is exclusively for students at Canadian universities. 
              No corporate partnerships. Just students helping students.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {["McGill", "UofT", "Laval", "Concordia", "UdeM", "Ottawa"].map((uni, index) => (
              <div 
                key={index}
                className="bg-purple-50/30 border border-purple-100/50 rounded-lg p-6 text-center hover:border-purple-200/50 hover:bg-white transition-all"
              >
                <div className="text-2xl font-bold text-gray-900 mb-2">{uni}</div>
                <div className="text-sm text-gray-600">University</div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <span className="text-gray-600">+ 44 more Canadian universities</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Ready to start?
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Join thousands of Canadian students already using StudentRide.
          </p>
          <Link
            href="/auth/signin"
            className="inline-block px-8 py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <span className="text-lg font-semibold text-white">StudentRide</span>
              </div>
              <p className="text-sm leading-relaxed">
                The trusted rideshare platform for university students.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/rides" className="hover:text-white transition-colors">Find Rides</Link></li>
                <li><Link href="/rides/new" className="hover:text-white transition-colors">Offer a Ride</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/how-it-works" className="hover:text-white transition-colors">How it Works</Link></li>
                <li><Link href="/how-it-works/trust-safety" className="hover:text-white transition-colors">Safety</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-sm text-center">
            © {new Date().getFullYear()} StudentRide. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
