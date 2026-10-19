import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export const Layout = ({ pageTitle, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          pageTitle={pageTitle}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};
