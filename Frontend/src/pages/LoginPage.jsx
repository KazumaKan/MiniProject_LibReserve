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
      <div className="hidden lg:flex lg:w-3/5 items-center justify-center relative overflow-hidden">
        <img
          src="src/assets/Slice 1.jpg"
          alt="Decorative background"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

