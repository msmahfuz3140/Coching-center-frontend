import Link from 'next/link'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="relative mt-0 overflow-hidden">
            {/* Gradient top border */}
            <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

            {/* Main footer */}
            <div className="bg-gray-950 text-gray-300">
                {/* Newsletter Section */}
                <div className="border-b border-gray-800/60">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                            <div className="text-center lg:text-left">
                                <h3 className="text-xl font-bold text-white flex items-center justify-center lg:justify-start gap-2">
                                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Stay Updated
                                </h3>
                                <p className="text-sm text-gray-400 mt-1">Get the latest courses and updates delivered to your inbox.</p>
                            </div>
                            <div className="flex w-full max-w-md">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-l-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                />
                                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-r-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 whitespace-nowrap">
                                    Subscribe
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Links Grid */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                        {/* Brand Column */}
                        <div className="sm:col-span-2 lg:col-span-1">
                            <Link href="/" className="flex items-center space-x-3 group mb-5">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:shadow-blue-600/40 transition-all duration-300 group-hover:scale-105">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <div>
                                    <span className="text-lg font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                        PECC LMS
                                    </span>
                                    <span className="block text-xs text-gray-500">Learn &amp; Grow</span>
                                </div>
                            </Link>
                            <p className="text-sm text-gray-400 leading-relaxed mb-6">
                                A modern learning platform for polytechnic coaching centers — manage courses, track progress, and deliver quality education all in one place.
                            </p>
                            {/* Social Icons */}
                            <div className="flex items-center gap-3">
                                <SocialIcon href="#" label="Facebook">
                                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                                </SocialIcon>
                                <SocialIcon href="#" label="Twitter">
                                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                                </SocialIcon>
                                <SocialIcon href="#" label="YouTube">
                                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43z" />
                                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                                </SocialIcon>
                                <SocialIcon href="#" label="LinkedIn">
                                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
                                    <rect x="2" y="9" width="4" height="12" />
                                    <circle cx="4" cy="4" r="2" />
                                </SocialIcon>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
                                <span className="w-8 h-0.5 bg-gradient-to-r from-blue-500 to-transparent rounded-full" />
                                Quick Links
                            </h4>
                            <ul className="space-y-3">
                                <FooterLink href="/">Home</FooterLink>
                                <FooterLink href="/courses">Courses</FooterLink>
                                <FooterLink href="/features">Features</FooterLink>
                                <FooterLink href="/about">About Us</FooterLink>
                                <FooterLink href="/dashboard">Dashboard</FooterLink>
                            </ul>
                        </div>

                        {/* Support */}
                        <div>
                            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
                                <span className="w-8 h-0.5 bg-gradient-to-r from-indigo-500 to-transparent rounded-full" />
                                Support
                            </h4>
                            <ul className="space-y-3">
                                <FooterLink href="/login">Sign In</FooterLink>
                                <FooterLink href="/register">Create Account</FooterLink>
                                <FooterLink href="/forgot-password">Forgot Password</FooterLink>
                                <FooterLink href="#">Help Center</FooterLink>
                                <FooterLink href="#">Privacy Policy</FooterLink>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
                                <span className="w-8 h-0.5 bg-gradient-to-r from-purple-500 to-transparent rounded-full" />
                                Contact Us
                            </h4>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3 group">
                                    <div className="mt-0.5 w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center shrink-0 group-hover:bg-blue-600/20 transition-colors duration-200">
                                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-0.5">Email</p>
                                        <a href="mailto:support@polytechnic-coaching.com" className="text-sm text-gray-300 hover:text-blue-400 transition-colors duration-200">
                                            support@polytechnic-coaching.com
                                        </a>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3 group">
                                    <div className="mt-0.5 w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center shrink-0 group-hover:bg-green-600/20 transition-colors duration-200">
                                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                                        <a href="tel:+8801XXXXXXXXX" className="text-sm text-gray-300 hover:text-green-400 transition-colors duration-200">
                                            +880 1XXXXXXXXX
                                        </a>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3 group">
                                    <div className="mt-0.5 w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center shrink-0 group-hover:bg-purple-600/20 transition-colors duration-200">
                                        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-0.5">Location</p>
                                        <p className="text-sm text-gray-300">
                                            Dhaka, Bangladesh
                                        </p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800/60">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <p className="text-sm text-gray-500">
                                © {currentYear} <span className="text-gray-400">Polytechnic Education Coaching Center</span>. All rights reserved.
                            </p>
                            <div className="flex items-center gap-6">
                                <Link href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors duration-200">
                                    Terms of Service
                                </Link>
                                <span className="w-1 h-1 bg-gray-700 rounded-full" />
                                <Link href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors duration-200">
                                    Privacy Policy
                                </Link>
                                <span className="w-1 h-1 bg-gray-700 rounded-full" />
                                <Link href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors duration-200">
                                    Cookie Policy
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-blue-600/5 blur-3xl rounded-full pointer-events-none" />
        </footer>
    )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <li>
            <Link
                href={href}
                className="text-sm text-gray-400 hover:text-white transition-all duration-200 flex items-center gap-2 group"
            >
                <span className="w-0 h-0.5 bg-blue-500 rounded-full group-hover:w-3 transition-all duration-300" />
                {children}
            </Link>
        </li>
    )
}

function SocialIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
    return (
        <a
            href={href}
            aria-label={label}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gradient-to-br hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-600/20"
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                {children}
            </svg>
        </a>
    )
}
