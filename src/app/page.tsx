import Dashboard from '@/components/Dashboard';
import GlobalAssistant from '@/components/GlobalAssistant';

export default function Home() {
    return (
        <main className="min-h-screen p-4 relative">
            <Dashboard />
            <GlobalAssistant />
        </main>
    );
}
