'use client'

import React from 'react'

export default function CourseStatCard({
    title,
    value,
    subtitle,
    tone,
}: {
    title: string
    value: string
    subtitle: string
    tone: 'blue' | 'green' | 'yellow'
}) {
    const cls =
        tone === 'green'
            ? 'bg-green-50 border-green-200 text-green-900'
            : tone === 'yellow'
                ? 'bg-yellow-50 border-yellow-200 text-yellow-900'
                : 'bg-blue-50 border-blue-200 text-blue-900'

    const pill =
        tone === 'green'
            ? 'text-green-700'
            : tone === 'yellow'
                ? 'text-yellow-700'
                : 'text-blue-700'


    return (
        <div className={`rounded-xl border ${cls} p-4`}>
            <p className="text-sm text-gray-600">{title}</p>
            <p className={`text-2xl font-bold ${pill}`}>{value}</p>
            <p className="text-xs mt-1 text-gray-500">{subtitle}</p>
        </div>
    )
}

