interface ProcessingModalProps {
  isOpen: boolean;
  progress: number;
  status: string;
}

export default function ProcessingModal({ isOpen, progress, status }: ProcessingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-secondary rounded-3xl p-8 mx-6 text-center max-w-sm animate-fade-in">
        <div className="loading-spinner mx-auto mb-4"></div>
        <h3 className="text-xl font-bold mb-2">Processing Video...</h3>
        <p className="text-gray-400 mb-4">This may take a few moments</p>
        <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
          <div 
            className="bg-accent h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-400">{status}</p>
      </div>
    </div>
  );
}
