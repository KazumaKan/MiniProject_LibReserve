import { Sidebar } from './Sidebar';

export const MainLayout = ({ children, currentPage, onNavigate }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      <div className="flex-1 lg:ml-0">
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};