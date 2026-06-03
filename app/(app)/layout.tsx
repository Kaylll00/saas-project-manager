import AppSidebar from "@/components/AppSidebar"
import Toaster from "@/components/Toaster"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <AppSidebar />
      <Toaster />

      {/* Main content area */}
      <div className="lg:pl-64">
        <main className="min-h-screen py-16 lg:py-0">
          <div className="px-4 pt-4 sm:px-6 lg:px-8 lg:pt-8 pb-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
