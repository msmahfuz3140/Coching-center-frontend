import Link from 'next/link'

const coreFeatures = [
  {
    title: 'Admin Dashboard',
    desc: 'A powerful control center to manage users, courses, enrollments, and notices. View analytics and monitor platform activity at a glance.',
    color: 'from-blue-600 to-indigo-600',
    icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
  },
  {
    title: 'Course Management',
    desc: 'Create courses with titles, descriptions, fees, and thumbnails. Organize video lectures into structured playlists for each course.',
    color: 'from-indigo-600 to-purple-600',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  },
  {
    title: 'Video Lectures',
    desc: 'Upload and organize HD video lessons for each course. Students can watch anytime on any device with a clean, distraction-free player.',
    color: 'from-purple-600 to-pink-600',
    icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    title: 'Assignment System',
    desc: 'Create assignments, set deadlines, and review student submissions. Students receive grades and feedback in real-time.',
    color: 'from-emerald-600 to-teal-600',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  },
  {
    title: 'Student Enrollment',
    desc: 'Admin-controlled enrollment ensures only authorized students access specific courses. Approve or reject enrollment requests easily.',
    color: 'from-amber-500 to-orange-600',
    icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
  },
  {
    title: 'Notice Board',
    desc: 'Post important announcements and notices that instantly reach all students. Keep everyone informed about exams, schedules, and updates.',
    color: 'from-rose-500 to-red-600',
    icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
  },
]

const extraFeatures = [
  { title: 'Real-time Notifications', desc: 'Instant bell alerts for new content, assignments, and updates.', icon: '🔔' },
  { title: 'Profile Management', desc: 'Students can update profile photo, name, and account details.', icon: '👤' },
  { title: 'Email Verification', desc: 'OTP-based email verification for secure account creation.', icon: '✉️' },
  { title: 'Responsive Design', desc: 'Works perfectly on phones, tablets, and desktops.', icon: '📱' },
  { title: 'Progress Tracking', desc: 'Visual progress indicators for courses and assignments.', icon: '📊' },
  { title: 'Secure Authentication', desc: 'Password encryption and session management with Better Auth.', icon: '🔐' },
  { title: 'Cloud Image Storage', desc: 'Profile photos and thumbnails stored securely on Cloudinary.', icon: '☁️' },
  { title: 'Role-based Access', desc: 'Separate admin and student dashboards with controlled access.', icon: '🛡️' },
]

const comparisons = [
  { feature: 'Course Management', us: true, others: true },
  { feature: 'Video Lectures', us: true, others: false },
  { feature: 'Real-time Notifications', us: true, others: false },
  { feature: 'Student Enrollment Control', us: true, others: false },
  { feature: 'Assignment System', us: true, others: true },
  { feature: 'Admin Dashboard', us: true, others: true },
  { feature: 'Email OTP Verification', us: true, others: false },
  { feature: 'Mobile Responsive', us: true, others: false },
  { feature: 'Free to Use', us: true, others: false },
]

export default function FeaturesPage() {
  return (
    <div className="flex-1">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Platform Features
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Everything You Need to
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> Teach & Learn</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Our platform provides all the tools polytechnic coaching centers need — from course management to student progress tracking.
          </p>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Core Features</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Powerful Tools for Coaching Centers</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {coreFeatures.map((f) => (
            <div key={f.title} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
              <p className="text-gray-600 leading-relaxed text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Extra Features */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">And More</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Built-in Extras That Make a Difference</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {extraFeatures.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-purple-600 uppercase tracking-wider">Comparison</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">How We Compare</h2>
          <p className="text-gray-600 mt-4">See what sets us apart from traditional coaching management tools.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200 text-sm font-semibold">
            <div className="px-6 py-4 text-gray-700">Feature</div>
            <div className="px-6 py-4 text-center text-blue-600">Our Platform</div>
            <div className="px-6 py-4 text-center text-gray-500">Others</div>
          </div>
          {comparisons.map((c, i) => (
            <div key={c.feature} className={`grid grid-cols-3 text-sm ${i !== comparisons.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-blue-50/30 transition-colors duration-200`}>
              <div className="px-6 py-4 text-gray-700 font-medium">{c.feature}</div>
              <div className="px-6 py-4 text-center">
                {c.us ? (
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </span>
                )}
              </div>
              <div className="px-6 py-4 text-center">
                {c.others ? (
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-12 md:p-16 text-center text-white">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-2xl" />
          </div>
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Experience These Features?</h2>
            <p className="text-lg mb-10 opacity-90 max-w-xl mx-auto">Create your free account and explore all the tools our platform offers.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="inline-block px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:-translate-y-1">
                Create Free Account
              </Link>
              <Link href="/login" className="inline-block px-8 py-4 bg-transparent border-2 border-white/40 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
