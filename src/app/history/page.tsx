import SessionHistory from "@/components/SessionHistory";

export default function HistoryPage() {
  return (
    <div className="min-h-[calc(100vh-45px)] bg-zinc-950" data-testid="history-page">
      <div className="max-w-4xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-bold text-amber-400 mb-6">Session History</h1>
        <SessionHistory />
      </div>
    </div>
  );
}
