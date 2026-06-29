import Link from 'next/link'

const values = [
  {
    title: 'Quality Education',
    desc: 'We believe every polytechnic student deserves access to well-structured, high-quality learning content and expert guidance.',
    icon: '🎓',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    title: 'Simple & Accessible',
    desc: 'Our platform is designed to be intuitive — no complex setup, no learning curve. Start teaching and learning from day one.',
    icon: '✨',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    title: 'Always Improving',
    desc: 'We continuously add new features and improvements based on feedback from real coaching centers and students.',
    icon: '🚀',
    color: 'from-purple-500 to-pink-500',
  },
]

const timeline = [
  { year: '2024', title: 'Idea Born', desc: 'Identified the need for a modern LMS tailored for polytechnic coaching centers in Bangladesh.' },
  { year: '2024', title: 'Development Started', desc: 'Built the core platform with Next.js, MongoDB, and modern web technologies.' },
  { year: '2025', title: 'Beta Launch', desc: 'Launched beta version with course management, video lectures, and student enrollment.' },
  { year: '2025', title: 'Full Release', desc: 'Released with notifications, assignments, admin dashboard, and email verification.' },
]

const team = [
  { name: 'Mahfuzul Haque', role: 'Founder & Lead Developer', desc: 'Full-stack developer passionate about building tools that make education accessible.', avatar: 'M', color: 'from-blue-500 to-indigo-600' },
  { name: 'Technical Team', role: 'Development & Design', desc: 'A dedicated team building and maintaining the platform with modern technologies.', avatar: 'T', color: 'from-indigo-500 to-purple-600' },
  { name: 'Student Community', role: 'Feedback & Testing', desc: 'Active students who help us improve the platform with real-world feedback.', avatar: 'S', color: 'from-purple-500 to-pink-600' },
]

export default function AboutPage() {
  return (
    <div className="flex-1">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-16 md:py-24 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            About Us
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Empowering Polytechnic
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> Education</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
            We are building a modern learning management system designed specifically for polytechnic coaching centers in Bangladesh — helping teachers teach better and students learn smarter.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 md:p-10 hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Our Mission</h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              To make quality polytechnic education accessible and manageable through technology. We provide tools that simplify course delivery, student tracking, and coaching center operations — so teachers can focus on what matters most: teaching.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 md:p-10 hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Our Vision</h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              To become the go-to digital platform for polytechnic coaching centers across Bangladesh, enabling thousands of students to access structured learning, video lessons, and organized academic content from anywhere.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Our Values</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mt-2">What Drives Us</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {values.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-2xl sm:text-3xl mx-auto mb-4 sm:mb-5 group-hover:scale-110 transition-transform duration-300">
                  {v.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{v.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-12 md:mb-16">
          <span className="text-sm font-semibold text-purple-600 uppercase tracking-wider">Our Journey</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mt-2">How We Got Here</h2>
        </div>
        <div className="relative">
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 via-indigo-300 to-purple-300" />
          <div className="space-y-8 md:space-y-12">
            {timeline.map((t, i) => (
              <div key={i} className={`relative flex items-start gap-4 md:gap-12 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className="hidden md:block md:w-1/2" />
                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 border-3 sm:border-4 border-white shadow-lg z-10" />
                <div className="ml-12 md:ml-0 md:w-1/2 bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sm:p-6 hover:shadow-xl transition-all duration-300">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{t.year}</span>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mt-2 sm:mt-3 mb-1 sm:mb-2">{t.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <span className="text-sm font-semibold text-green-600 uppercase tracking-wider">Our Team</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mt-2">The People Behind The Platform</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {team.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center group">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-xl sm:text-2xl font-bold mx-auto mb-4 sm:mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  {t.avatar}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">{t.name}</h3>
                <p className="text-xs sm:text-sm text-blue-600 font-medium mt-1">{t.role}</p>
                <p className="text-xs sm:text-sm text-gray-600 mt-2 sm:mt-3 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 md:p-12">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Platform at a Glance</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {[
              { value: '500+', label: 'Students', icon: '👨‍🎓' },
              { value: '50+', label: 'Courses', icon: '📚' },
              { value: '200+', label: 'Video Lessons', icon: '🎬' },
              { value: '99.9%', label: 'Uptime', icon: '⚡' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{s.icon}</div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{s.value}</div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:pb-24">
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 text-center text-white">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-2xl" />
          </div>
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Join Our Growing Community</h2>
            <p className="text-base sm:text-lg mb-6 sm:mb-10 opacity-90 max-w-xl mx-auto px-4 sm:px-0">Be part of the future of polytechnic education in Bangladesh.</p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
              <Link href="/register" className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:-translate-y-1 text-center">
                Get Started Free
              </Link>
              <Link href="/courses" className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-transparent border-2 border-white/40 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 text-center">
                Explore Courses
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
