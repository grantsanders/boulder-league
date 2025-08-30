"use client"

import { createPortal } from 'react-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import Image from 'next/image'

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  alt: string
  title?: string
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, imageUrl, alt, title }) => {
  if (!isOpen) return null

  return createPortal(
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 bg-background/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <CardContent className="p-0 relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-2 right-2 z-10 bg-background/80 hover:bg-background/90"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="relative">
            <Image
              src={imageUrl}
              alt={alt}
              width={800}
              height={600}
              className="w-full h-auto object-contain max-h-[80vh]"
              priority
            />
          </div>
          {title && (
            <div className="p-4 border-t bg-card">
              <h3 className="text-lg font-semibold text-foreground text-center">{title}</h3>
            </div>
          )}
        </CardContent>
      </Card>
    </div>,
    document.body
  )
}

export default ImageModal
