import React, { useEffect } from 'react';
import { X, Download, ExternalLink, FileText } from 'lucide-react';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  blobUrl: string | null;
  filename?: string;
  onDownload?: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  blobUrl,
  filename = 'document.pdf',
  onDownload,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !blobUrl) return null;

  const handleOpenNewWindow = () => {
    window.open(blobUrl, '_blank');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="document-preview-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        className="w-full max-w-4xl bg-[#FFFCF7] dark:bg-slate-900 rounded-2xl border border-[#E5DED2] dark:border-slate-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E5DED2] dark:border-slate-800 flex items-center justify-between bg-[#F0EADF]/30 dark:bg-slate-800/40">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="truncate">
              <h2 id="document-preview-title" className="text-sm sm:text-base font-serif font-bold text-[#192844] dark:text-white truncate">
                {title}
              </h2>
              <p className="text-xs text-[#64748B] dark:text-slate-400 truncate">
                {filename}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onDownload && (
              <button
                type="button"
                onClick={onDownload}
                title="Download Document"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#192844] text-white hover:bg-[#2A3E63] transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleOpenNewWindow}
              title="Open in new window"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#E5DED2] text-[#192844] bg-white hover:bg-[#F0EADF] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Tab</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#192844] hover:bg-[#F0EADF] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / PDF Viewer */}
        <div className="flex-1 p-4 bg-[#F7F4EE]/60 dark:bg-slate-950/40 overflow-hidden flex flex-col">
          <div className="flex-1 w-full rounded-xl overflow-hidden border border-[#E5DED2] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-inner min-h-[450px]">
            <object
              data={blobUrl}
              type="application/pdf"
              className="w-full h-full min-h-[500px]"
              aria-label="PDF Document Viewer"
            >
              <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
                <FileText className="w-12 h-12 text-[#64748B] mx-auto" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[#192844] dark:text-white">
                    Preview not directly supported in this browser window
                  </p>
                  <p className="text-xs text-[#64748B] dark:text-slate-400 max-w-md">
                    You can open the document in a new tab or download the file directly to your device.
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleOpenNewWindow}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#192844] text-white hover:bg-[#2A3E63] transition-colors"
                  >
                    Open in New Tab
                  </button>
                  {onDownload && (
                    <button
                      type="button"
                      onClick={onDownload}
                      className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#E5DED2] text-[#192844] bg-white hover:bg-[#F0EADF] transition-colors"
                    >
                      Download File
                    </button>
                  )}
                </div>
              </div>
            </object>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#E5DED2] dark:border-slate-800 bg-[#FFFCF7] dark:bg-slate-900 flex items-center justify-between text-xs text-[#64748B]">
          <span>Authenticated Secure Document Stream</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg hover:bg-[#F0EADF] text-[#475569] font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;
