import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

function MainLayout() {
  return (
    <div className="flex bg-slate-950 min-h-screen">
      {/* Sidebar - Fixed Width */}
      <Sidebar />

      {/* Main Content - Pushed by Sidebar */}
      <main className="flex-1 ml-64 min-h-screen relative overflow-x-hidden">
        {/* Background Decorative Blobs */}
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="fixed bottom-0 left-64 w-[400px] h-[400px] bg-cyan-600/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

        {/* Content Container */}
        <div className="p-8 pb-12 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default MainLayout;
