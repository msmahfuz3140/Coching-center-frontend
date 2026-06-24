'use client'

import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="flex-1 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">About</h1>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Polytechnic Education Coching center — a professional learning management system to help coaching centers run smoothly.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Why We Built It</h2>
            <p className="mt-3 text-gray-600">
              Coaching centers need an easy system to manage courses, assignments, and track student progress in one place.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">What You Get</h2>
            <p className="mt-3 text-gray-600">
              Admin panel for managing users, courses, enrollments and students—plus a clear dashboard for learners.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Our Promise</h2>
            <p className="mt-3 text-gray-600">
              Simple UI, reliable performance, and a workflow that keeps coaching centers organized.
            </p>
          </div>
        </div>

        <div className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-10 sm:p-14 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold">Ready to start?</h2>
          <p className="mt-3 opacity-90">Create a free account and manage your learning process today.</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-7 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition"
            >
              Get Started
            </Link>
            <Link
              href="/courses"
              className="px-7 py-3 bg-transparent border border-white/40 text-white font-semibold rounded-lg hover:bg-white/10 transition"
            >
              Explore Courses
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

