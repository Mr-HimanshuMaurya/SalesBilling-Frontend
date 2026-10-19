import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

export const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const sizes = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 scrollbar-hide">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm "
        onClick={onClose}
      />
      <div
        className={`
        relative bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} 
        max-h-[90vh] overflow-hidden
      `}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
};
