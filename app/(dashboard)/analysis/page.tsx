import { ChatInterface } from "@/components/ai/chat-interface";

export const metadata = {
  title: "Analysis — GeoTrack",
};

export default function AnalysisPage() {
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Intelligence Analysis</h1>
        <p className="text-sm text-text-muted mt-1">
          Ask questions about current geopolitical events. Answers are grounded in live news data.
        </p>
      </div>
      <ChatInterface />
    </div>
  );
}
