import React, { ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, children }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-[rgba(0,0,0,0.3)] backdrop-blur-sm">
      <div
        className={`p-6 rounded-lg shadow-md max-w-sm w-full bg-white dark:bg-black border border-black/[0.08] dark:border-white/[0.12] text-gray-900 dark:text-gray-100`}
        onClick={e => e.stopPropagation()}
      >
        <div className="text-sm/6 font-[family-name:var(--font-geist-mono)]">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;