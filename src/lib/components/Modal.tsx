import { createPortal } from 'react-dom';
import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <Card className="max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
        <CardContent className="pt-6">
          {children}
        </CardContent>
      </Card>
    </div>,
    document.body
  );
};

export default Modal;