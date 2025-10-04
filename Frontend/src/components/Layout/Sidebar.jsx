import { useState } from 'react';
import { Calendar, CheckSquare, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../hook/useAuth';

export const Sidebar = ({ currentPage, onNavigate }) => {
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'book-room', label: 'จองห้องสมุด', icon: Calendar },
    { id: 'booking-list', label: 'รายการจอง', icon: CheckSquare },
    { id: 'logout', label: 'ออกจากระบบ', icon: LogOut }
  ];

  const handleMenuClick = (id) => {
    if (id === 'logout') {
      logout();
    } else {
      onNavigate(id);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-80 bg-gray-800 text-white flex flex-col
        transform transition-transform duration-300
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-8 border-b border-gray-700">
          <h1 className="text-5xl font-bold mb-2">SPU</h1>
          <div className="flex items-center gap-2">
            <span className="text-pink-500 font-semibold text-xs uppercase">SRIPATUM</span>
            <div className="h-3 w-20 bg-pink-500"></div>
          </div>
          <p className="text-pink-500 font-semibold text-xs uppercase">UNIVERSITY</p>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`
                w-full px-8 py-4 flex items-center gap-4 text-left transition-colors
                ${currentPage === item.id 
                  ? 'bg-gray-700 text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'}
              `}
            >
              <item.icon size={20} />
              <span className="text-lg">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 bg-whie bg-opacity-50 z-30"
        />
      )}
    </>
  );
};