import DashboardLayout from '@/components/layout/DashboardLayout'

const highlights = [
  { label: 'Enrolled Courses', value: '3', accent: 'from-blue-500 to-cyan-500' },
  { label: 'Assignments Due', value: '2', accent: 'from-amber-500 to-orange-500' },
  { label: 'Completion Rate', value: '78%', accent: 'from-emerald-500 to-green-500' },
]

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-xl">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-100">Student Portal</p>
          <h1 className="mt-3 text-3xl font-bold">Welcome back! Your learning dashboard is ready.</h1>
          <p className="mt-3 max-w-2xl text-sm text-blue-100">Track your classes, assignments, and progress in one place.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {highlights.map((item) => (
            <div key={item.label} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className={`h-2 w-20 rounded-full bg-gradient-to-r ${item.accent}`} />
              <p className="mt-4 text-3xl font-bold text-gray-900">{item.value}</p>
              <p className="mt-1 text-sm text-gray-600">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">This week&apos;s focus</h2>
                <p className="mt-1 text-sm text-gray-600">Keep up the momentum with your latest topics.</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">On track</span>
            </div>
            <div className="mt-6 space-y-4">
              {['Mathematics revision', 'Physics practice set', 'Live doubt session'].map((task) => (
                <div key={task} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                  <span className="font-medium text-gray-700">{task}</span>
                  <span className="text-sm text-gray-500">Ready</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">Quick actions</h2>
            <div className="mt-4 space-y-3">
              <a href="/dashboard/courses" className="block rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:border-blue-300 hover:text-blue-600">View my courses</a>
              <a href="/dashboard/assignments" className="block rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:border-blue-300 hover:text-blue-600">Check assignments</a>
              <a href="/dashboard/profile" className="block rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:border-blue-300 hover:text-blue-600">Update profile</a>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
