import FileConverter from '@/components/FileConverter';

export default function Home() {
  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/30 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Navbar / Header area */}
      <div className="absolute top-0 w-full p-6 flex justify-between items-center z-10">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">ConvertioLite</span>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <FileConverter />
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-6 w-full text-center z-10">
        <p className="text-sm text-gray-500">
          Client-side conversions only. Your files never leave your device.
        </p>
      </div>
    </main>
  );
}
