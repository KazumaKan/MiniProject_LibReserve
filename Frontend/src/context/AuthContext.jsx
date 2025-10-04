import { createContext, useState } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (username, password) => {
    // Mock login - ในระบบจริงต้อง call API
    setUser({
      username: username,
      fullName: 'พยุกรอบ',
      branch: 'โพรคิตซิงจักยา',
      status: 'ได้พบคำวิจัย',
      studentId: 'xxxxxxxx',
      libraryCard: 'xxxxxxxx',
      nationalId: 'xxxxxxxx'
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};