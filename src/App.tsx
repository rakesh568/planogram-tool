function App() {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Product Catalog</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h1 className="text-xl font-bold text-gray-900">Planogram Tool</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Select a rack template to begin</p>
        </div>
      </div>
    </div>
  );
}

export default App
