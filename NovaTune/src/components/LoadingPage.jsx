export default function LoadingPage({ text }) {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-neutral-900 text-white">
            <div className="w-12 py-4 h-12 border-4 border-neutral-300 border-t-cyan-400 rounded-full animate-spin"></div>
            <p className="mt-4 text-lg">{text}</p>
        </div>
    );
}
