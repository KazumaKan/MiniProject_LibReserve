import { useState } from 'react';
import { useAuth } from '../../hook/useAuth.js';
import { apiUtils } from '../../services/api';
import { Eye, EyeOff } from 'lucide-react';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false); // toggle
  const [apiError, setApiError] = useState(null); // ✅ สำหรับ error จาก API ไม่พร้อม

  const handleSubmit = async () => {
    if (!email || !password) {
      alert('กรุณากรอก Email และ Password');
      return;
    }

    try {
      console.log('🔍 Checking API connection...');
      const isConnected = await apiUtils.checkConnection(); // ✅ ตรวจสอบก่อน login

      if (!isConnected) {
        setApiError('ไม่สามารถเชื่อมต่อกับ API ได้ กรุณาลองใหม่ภายหลัง');
        return;
      }

      setApiError(null); 

      console.log('🔐 Submitting login form');
      await login(email, password);
      console.log("✅ Login finished, user should update in context");
    } catch (err) {
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-6">
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email:
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          placeholder="example@email.com"
        />
      </div>

      {/* Password */}
      <div className="relative">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Password:
        </label>

        <input
          type={showPassword ? 'text' : 'password'}
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 pr-10"
          placeholder="••••••••"
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[42px] text-gray-500 hover:text-gray-700"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>


      {/* ✅ API connection error */}
      {apiError && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded">
          <p className="font-medium">ไม่สามารถเชื่อมต่อ API</p>
          <p className="text-sm">{apiError}</p>
        </div>
      )}

      {/* ⚠️ Login error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Login Failed</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Login button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 rounded transition-colors"
      >
        {loading ? '🔄 กำลังเข้าสู่ระบบ...' : 'Sign in'}
      </button>
    </div>
  );
};
