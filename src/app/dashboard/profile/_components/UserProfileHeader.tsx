'use client'

import React from 'react'

export default function UserProfileHeader({
    name,
    email,
    image,
}: {
    name?: string | null
    email?: string
    image?: string | null
}) {
    const initials = (name || 'User')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join('')

    return (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 sm:px-10 py-6">
            <div className="flex items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center overflow-hidden border border-white/20">
                        {image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={image} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-2xl sm:text-3xl font-bold text-white">{initials}</span>
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-white">{name || 'User'}</h2>
                        <p className="text-blue-100 break-all text-sm sm:text-base">{email}</p>
                    </div>
                </div>

                {/* Quick actions (UI only) */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-lg bg-white/15 text-white px-3 py-2 text-xs sm:text-sm font-semibold hover:bg-white/20 transition"
                        onClick={() => {
                            // placeholder for future edit flow
                        }}
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                        </svg>
                        Edit
                    </button>
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-lg bg-white/15 text-white px-3 py-2 text-xs sm:text-sm font-semibold hover:bg-white/20 transition"
                        onClick={() => {
                            // placeholder for future settings flow
                        }}
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-1.41 3.41h-.2a1.65 1.65 0 0 0-1.64 1.32 2 2 0 0 1-3.92 0 1.65 1.65 0 0 0-1.64-1.32h-.2a2 2 0 0 1-1.41-3.41l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 0 1 5.62 9.71h.2a1.65 1.65 0 0 0 1.64-1.32 2 2 0 0 1 3.92 0 1.65 1.65 0 0 0 1.64 1.32h.2a2 2 0 0 1 1.41 3.41l-.06.06c-.2.2-.31.45-.33.74z" />
                        </svg>
                        Settings
                    </button>
                </div>
            </div>
        </div>
    )
}


