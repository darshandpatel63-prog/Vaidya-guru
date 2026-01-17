
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, CourseLevel, Language, Role, Gender, MedicalField } from './types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (language: Language, userData?: Partial<User>) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'vaidyaguru_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY);
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = (language: Language, userData?: Partial<User>) => {
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: userData?.name || "User",
      email: userData?.email || "user@example.com",
      profilePic: userData?.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
      role: userData?.role || Role.STUDENT,
      gender: userData?.gender || Gender.MALE,
      medicalField: userData?.medicalField || MedicalField.BAMS,
      courseLevel: userData?.courseLevel || CourseLevel.UG1,
      preferredLanguage: language,
      isProfileComplete: false,
      agreedToPrivacy: false
    };

    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
