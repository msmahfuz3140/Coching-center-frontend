'use client'

import { useState, useRef, useEffect } from 'react'

interface VideoPlayerProps {
  video: {
    id: string
    title: string
    youtubeUrl: string
    duration?: number | null
    isFree: boolean
  }
  hasAccess: boolean
}

export default function VideoPlayer({ video, hasAccess }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showLocked] = useState(!hasAccess && !video.isFree)
  const [showVideo, setShowVideo] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const videoId = video.youtubeUrl.match(/(?:v=|youtu\.be\/|\/embed\/)([a-zA-Z0-9_-]{11})/)?.[1] || ''
  const src = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&fs=0&disablekb=1&cc_load_policy=0&playsinline=1`

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const prevent = (e: Event) => { e.preventDefault(); return false }
    el.addEventListener('contextmenu', prevent)
    const kd = (e: KeyboardEvent) => {
      if (e.key === 'F12' || (e.ctrlKey && (e.key === 's' || e.key === 'c' || e.key === 'u')) || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')))
        e.preventDefault()
    }
    document.addEventListener('keydown', kd)
    const fsChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', fsChange)
    return () => {
      el.removeEventListener('contextmenu', prevent)
      document.removeEventListener('keydown', kd)
      document.removeEventListener('fullscreenchange', fsChange)
    }
  }, [])

  const toggleFS = async () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) await containerRef.current.requestFullscreen()
    else await document.exitFullscreen()
  }

  return (
    <div ref={containerRef} className="relative bg-black rounded-xl overflow-hidden select-none" style={{ WebkitUserSelect: 'none' }}>
      <div className="aspect-video relative bg-gray-950">
        {showLocked ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-900 px-4">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="text-lg font-semibold text-white mb-2">Content Locked</h3>
              <p className="text-gray-400 text-sm">Enroll in this course to access</p>
            </div>
          </div>
        ) : (
          <>
            {!showVideo && (
              <img
                src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-60 z-0 pointer-events-none"
                draggable={false}
              />
            )}

            <iframe
              className={`w-full h-full absolute inset-0 transition-opacity duration-500 ${showVideo ? 'opacity-100 z-[1]' : 'opacity-0 pointer-events-none z-0'}`}
              src={showVideo ? src : `https://www.youtube.com/embed/${videoId}?controls=1&modestbranding=1&rel=0&showinfo=0`}
              title={video.title}
              frameBorder="0"
              allow="autoplay; encrypted-media"
            />

            {/* Only show overlay BEFORE play starts */}
            {!showVideo && (
              <div
                className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 hover:bg-black/20 transition-colors cursor-pointer"
                onClick={() => setShowVideo(true)}
                onDoubleClick={toggleFS}
              >
                <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95">
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </div>
              </div>
            )}

            {/* After play - only block YouTube top-right elements (logo, share, etc) */}
            {showVideo && (
              <>
                {/* Block top-left YouTube logo */}
                <div className="absolute top-0 left-0 w-[200px] h-[60px] z-10 pointer-events-none bg-gradient-to-r from-black/60 to-transparent" />
                {/* Block top-right YouTube buttons (share, etc) */}
                <div className="absolute top-0 right-0 w-[100px] h-[60px] z-10 pointer-events-none bg-gradient-to-l from-black/60 to-transparent" />
                {/* Block bottom-right "Watch on YouTube" */}
                <div className="absolute bottom-0 right-0 w-[180px] h-[50px] z-10 pointer-events-none bg-gradient-to-l from-black/60 to-transparent" />
                {/* Block bottom-left YouTube related/logo */}
                <div className="absolute bottom-0 left-0 w-[120px] h-[50px] z-10 pointer-events-none bg-gradient-to-r from-black/60 to-transparent" />
              </>
            )}

            {/* Anti-screen-capture */}
            <div className="absolute inset-0 pointer-events-none z-[3]" aria-hidden="true">
              <div className="w-full h-full" style={{ background: 'repeating-conic-gradient(#000 0.0001%, transparent 0.0002%)', mixBlendMode: 'difference', opacity: 0.999 }} />
            </div>
          </>
        )}
      </div>

      {/* Bottom bar */}
      {!showLocked && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-900/98">
          <span className="text-sm text-gray-300 truncate">{video.title}</span>
          <div className="flex items-center gap-2">
            {video.isFree && <span className="text-[10px] text-green-400 bg-green-500/20 px-1.5 py-0.5 rounded font-medium">Free</span>}
            <button onClick={toggleFS} className="p-1.5 text-gray-400 hover:text-white transition-colors flex-shrink-0 ml-2" title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
              {isFullscreen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}