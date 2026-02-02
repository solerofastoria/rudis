import { Card } from "../components/ui/Card/Card";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1e1f22] to-[#23272a] p-4">
      <Card className="w-full max-w-md p-8 rounded-2xl border border-[#202225]">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-[#5865f2] rounded-full flex items-center justify-center mb-2">
            <span className="text-white text-2xl font-bold">R</span>
          </div>
          <h1 className="text-2xl font-bold text-white">RUdis</h1>
          <p className="text-gray-400 text-sm mt-1">Российский аналог Discord</p>
        </div>
        {children}
      </Card>
    </div>
  );
}
