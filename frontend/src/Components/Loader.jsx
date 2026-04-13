function Loader() {
    return (
        <div className="flex flex-col items-center justify-center space-y-3 py-10">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 font-medium animate-pulse">Loading data...</p>
        </div>
    );
}

export default Loader;