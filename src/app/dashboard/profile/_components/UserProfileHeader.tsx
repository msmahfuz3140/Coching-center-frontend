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
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                    {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-2xl font-bold text-white">{initials}</span>
                    )}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">{name || 'User'}</h2>
                    <p className="text-blue-100 break-all">{email}</p>
                </div>
            </div>
        </div>
    )
}

