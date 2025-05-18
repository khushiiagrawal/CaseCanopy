import { useEffect } from "react";
import { X, CheckCircle, AlertTriangle, Info } from "lucide-react";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: {
      bg: "bg-black border-l-4 border-legal-gold",
      icon: <CheckCircle className="h-5 w-5 text-legal-gold" />,
    },
    error: {
      bg: "bg-black border-l-4 border-red-500",
      icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
    },
    info: {
      bg: "bg-black border-l-4 border-blue-400",
      icon: <Info className="h-5 w-5 text-blue-400" />,
    },
  }[type];

  return (
    <div
      className={`fixed bottom-4 right-4 ${config.bg} text-white px-6 py-3 rounded-lg shadow-legal backdrop-blur-sm flex items-center space-x-3 z-50`}
    >
      {config.icon}
      <span className="text-gray-100">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-gray-400 hover:text-white transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
