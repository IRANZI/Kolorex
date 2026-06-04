"use client"

import { forwardRef, useEffect } from "react"
import { X, Check, Scissors } from "lucide-react"

interface Code {
  id: string
  code: string
  used: boolean
  createdAt: Date
}

interface PrintViewProps {
  codes: Code[]
  onClose: () => void
}

const PHONE_NUMBER = "+256 784 321 509"

const PrintView = forwardRef<HTMLDivElement, PrintViewProps>(({ codes, onClose }, ref) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print()
    }, 600) // slightly longer delay is often more reliable

    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Print Preview Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-4xl w-full">
            {/* Header – hidden when printing */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 print:hidden">
              <h3 className="font-semibold text-slate-900 dark:text-white">Print Preview</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Main content */}
            <div className="p-6 max-h-[80vh] overflow-y-auto print:p-0 print:max-h-none print:overflow-visible">
              <div ref={ref} className="print:block">
                <style jsx global>{`
                  @media print {
                    @page {
                      size: auto;
                      margin: 1cm;
                    }
                    body {
                      margin: 0;
                      padding: 0;
                      background: white;
                    }
                    .no-print {
                      display: none !important;
                    }
                  }

                  .print-card {
                    width: 100%;
                    min-height: 300px;
                    page-break-after: always;
                    page-break-inside: avoid;
                    border: 2px solid #000;
                    margin-bottom: 24px;
                    position: relative;
                    background: white;
                  }

                  .card-section {
                    width: 100%;
                    min-height: 220px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    padding: 32px;
                    box-sizing: border-box;
                  }

                  .card-front {
                    border-bottom: 3px dashed #666;
                  }

                  .card-back {
                    background: #f9f9f9;
                  }

                  .section-label {
                    position: absolute;
                    top: 0.3cm;
                    left: 0.5cm;
                    font-size: 0.6cm;
                    color: #666;
                    font-weight: bold;
                  }

                  .used-badge {
                    position: absolute;
                    top: 0.3cm;
                    right: 0.5cm;
                    background: #ef4444;
                    color: white;
                    padding: 0.2cm 0.4cm;
                    border-radius: 0.2cm;
                    font-size: 0.6cm;
                    font-weight: bold;
                    z-index: 10;
                    display: flex;
                    align-items: center;
                    gap: 0.2cm;
                  }

                  .cut-mark {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0.8cm 0;
                    color: #666;
                  }

                  @media screen {
                    .print-card {
                      width: 100%;
                      min-height: 380px;
                      border: 2px solid #000;
                      border-radius: 8px;
                      margin-bottom: 2rem;
                      background: white;
                    }

                    .card-section {
                      min-height: 180px;
                      padding: 2rem;
                    }

                    .section-label {
                      top: 0.75rem;
                      left: 1rem;
                      font-size: 0.75rem;
                    }

                    .used-badge {
                      top: 0.75rem;
                      right: 1rem;
                      padding: 0.25rem 0.5rem;
                      font-size: 0.75rem;
                    }

                    .cut-mark {
                      margin: 1.5rem 0;
                    }
                  }
                `}</style>

                {/* FRONT SIDE: All codes */}
                <div className="space-y-12 print:space-y-16">
                  {codes.map((code, idx) => (
                    <div key={code.id + '-front'} className="print-card-wrapper">
                      <div className="print-card">
                        {code.used && (
                          <div className="used-badge">
                            <Check size={14} />
                            USED
                          </div>
                        )}
                        <div className="card-section card-front">
                          <div className="section-label print:hidden">FRONT</div>
                          <div className="text-center w-full">
                            <div className="text-xs text-gray-500 mb-3 print:text-[0.6cm] print:mb-0.5cm">
                              Kolorex Establishment Limited
                            </div>
                            <div className="font-mono font-bold text-5xl sm:text-6xl text-slate-900 tracking-widest print:text-[2cm]">
                              {code.code}
                            </div>
                            <div className="text-sm text-gray-600 mt-5 print:text-[0.5cm] print:mt-0.3cm">
                              {new Date(code.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                      {idx < codes.length - 1 && (
                        <div className="cut-mark">
                          <Scissors size={32} className="mr-3" />
                          <div className="flex-1 h-px border-b-2 border-dashed border-gray-500" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {/* PAGE BREAK for backs */}
                <div className="print-page-break" style={{breakAfter: 'page', pageBreakAfter: 'always'}} />
                {/* BACK SIDE: All codes */}
                <div className="space-y-12 print:space-y-16">
                  {codes.map((code, idx) => (
                    <div key={code.id + '-back'} className="print-card-wrapper">
                      <div className="print-card">
                        <div className="card-section card-back">
                          <div className="section-label print:hidden">BACK</div>
                          <div className="text-center w-full">
                            <div className="text-xs text-gray-500 mb-4 print:text-[0.6cm] print:mb-0.5cm">
                              Contact Us
                            </div>
                            <div className="font-bold text-4xl sm:text-5xl text-slate-900 print:text-[1.5cm]">
                              {PHONE_NUMBER}
                            </div>
                            <div className="text-lg text-gray-700 mt-3 print:text-[1cm]">
                              Price: 1000 Shillings
                            </div>
                            <div className="text-xs text-gray-500 mt-6 print:text-[0.5cm] print:mt-0.5cm">
                              Code: {code.code}
                            </div>
                          </div>
                        </div>
                      </div>
                      {idx < codes.length - 1 && (
                        <div className="cut-mark">
                          <Scissors size={32} className="mr-3" />
                          <div className="flex-1 h-px border-b-2 border-dashed border-gray-500" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer buttons – hidden when printing */}
            <div className="flex gap-3 p-4 border-t border-slate-200 dark:border-slate-700 print:hidden">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Print Now
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 px-5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
})

PrintView.displayName = "PrintView"
export default PrintView
