import { LoginForm } from '../components/Auth/LoginForm';

export const LoginPage = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Login Form */}
      <div className="w-full lg:w-2/5 bg-white flex items-center justify-center p-8 ">
        <div className="w-full max-w-md ">
          {/* Logo */}
          <div className="mb-12">
            <h1 className="text-6xl font-bold text-gray-900 mb-1">SPU</h1>
            <div className="flex items-center gap-2">
              <span className="text-pink-600 font-semibold text-sm uppercase tracking-wide">
                SRIPATUM
              </span>
              <div className="h-3 w-10 bg-pink-600"></div>
            </div>
            <p className="text-pink-600 font-semibold text-sm uppercase tracking-wide">
              UNIVERSITY
            </p>
          </div>

          {/* Login Form */}
          <LoginForm />

          {/* Footer Text */}
          <div className="mt-8">
            <p className="text-sm text-gray-600 font-semibold">Reservation System</p>
            <p className="text-sm text-gray-600">ยินดีต้อนรับเข้าสู่ระบบจองห้องใช้ห้องสมุด</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Decorative Background */}
      <div className="hidden lg:flex lg:w-3/5 bg-gradient-to-br from-pink-100 to-white items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 800 600" className="w-full h-full">
            <path 
              d="M 100 50 Q 150 150, 120 300 Q 100 450, 150 550" 
              fill="none" 
              stroke="#FFC0E0" 
              strokeWidth="60" 
              strokeLinecap="round" 
              opacity="0.6" 
            />
            <path 
              d="M 300 100 Q 350 200, 320 350 Q 300 500, 350 580" 
              fill="none" 
              stroke="#FFB0D8" 
              strokeWidth="70" 
              strokeLinecap="round" 
              opacity="0.7" 
            />
            <path 
              d="M 500 80 L 550 200 Q 580 300, 520 400 L 580 520" 
              fill="none" 
              stroke="#FFA0D0" 
              strokeWidth="80" 
              strokeLinecap="round" 
              opacity="0.8" 
            />
          </svg>
        </div>
      </div>
    </div>
  );
};


/* 
Right Panel - Decorative Background 
    <div className="hidden lg:flex lg:w-3/5 bg-white items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
            <img
            src="/path/to/your/background-image.png"
            alt="Decorative background"
            className="w-full h-full object-cover opacity-90"
            />
        </div>
    </div>
*/