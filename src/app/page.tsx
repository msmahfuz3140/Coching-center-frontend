import Link from 'next/link'

const stats = [
  { value: '500+', label: 'Active Students', icon: '👨‍🎓' },
  { value: '50+', label: 'Expert Courses', icon: '📚' },
  { value: '20+', label: 'Expert Teachers', icon: '👨‍🏫' },
  { value: '95%', label: 'Success Rate', icon: '🏆' },
]

const steps = [
  {
    step: '01',
    title: 'Create Your Account',
    desc: 'Sign up in seconds with your email. No credit card required.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    step: '02',
    title: 'Enroll in Courses',
    desc: 'Browse our catalog and enroll in courses that match your goals.',
    color: 'from-indigo-500 to-indigo-600',
  },
  {
    step: '03',
    title: 'Watch Video Lessons',
    desc: 'Access HD video lectures anytime, anywhere on any device.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    step: '04',
    title: 'Track Your Progress',
    desc: 'Complete assignments, get feedback, and monitor your growth.',
    color: 'from-violet-500 to-violet-600',
  },
]

const testimonials = [
  {
    name: 'Rahim Ahmed',
    role: 'Diploma in CSE, 4th Semester',
    text: 'This platform completely changed how I study. The video lectures and assignments helped me score top marks in my semester exams.',
    avatar: 'R',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    name: 'Fatima Khatun',
    role: 'Diploma in EEE, 6th Semester',
    text: 'The best coaching center platform I have used. Teachers upload notes and videos regularly, and I can track my progress easily.',
    avatar: 'F',
    color: 'from-purple-500 to-pink-500',
  },
  {
    name: 'Kamal Hossain',
    role: 'Diploma in Civil, 2nd Semester',
    text: 'Notifications keep me updated about new assignments and notices. The dashboard is clean and easy to navigate.',
    avatar: 'K',
    color: 'from-green-500 to-emerald-500',
  },
]

const faqs = [
  { q: 'Is this platform free to use?', a: 'Yes! Students can create an account and access enrolled courses completely free of charge.' },
  { q: 'How do I enroll in a course?', a: 'After creating an account, browse the courses page and request enrollment. The admin will approve your request.' },
  { q: 'Can I watch videos on mobile?', a: 'Absolutely! Our platform is fully responsive and works on phones, tablets, and desktops.' },
  { q: 'How do I get notified about new content?', a: 'You will receive real-time notifications for new assignments, notices, and course updates through the bell icon.' },
  { q: 'Who manages the courses?', a: 'Courses are managed by qualified polytechnic teachers through the admin dashboard.' },
]

export default function Home() {
  return (
    <div className="flex-1">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Polytechnic Education Platform
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Transform Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> Learning</span>
              <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Journey</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              A modern LMS designed for polytechnic coaching centers — manage courses, video lectures, assignments, and student progress all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-1">
                Get Started Free
              </Link>
              <Link href="/courses" className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:text-blue-600 transition-all duration-300 hover:-translate-y-1">
                Explore Courses
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="relative -mt-8 z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center group">
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{s.value}</div>
                <div className="text-sm text-gray-500 mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Features</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Everything You Need to Learn</h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">Our platform provides all the tools for an effective learning experience.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Course Management', desc: 'Organized course catalog with categories, descriptions, and enrollment tracking.', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', bg: 'bg-blue-100', fg: 'text-blue-600' },
            { title: 'Video Lectures', desc: 'Watch high-quality video lessons uploaded by expert polytechnic teachers anytime.', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z', bg: 'bg-green-100', fg: 'text-green-600' },
            { title: 'Assignment Tracking', desc: 'Submit assignments, receive grades and feedback from teachers in real-time.', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', bg: 'bg-purple-100', fg: 'text-purple-600' },
          ].map((f) => (
            <div key={f.title} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:-translate-y-1">
              <div className={`w-14 h-14 ${f.bg} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <svg className={`w-7 h-7 ${f.fg}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
              <p className="text-gray-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">How It Works</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Start Learning in 4 Simple Steps</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div key={s.step} className="relative group">
                {i < 3 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-gray-300 to-transparent z-0" />
                )}
                <div className="relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1 z-10">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${s.color} flex items-center justify-center text-white text-sm font-bold mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {s.step}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-purple-600 uppercase tracking-wider">Why Choose Us</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Why Coaching Centers Choose Us</h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">Everything you need to run courses and stay connected to students.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Fast Admin Workflow', desc: 'Manage users, courses and access in minutes, not hours.', icon: '⚡' },
            { title: 'Real-time Notifications', desc: 'Students get instant alerts for new content and updates.', icon: '🔔' },
            { title: 'Secure Enrollment', desc: 'Admin-controlled access for each course and student.', icon: '🔒' },
            { title: 'Mobile Friendly', desc: 'Responsive design that works perfectly on every device.', icon: '📱' },
          ].map((x) => (
            <div key={x.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                {x.icon}
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900">{x.title}</h3>
              <p className="mt-2 text-gray-600 text-sm leading-relaxed">{x.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Testimonials</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">What Our Students Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-sm font-bold`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-gray-900 font-semibold text-sm">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-green-600 uppercase tracking-wider">FAQ</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((f, i) => (
            <details key={i} className="group bg-white rounded-xl border border-gray-200 hover:border-blue-200 transition-colors duration-200">
              <summary className="flex items-center justify-between cursor-pointer px-6 py-5 text-gray-900 font-medium text-sm md:text-base">
                {f.q}
                <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform duration-300 shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                {f.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-12 md:p-16 text-center text-white">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-2xl" />
          </div>
          <div className="relative">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Ready to Start Learning?</h2>
            <p className="text-lg mb-10 opacity-90 max-w-xl mx-auto">Join hundreds of polytechnic students already using our platform to ace their exams.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="inline-block px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:-translate-y-1">
                Create Free Account
              </Link>
              <Link href="/courses" className="inline-block px-8 py-4 bg-transparent border-2 border-white/40 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
                Explore Courses
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
