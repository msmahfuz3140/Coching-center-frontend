'use client'

import Link from 'next/link'

const features = [
    {
        title: 'Admin Panel',
        desc: 'Manage users, roles, enrollments, and course content from one place.',
        color: 'from-blue-600 to-indigo-600',
    },
    {
        title: 'Course Management',
        desc: 'Create courses, organize syllabus and videos, and publish when ready.',
        color: 'from-indigo-600 to-purple-600',
    },
    {
        title: 'Assignment Tracking',
        desc: 'Students submit, admins review, and progress stays visible.',
        color: 'from-purple-600 to-pink-600',
    },
    {
        title: 'Progress Analytics',
        desc: 'Track student activity and performance with clear dashboard views.',
        color: 'from-emerald-600 to-teal-600',
    },
]

export default function FeaturesPage() {
    return (
        <div className="flex-1 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900">Features</h1>
                    <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
                        Polytechnic Education Coching center’s LMS includes all the tools coaching centers need to run efficiently.
                    </p>
                </div>

                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {features.map((f) => (
                        <div key={f.title} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                            <div
                                className={`h-12 w-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center`}
                            >
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h2 className="mt-5 text-xl font-bold text-gray-900">{f.title}</h2>
                            <p className="mt-3 text-gray-600">{f.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-12 bg-white rounded-3xl border border-gray-100 shadow-sm p-8 sm:p-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Start building your learning workflow</h2>
                            <p className="mt-3 text-gray-600">
                                Create a free account, manage courses and track student progress with a clean admin experience.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 md:justify-end">
                            <Link
                                href="/register"
                                className="px-7 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:opacity-95 transition"
                            >
                                Create Free Account
                            </Link>
                            <Link
                                href="/login"
                                className="px-7 py-3 bg-white border border-gray-200 text-gray-900 font-semibold rounded-lg hover:border-blue-600 hover:text-blue-600 transition"
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

