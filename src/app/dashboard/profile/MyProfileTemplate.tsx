'use client'

import React, { useMemo } from 'react'

type Tone = 'blue' | 'green' | 'yellow'

type UserLike = {
    name?: string | null
    email?: string
    role?: string
    createdAt?: string | Date
    image?: string | null
    emailVerified?: boolean
}

export default function MyProfileTemplate({
    user,
    enrolledCount = 0,
    completedCount = 0,
    certificatesCount = 0,
    studyHours = '0h',
    achievementsCount = 0,
}: {
    user: UserLike
    enrolledCount?: number
    completedCount?: number
    certificatesCount?: number
    studyHours?: string
    achievementsCount?: number
}) {
    const initials = useMemo(() => {
        const n = user?.name || 'User'
        return n
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((p) => p[0]?.toUpperCase())
            .join('')
    }, [user?.name])

    const createdAtLabel = useMemo(() => {
        if (!user?.createdAt) return 'N/A'
        const d = typeof user.createdAt === 'string' ? new Date(user.createdAt) : user.createdAt
        return isNaN(d.getTime())
            ? 'N/A'
            : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    }, [user?.createdAt])

    return (
        <>
            <style>{`
        @page { size: A4; margin: 12mm; background-color: #f8fafc; }
        * { box-sizing: border-box; }
        .app-container { display: table; width: 100%; height: 100%; }
        .sidebar { display: table-cell; width: 220px; background-color: #032174; color: #94a3b8; vertical-align: top; padding: 20px 10px; border-radius: 16px 0 0 16px; }
        .main-content { display: table-cell; vertical-align: top; padding: 0 0 0 20px; }
        .logo-area { color: white; font-size: 14pt; font-weight: 700; margin-bottom: 30px; padding-left: 10px; }
        .logo-area span { color: #38bdf8; }
        .nav-item { padding: 10px 14px; border-radius: 8px; margin-bottom: 5px; font-size: 9.5pt; font-weight: 500; color: #cbd5e1; }
        .nav-item.active { background-color: #1d4ed8; color: white; font-weight: 600; }
        .nav-badge { float: right; background-color: #ef4444; color: white; font-size: 7.5pt; padding: 1px 6px; border-radius: 10px; margin-top: 2px; }
        .upgrade-box { background: linear-gradient(135deg, #1e3a8a, #1d4ed8); border: 1px solid #2563eb; border-radius: 12px; padding: 15px 12px; text-align: center; color: white; margin-top: 80px; }
        .upgrade-box p { font-size: 8pt; color: #bfdbfe; margin: 5px 0 12px 0; }
        .upgrade-btn { background-color: #2563eb; color: white; border: none; padding: 6px 15px; border-radius: 6px; font-size: 8.5pt; font-weight: 600; width: 100%; }
        .top-header { display: table; width: 100%; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0; }
        .page-title-area { display: table-cell; vertical-align: middle; }
        .page-title { font-size: 16pt; font-weight: 700; color: #0f172a; margin: 0; }
        .breadcrumb { font-size: 8pt; color: #64748b; margin-top: 3px; }
        .top-profile-area { display: table-cell; text-align: right; vertical-align: middle; }
        .top-avatar { width: 32px; height: 32px; border-radius: 50%; background-color: #cbd5e1; display: inline-block; vertical-align: middle; margin-left: 10px; }
        .profile-hero { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); border-radius: 16px; padding: 25px; color: white; position: relative; margin-bottom: 20px; }
        .hero-avatar { width: 80px; height: 80px; border-radius: 50%; border: 3px solid white; background-color: #e2e8f0; float: left; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #0f172a; }
        .hero-info { margin-left: 100px; padding-top: 5px; }
        .hero-info h2 { margin: 0; font-size: 16pt; font-weight: 700; }
        .hero-info p { margin: 4px 0; font-size: 9pt; color: #bfdbfe; }
        .edit-profile-btn { position: absolute; top: 25px; right: 25px; background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.4); color: white; padding: 6px 14px; border-radius: 8px; font-size: 8.5pt; font-weight: 600; }
        .stats-container { display: table; width: 100%; border-collapse: separate; border-spacing: 12px 0; margin: -40px 0 20px 0; position: relative; z-index: 10; padding: 0 10px; }
        .stat-card { display: table-cell; background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; width: 20%; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); text-align: center; }
        .stat-label { font-size: 8pt; color: #64748b; font-weight: 600; margin-bottom: 5px; }
        .stat-value { font-size: 16pt; font-weight: 700; color: #0f172a; }
        .content-grid { display: table; width: 100%; border-collapse: separate; border-spacing: 15px 0; }
        .left-column { display: table-cell; width: 65%; vertical-align: top; }
        .right-column { display: table-cell; width: 35%; vertical-align: top; }
        .panel { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
        .panel-header { font-size: 10.5pt; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
        .panel-header .view-all { float: right; color: #2563eb; font-size: 8pt; font-weight: 600; }
        .info-grid { display: table; width: 100%; margin-bottom: 5px; }
        .info-row { display: table-row; }
        .info-cell { display: table-cell; padding: 8px 5px; font-size: 9pt; border-bottom: 1px solid #f8fafc; }
        .info-cell.label { color: #64748b; font-weight: 500; width: 35%; }
        .info-cell.value { color: #1e293b; font-weight: 600; }
        .action-link { display: block; padding: 8px 10px; background: #f8fafc; border-radius: 6px; margin-bottom: 6px; font-size: 8.5pt; font-weight: 600; color: #475569; text-decoration: none; border: 1px solid #f1f5f9; }
        .course-item { display: table; width: 100%; margin-bottom: 12px; background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #f1f5f9; }
        .course-thumb { display: table-cell; width: 50px; height: 40px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 6px; vertical-align: middle; text-align: center; color: white; font-size: 12pt; }
        .thumb-purple { background: linear-gradient(135deg, #a855f7, #6b21a8); }
        .thumb-emerald { background: linear-gradient(135deg, #10b981, #047857); }
        .course-details { display: table-cell; vertical-align: middle; padding-left: 12px; }
        .c-title { font-size: 9.5pt; font-weight: 700; color: #0f172a; margin: 0; }
        .progress-bar-container { width: 150px; background: #e2e8f0; height: 6px; border-radius: 3px; margin-top: 5px; display: inline-block; vertical-align: middle; }
        .progress-bar { background: #2563eb; height: 6px; border-radius: 3px; }
        .progress-text { font-size: 7.5pt; color: #64748b; margin-left: 8px; display: inline-block; vertical-align: middle; font-weight: 600; }
        .course-action { display: table-cell; vertical-align: middle; text-align: right; width: 80px; }
        .continue-btn { background: white; border: 1px solid #cbd5e1; color: #2563eb; padding: 4px 10px; border-radius: 6px; font-size: 8pt; font-weight: 600; }
        .activity-item { position: relative; padding-left: 25px; margin-bottom: 12px; }
        .activity-item::before { content: ''; position: absolute; left: 6px; top: 4px; width: 8px; height: 8px; border-radius: 50%; background: #3b82f6; }
        .activity-text { font-size: 9pt; font-weight: 600; color: #334155; margin: 0; }
        .activity-time { font-size: 7.5pt; color: #94a3b8; margin: 2px 0 0 0; }
        .achievement-item { display: table; width: 100%; margin-bottom: 10px; }
        .badge-icon { display: table-cell; width: 30px; font-size: 14pt; vertical-align: middle; }
        .badge-details { display: table-cell; vertical-align: middle; padding-left: 5px; }
        .b-title { font-size: 8.5pt; font-weight: 700; color: #1e293b; margin: 0; }
        .b-desc { font-size: 7.5pt; color: #64748b; margin: 0; }
      `}</style>

            <div className="app-container">
                {/* Sidebar is owned by DashboardLayout in this app. Keeping a compact placeholder to match your HTML theme. */}
                <div className="sidebar" style={{ display: 'none' }} />

                <div className="main-content">
                    <div className="top-header">
                        <div className="page-title-area">
                            <h1 className="page-title">My Profile</h1>
                            <div className="breadcrumb">Dashboard > My Profile</div>
                        </div>
                        <div className="top-profile-area">
                            <span style={{ fontSize: 9, fontWeight: 600, color: '#334155' }}>
                                {user?.name || 'User'} ({user?.role || 'STUDENT'})
                            </span>
                            <div className="top-avatar" />
                        </div>
                    </div>


                    <div className="profile-hero">
                        <div className="hero-avatar">{initials}</div>
                        <div className="hero-info">
                            <h2>{user?.name || 'User'} ✓</h2>
                            <p>📧 {user?.email}</p>
                            <p>📅 Joined: {createdAtLabel}</p>
                        </div>
                        <button className="edit-profile-btn" type="button">✏️ Edit Profile</button>
                    </div>

                    <div className="stats-container">
                        <div className="stat-card"><div className="stat-label">Enrolled Courses</div><div className="stat-value">{enrolledCount}</div></div>
                        <div className="stat-card"><div className="stat-label">Completed Courses</div><div className="stat-value">{completedCount}</div></div>
                        <div className="stat-card"><div className="stat-label">Certificates</div><div className="stat-value">{certificatesCount}</div></div>
                        <div className="stat-card"><div className="stat-label">Study Hours</div><div className="stat-value">{studyHours}</div></div>
                        <div className="stat-card"><div className="stat-label">Achievements</div><div className="stat-value">{achievementsCount}</div></div>
                    </div>

                    <div className="content-grid">
                        <div className="left-column">
                            <div className="panel">
                                <h3 className="panel-header">👤 About Me</h3>
                                <p style={{ fontSize: 9, color: '#475569', lineHeight: 1.5, margin: 0, marginBottom: 15 }}>
                                    A passionate learner and aspiring engineer. I love to learn new things and take on challenges.
                                </p>
                                <div style={{ display: 'table', width: '100%', borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
                                    <div style={{ display: 'table-cell', width: '50%', fontSize: 8.5, color: '#64748b' }}>
                                        📅 <b>Member Since:</b> Jan 15, 2024<br />🆔 <b>Student ID:</b> STU-2024-00125
                                    </div>
                                    <div style={{ display: 'table-cell', width: '50%', fontSize: 8.5, color: '#64748b' }}>
                                        🎂 <b>Date of Birth:</b> May 12, 2004<br />⚦ <b>Gender:</b> Male
                                    </div>
                                </div>
                            </div>

                            <div className="panel">
                                <h3 className="panel-header">📚 My Enrolled Courses <span className="view-all">View All</span></h3>
                                {/* Static placeholders; connect with real data later */}
                                <div className="course-item">
                                    <div className="course-thumb thumb-purple"></div>
                                    <div className="course-details">

                                        <div className="c-title">DUET Admission - Tech</div>
                                        <div className="progress-bar-container"><div className="progress-bar" style={{ width: '75%' }} /></div>
                                        <span className="progress-text">75%</span>
                                    </div>
                                    <div className="course-action"><button className="continue-btn" type="button">Continue</button></div>
                                </div>
                                <div className="course-item">
                                    <div className="course-thumb thumb-emerald">📖</div>
                                    <div className="course-details">
                                        <div className="c-title">SSC 9-10 Complete</div>
                                        <div className="progress-bar-container"><div className="progress-bar" style={{ width: '60%', background: '#10b981' }} /></div>
                                        <span className="progress-text">60%</span>
                                    </div>
                                    <div className="course-action"><button className="continue-btn" type="button">Continue</button></div>
                                </div>
                                <div className="course-item">
                                    <div className="course-thumb">📐</div>
                                    <div className="course-details">
                                        <div className="c-title">Engineering Drawing</div>
                                        <div className="progress-bar-container"><div className="progress-bar" style={{ width: '40%' }} /></div>
                                        <span className="progress-text">40%</span>
                                    </div>
                                    <div className="course-action"><button className="continue-btn" type="button">Continue</button></div>
                                </div>
                            </div>

                            <div className="panel">
                                <h3 className="panel-header">⚡ Recent Activity <span className="view-all">View All</span></h3>
                                <div className="activity-item"><p className="activity-text">Completed video: Introduction to Engineering Drawing</p><p className="activity-time">2 hours ago</p></div>
                                <div className="activity-item"><p className="activity-text">Submitted assignment: Engineering Drawing Assignment 1</p><p className="activity-time">Yesterday</p></div>
                                <div className="activity-item"><p className="activity-text">Enrolled in course: Thermodynamics</p><p className="activity-time">2 days ago</p></div>
                                <div className="activity-item"><p className="activity-text">Completed quiz: Basic Mathematics Quiz</p><p className="activity-time">3 days ago</p></div>
                            </div>
                        </div>

                        <div className="right-column">
                            <div className="panel">
                                <h3 className="panel-header">ℹ️ Account Information</h3>
                                <div className="info-grid">
                                    <div className="info-row"><div className="info-cell label">Full Name</div><div className="info-cell value">{user?.name || '—'}</div></div>
                                    <div className="info-row"><div className="info-cell label">Email</div><div className="info-cell value" style={{ fontSize: 8 }}>{user?.email || '—'}</div></div>
                                    <div className="info-row"><div className="info-cell label">Phone</div><div className="info-cell value">—</div></div>
                                    <div className="info-row"><div className="info-cell label">Address</div><div className="info-cell value">—</div></div>
                                </div>
                                <button style={{ width: '100%', marginTop: 10, background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#1e293b', padding: 6, borderRadius: 6, fontSize: 8.5, fontWeight: 600 }} type="button">
                                    Edit Info
                                </button>
                            </div>

                            <div className="panel">
                                <h3 className="panel-header">⚡ Quick Actions</h3>
                                <span className="action-link">📥 Download Certificate</span>
                                <span className="action-link">📊 View Study Report</span>
                                <span className="action-link">⚙️ Manage Enrollments</span>
                                <span className="action-link">🔒 Change Password</span>
                                <span className="action-link">🛡️ Privacy Settings</span>
                            </div>

                            <div className="panel">
                                <h3 className="panel-header">🏆 Achievements <span className="view-all">View All</span></h3>
                                <div className="achievement-item"><div className="badge-icon">🥇</div><div className="badge-details"><p className="b-title">First Course Completed</p><p className="b-desc">Completed your first course</p></div></div>
                                <div className="achievement-item"><div className="badge-icon">🔮</div><div className="badge-details"><p className="b-title">Quiz Master</p><p className="b-desc">Score 100% in 5 quizzes</p></div></div>
                                <div className="achievement-item"><div className="badge-icon">🟢</div><div className="badge-details"><p className="b-title">Consistent Learner</p><p className="b-desc">Study 7 days in a row</p></div></div>
                            </div>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', padding: 15, marginTop: 20, fontSize: 8, color: '#94a3b8', borderTop: '1px solid #e2e8f0' }}>
                        © 2026 EduHub Coaching Center. All rights reserved.
                    </div>
                </div>
            </div >
        </>
    )
}

