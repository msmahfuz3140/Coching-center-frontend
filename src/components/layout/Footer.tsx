import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="mt-16 border-t border-gray-100 bg-white/80 backdrop-blur">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Polytechnic Education Coching center</h3>
                        <p className="text-sm text-gray-600 mt-2">
                            A modern learning platform for coaching centers—manage courses, assignments, and student progress in one place.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-gray-900">Quick Links</h4>
                        <ul className="mt-3 space-y-2">
                            <li>
                                <Link className="text-sm text-gray-600 hover:text-blue-600" href="/courses">
                                    Courses
                                </Link>
                            </li>
                            <li>
                                <Link className="text-sm text-gray-600 hover:text-blue-600" href="/dashboard">
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link className="text-sm text-gray-600 hover:text-blue-600" href="/admin">
                                    Admin Panel
                                </Link>
                            </li>
                            <li>
                                <Link className="text-sm text-gray-600 hover:text-blue-600" href="/register">
                                    Register
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-gray-900">Contact</h4>
                        <p className="text-sm text-gray-600 mt-3">
                            Email: <span className="font-medium text-gray-800">support@polytechnic-coaching.com</span>
                        </p>
                        <p className="text-sm text-gray-600">
                            Phone: <span className="font-medium text-gray-800">+880 1XXXXXXXXX</span>
                        </p>
                    </div>
                </div>

                <div className="mt-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t border-gray-100 pt-6">
                    <p className="text-sm text-gray-500">© {new Date().getFullYear()} Polytechnic Education Coching center. All rights reserved.</p>
                    <div className="flex items-center gap-3">
                        <Link href="/login" className="text-sm text-blue-600 hover:text-blue-700">Sign In</Link>
                        <span className="text-gray-300">•</span>
                        <Link href="/register" className="text-sm text-blue-600 hover:text-blue-700">Get Started</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}

