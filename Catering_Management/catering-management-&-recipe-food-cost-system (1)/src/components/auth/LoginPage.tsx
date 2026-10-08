import React, { useState } from 'react';
import { ChefHat, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, KeyRound } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface LoginPageProps {
  onLoginSuccess: (user: { email: string; name: string }) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Daftar akun demo bawaan untuk pengujian vokasi sekolah
  const DEMO_USERS: Record<string, { pass: string; email: string; name: string }> = {
    admin: {
      pass: 'Admin123!',
      email: 'admin@vokasi.sch.id',
      name: 'Admin Vokasi Tata Boga',
    },
    chef: {
      pass: 'Chef123!',
      email: 'chef.rudi@vokasi.sch.id',
      name: 'Chef Rudi Hartono (Kepala Dapur)',
    },
    staff: {
      pass: 'Staff123!',
      email: 'siti.staff@vokasi.sch.id',
      name: 'Siti Nurhaliza (Staff Kasir & Logistik)',
    },
    manager: {
      pass: 'Manager123!',
      email: 'manager.endang@vokasi.sch.id',
      name: 'Dra. Endang Wahyuni (Manajer Katering)',
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const cleanUser = usernameOrEmail.trim().toLowerCase();
    const matchedKey = Object.keys(DEMO_USERS).find(
      (k) => cleanUser === k || cleanUser === DEMO_USERS[k].email.toLowerCase()
    );

    if (matchedKey && password === DEMO_USERS[matchedKey].pass) {
      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess({
          email: DEMO_USERS[matchedKey].email,
          name: DEMO_USERS[matchedKey].name,
        });
      }, 350);
      return;
    }

    // Jika Supabase terhubung, gunakan autentikasi Supabase
    if (isSupabaseConfigured) {
      try {
        const emailToUse = usernameOrEmail.includes('@')
          ? usernameOrEmail
          : `${usernameOrEmail}@vokasi.sch.id`;

        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailToUse,
          password: password,
        });

        if (error) {
          setErrorMsg(error.message);
        } else if (data.user) {
          onLoginSuccess({
            email: data.user.email || 'user@vokasi.sch.id',
            name: data.user.user_metadata?.full_name || 'Staff Catering',
          });
          return;
        }
      } catch (err: any) {
        setErrorMsg('Gagal melakukan autentikasi ke server.');
      }
    } else {
      setErrorMsg('Kredensial tidak cocok. Silakan gunakan salah satu akun pengujian yang tersedia.');
    }
    setIsLoading(false);
  };

  const handleQuickDemoFill = (role: 'admin' | 'chef' | 'staff' | 'manager') => {
    const demo = DEMO_USERS[role];
    if (demo) {
      setUsernameOrEmail(role);
      setPassword(demo.pass);
      setErrorMsg(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 selection:bg-amber-500 selection:text-white">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-xl shadow-amber-500/20">
            <ChefHat className="h-9 w-9" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            CATERING MANAGEMENT
          </h1>
          <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
            & Recipe Food Cost System
          </p>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Proyek Vokasi Sekolah - Sistem Manajemen Katering, Standardisasi SOP Resep, dan HPP
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-7 shadow-2xl text-slate-200 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-slate-400">Masuk ke Dashboard</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
              Supabase Auth Ready
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Username / Email Akun
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="admin atau email@sekolah.sch.id"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 active:scale-98 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Memverifikasi...' : 'Masuk Aplikasi'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Demo Buttons for Examiners & Students */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-semibold">Pilih Akun Pengujian:</span>
              <span className="text-[10px] text-amber-400/80">Klik untuk isi otomatis</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemoFill('admin')}
                className="py-1.5 px-2.5 bg-slate-800/90 hover:bg-slate-700 text-amber-300 rounded-xl font-medium transition border border-slate-700/60 text-left flex items-center justify-between cursor-pointer"
              >
                <span>👑 Admin</span>
                <span className="text-[10px] text-slate-400 font-mono">admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoFill('chef')}
                className="py-1.5 px-2.5 bg-slate-800/90 hover:bg-slate-700 text-amber-300 rounded-xl font-medium transition border border-slate-700/60 text-left flex items-center justify-between cursor-pointer"
              >
                <span>🍳 Head Chef</span>
                <span className="text-[10px] text-slate-400 font-mono">chef</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoFill('staff')}
                className="py-1.5 px-2.5 bg-slate-800/90 hover:bg-slate-700 text-amber-300 rounded-xl font-medium transition border border-slate-700/60 text-left flex items-center justify-between cursor-pointer"
              >
                <span>📦 Staff Kasir</span>
                <span className="text-[10px] text-slate-400 font-mono">staff</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoFill('manager')}
                className="py-1.5 px-2.5 bg-slate-800/90 hover:bg-slate-700 text-amber-300 rounded-xl font-medium transition border border-slate-700/60 text-left flex items-center justify-between cursor-pointer"
              >
                <span>📊 Manajer</span>
                <span className="text-[10px] text-slate-400 font-mono">manager</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 text-center pt-1">
              Akun pengujian resmi untuk demonstrasi proyek vokasi guru.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
