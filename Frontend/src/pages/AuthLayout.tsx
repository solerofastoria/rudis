export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1e1f22] to-[#23272a]">
      <div className="w-full max-w-md bg-[#2f3136] p-8 rounded-2xl shadow-2xl border border-[#202225]">
        <div className="flex flex-col items-center mb-6">
          <img src="/logo.svg" alt="Sputnik Voice" className="w-16 h-16 mb-2" />
          <h1 className="text-2xl font-bold">RUdis</h1>
          <p className="text-gray-400 text-sm mt-1">Российский аналог Discord</p>
        </div>
        {children}
      </div>
    </div>
  );
}
