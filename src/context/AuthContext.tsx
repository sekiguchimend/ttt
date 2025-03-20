import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

// Define user roles
export type UserRole = 'admin' | 'employee';

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar?: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Context interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  login: async () => {},
  logout: async () => {},
  loading: true
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    let mounted = true;

    // セッションの確認
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        if (session?.user) {
          fetchUserData(session.user.id, session.user.email);
        } else {
          setLoading(false);
        }
      }
    });

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        if (session?.user) {
          fetchUserData(session.user.id, session.user.email);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ユーザーデータの取得 - emailパラメータを追加
  const fetchUserData = async (userId: string, userEmail?: string | null) => {
    try {
      // まずユーザーデータを取得
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      // 管理者かどうかを確認するための追加クエリ
      const { data: adminCheck } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', userId)
        .single();

      // 管理者フラグを決定
      const isAdminUser = !!adminCheck || (userEmail === 'admin@example.com');

      if (existingUser) {
        // ユーザーデータが存在する場合は設定
        setUser({
          id: existingUser.id,
          name: existingUser.name || existingUser.full_name || userEmail || '',
          email: existingUser.email,
          role: isAdminUser ? 'admin' : 'employee',  // ここで管理者判定を適用
          department: existingUser.department,
          avatar: existingUser.avatar,
          full_name: existingUser.full_name,
          avatar_url: existingUser.avatar_url,
          created_at: existingUser.created_at,
          updated_at: existingUser.updated_at,
        });
      } else {
        // ユーザーデータが存在しない場合は新規作成
        const userEmail = (await supabase.auth.getUser()).data.user?.email || '';
        console.log('Creating new user with email:', userEmail);
        
        // email === 'admin@example.com'の場合は管理者として扱う
        const isNewUserAdmin = userEmail === 'admin@example.com';
        
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: userId,
              email: userEmail,
              role: isNewUserAdmin ? 'admin' : 'employee',
              name: userEmail.split('@')[0] // 仮の名前としてメールアドレスの@前を使用
            }
          ])
          .select()
          .single();

        if (insertError) {
          console.error('Error inserting user:', insertError);
          throw insertError;
        }

        console.log('New user created:', newUser);

        if (newUser) {
          // 管理者の場合、admin_usersテーブルにも追加
          if (isNewUserAdmin) {
            const { error: adminInsertError } = await supabase
              .from('admin_users')
              .insert([{ user_id: userId }]);
            
            if (adminInsertError) {
              console.error('Error inserting admin user:', adminInsertError);
            }
          }

          setUser({
            id: newUser.id,
            name: newUser.name || newUser.full_name || userEmail.split('@')[0],
            email: newUser.email,
            role: isNewUserAdmin ? 'admin' : 'employee',
            department: newUser.department,
            avatar: newUser.avatar,
            full_name: newUser.full_name,
            avatar_url: newUser.avatar_url,
            created_at: newUser.created_at,
            updated_at: newUser.updated_at,
          });
          console.log('User state updated:', isNewUserAdmin ? 'admin' : 'employee');
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('Attempting login with email:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        console.log('Login successful, fetching user data');
        await fetchUserData(data.user.id, data.user.email);
      }
    } catch (error) {
      console.error('Login error:', error);
      setUser(null);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Compute additional states
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  console.log('Current user role:', user?.role, 'isAdmin:', isAdmin);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isAdmin,
      login,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => useContext(AuthContext);