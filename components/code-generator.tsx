"use client";

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  forwardRef,
} from "react";
import {
  Plus,
  Printer,
  Loader2,
  Check,
  X,
  Copy,
  Trash2,
  Globe,
  Trophy,
  type LucideProps,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import RegisterUserModal from "./register-user-modal";
import UserLeaderboard from "./user-leaderboard";

type Code = {
  id: string;
  code: string;
  used: boolean;
  usedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type Language = 'en' | 'rw';

type Translations = {
  appTitle: string;
  generateCode: string;
  deleteUsed: string;
  clearAll: string;
  used: string;
  unused: string;
  printSelected: string;
  selectAll: string;
  deselectAll: string;
  noCodes: string;
  copy: string;
  copied: string;
  markUsed: string;
  markUnused: string;
  delete: string;
  confirmDelete: string;
  confirmDeleteAll: string;
  confirmDeleteUsed: string;
  codeCopied: (code: string) => string;
  failedToCopy: string;
  print: string;
  close: string;
  printPreview: string;
  selectAtLeastOne: string;
  deleteConfirmation: string;
  allCodesDeleted: string;
  usedCodesDeleted: string;
  codeDeleted: string;
  failedToDelete: string;
  networkError: string;
  codeNotFound: string;
  invalidRequest: string;
  unexpectedError: string;
};

type Stats = {
  used: number;
  unused: number;
};

/* ---------- Code List ---------- */
interface CodeListProps {
  codes: Code[];
  selectedCodes: string[];
  copiedCode: string | null;
  onToggleUsed: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
  onCopy: (code: string) => void;
  onToggleSelect: (id: string) => void;
  onRegisterUser: (codeId: string, code: string) => void;
  onMarkAsUsedAndRegister: (codeId: string, code: string) => void;
  t: Omit<Translations, 'codeCopied' | 'failedToCopy' | 'networkError' | 'codeNotFound' | 'invalidRequest' | 'unexpectedError'>;
}

const CodeList: React.FC<CodeListProps> = ({
  codes,
  selectedCodes,
  copiedCode,
  onToggleUsed,
  onDelete,
  onCopy,
  onToggleSelect,
  onRegisterUser,
  onMarkAsUsedAndRegister,
  t,
}) => (
  <div className="space-y-2">
    {codes.map((c, index) => (
      <div
        key={`${c.id}-${index}`}
        className={`flex items-center justify-between p-3 rounded-lg ${
          c.used ? "bg-gray-100" : "bg-white shadow"
        }`}
      >
        <div className="flex items-center space-x-4 flex-1">
          <input
            type="checkbox"
            checked={selectedCodes.includes(c.id)}
            onChange={() => onToggleSelect(c.id)}
            className="h-4 w-4 text-blue-600"
          />
          <span
            className={`font-mono cursor-pointer ${
              c.used ? "line-through text-gray-500" : "text-gray-900"
            } ${c.used ? "hover:text-blue-600" : ""}`}
            onClick={() => {
              if (c.used) {
                onRegisterUser(c.id, c.code);
              }
            }}
            title={c.used ? "Click to register user for this code" : ""}
          >
            {c.code}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onCopy(c.code)}
            className={`p-1 rounded ${
              copiedCode === c.code 
                ? 'text-green-600' 
                : 'text-gray-500 hover:text-blue-600'
            }`}
            title={copiedCode === c.code ? t.copied : t.copy}
          >
            {copiedCode === c.code ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>

          <button
            onClick={() => onToggleUsed(c.id, c.used)}
            className={`p-1 rounded ${
              c.used
                ? "text-green-600 hover:text-green-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
            title={c.used ? t.markUnused : t.markUsed}
          >
            {c.used ? <Check className="h-4 w-4" /> : null}
          </button>

          <button
            onClick={() => onDelete(c.id)}
            className="p-1 text-red-500 hover:text-red-700"
            title={t.delete}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    ))}
  </div>
);

/* ---------- Print View ---------- */
interface PrintViewProps {
  codes: Code[];
  onClose: () => void;
  t: Translations;
}

const PHONE_NUMBER = "+256 784 321 509";

const PrintView = forwardRef<HTMLDivElement, PrintViewProps>(
  ({ codes, onClose, t }, ref) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-auto print:max-h-none print:overflow-visible">
        <div className="flex justify-between items-center mb-4 print:hidden">
          <h2 className="text-xl font-semibold">{t.printPreview}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" aria-label={t.close} />
          </button>
        </div>

        <div ref={ref} className="print-container">
          <style>{`
            @media print {
              @page {
                size: A4;
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
              .print-container {
                display: block;
                width: 100%;
              }
              .print-card {
                width: 100%;
                min-height: 10cm;
                page-break-after: always;
                page-break-inside: avoid;
                border: 2px solid #000;
                margin-bottom: 1cm;
                position: relative;
              }
              .card-section {
                width: 100%;
                min-height: 9cm;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                padding: 1.5cm;
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
              }
              .print-card:last-child {
                page-break-after: auto;
              }
            }
            @media screen {
              .print-container {
                display: block;
                width: 100%;
                padding: 1rem;
              }
              .print-card {
                width: 100%;
                min-height: 400px;
                border: 2px solid #000;
                border-radius: 8px;
                margin-bottom: 2rem;
                position: relative;
                background: white;
              }
              .card-section {
                width: 100%;
                min-height: 180px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                padding: 2rem;
                box-sizing: border-box;
              }
              .card-front {
                border-bottom: 3px dashed #ccc;
              }
              .card-back {
                background: #f9f9f9;
              }
              .section-label {
                position: absolute;
                top: 0.75rem;
                left: 1rem;
                font-size: 0.75rem;
                color: #666;
                font-weight: bold;
              }
              .used-badge {
                position: absolute;
                top: 0.75rem;
                right: 1rem;
                background: #ef4444;
                color: white;
                padding: 0.25rem 0.5rem;
                border-radius: 0.25rem;
                font-size: 0.75rem;
                font-weight: bold;
                z-index: 10;
                display: flex;
                align-items: center;
                gap: 0.25rem;
              }
            }
          `}</style>

          {codes.map((c) => (
            <div key={c.id} className="print-card">
              {c.used && (
                <div className="used-badge">
                  <Check className="h-3 w-3" />
                  USED
                </div>
              )}
              
              {/* Front Side - Code */}
              <div className="card-section card-front">
                <div className="section-label print:hidden">FRONT</div>
                <div className="text-center w-full">
                  <div className="text-xs text-gray-500 mb-3 print:text-[0.6cm] print:mb-0.5cm">
                    Kolorex Establishment Limited
                  </div>
                  <div className="font-mono font-bold text-5xl text-slate-900 tracking-widest print:text-[2cm] print:mb-0.5cm">
                    {c.code}
                  </div>
                  <div className="text-sm text-gray-600 mt-4 print:text-[0.5cm] print:mt-0.3cm">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              {/* Back Side - Phone Number */}
              <div className="card-section card-back">
                <div className="section-label print:hidden">BACK</div>
                <div className="text-center w-full">
                  <div className="text-xs text-gray-500 mb-4 print:text-[0.6cm] print:mb-0.5cm">
                    Contact Us
                  </div>
                  <div className="font-bold text-4xl text-slate-900 print:text-[1.5cm]">
                    {PHONE_NUMBER}
                  </div>
                  <div className="text-lg text-gray-700 mt-2 print:text-[1cm]">
                    Price: 1000 Shillings
                  </div>
                  <div className="text-xs text-gray-500 mt-6 print:text-[0.5cm] print:mt-0.5cm">
                    Code: {c.code}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end space-x-2 print:hidden no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            {t.close}
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            {t.print}
          </button>
        </div>
      </div>
    </div>
  )
);
PrintView.displayName = "PrintView";

/* ---------- Main Component ---------- */
export default function CodeGeneratorUI() {
  const [codes, setCodes] = useState<Code[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedForPrint, setSelectedForPrint] = useState<string[]>([]);
  const [showPrint, setShowPrint] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [registerModal, setRegisterModal] = useState<{ isOpen: boolean; codeId: string; code: string }>({
    isOpen: false,
    codeId: "",
    code: "",
  });
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const uiText = {
    en: {
      rankings: "Rankings",
      rankingsTooltip: "View rankings",
      markUsedBySomeone: "Mark as Used by Someone",
    },
    rw: {
      rankings: "Urutonde",
      rankingsTooltip: "Reba urutonde rw'abakiriya",
      markUsedBySomeone: "Shyira ko yakoreshejwe n'umukiriya",
    },
  } as const;

  // Translations
  const translations: Record<Language, Translations> = {
    en: {
      appTitle: 'Kolorex Establishment Limited',
      generateCode: 'Generate Code',
      deleteUsed: 'Delete Used',
      clearAll: 'Clear All',
      used: 'Used',
      unused: 'Unused',
      printSelected: 'Print Selected',
      selectAll: 'Select All',
      deselectAll: 'Deselect All',
      noCodes: 'No codes generated yet',
      copy: 'Copy',
      copied: 'Copied',
      markUsed: 'Mark as used',
      markUnused: 'Mark as unused',
      delete: 'Delete',
      confirmDelete: 'WARNING: This will permanently delete the code. Are you sure?',
      confirmDeleteAll: 'Delete ALL codes?',
      confirmDeleteUsed: 'Delete all used codes?',
      codeCopied: (code) => `Copied: ${code}`,
      failedToCopy: 'Failed to copy to clipboard',
      print: 'Print',
      close: 'Close',
      printPreview: 'Print Preview',
      selectAtLeastOne: 'Select at least one code',
      deleteConfirmation: 'Delete Confirmation',
      allCodesDeleted: 'All codes cleared',
      usedCodesDeleted: 'Used codes deleted',
      codeDeleted: 'Code deleted successfully',
      failedToDelete: 'Failed to delete code',
      networkError: 'Network error. Please check your connection.',
      codeNotFound: 'Code not found or already deleted',
      invalidRequest: 'Invalid request',
      unexpectedError: 'An unexpected error occurred',
    },
    rw: {
      appTitle: 'Kolorex Establishment Limited',
      generateCode: 'Kora Kode',
      deleteUsed: 'Siba Izakoreshejwe',
      clearAll: 'Siba Byose',
      used: 'Byakoreshejwe',
      unused: 'Bidakoreshwa',
      printSelected: 'Sohozana Ibyatoranijwe',
      selectAll: 'Hitamo Byose',
      deselectAll: 'Reka Guhitamo',
      noCodes: 'Nta kode yaranditswe',
      copy: 'Gukoporora',
      copied: 'Yakopiwe',
      markUsed: 'Ishyirwa nk\'ikoreshwa',
      markUnused: 'Ishyirwa nk\'idakoreshwa',
      delete: 'Siba',
      confirmDelete: 'IBURIRA: Ibi bizasiba kode. Urabyizeye?',
      confirmDeleteAll: 'Gusiba ZOSE kode?',
      confirmDeleteUsed: 'Gusiba kode zose zakoreshejwe?',
      codeCopied: (code) => `Yakopiwe: ${code}`,
      failedToCopy: 'Kubika kode kunanirwe',
      print: 'Sohozana',
      close: 'Gufunga',
      printPreview: 'Reba Mbere yo Gusohozana',
      selectAtLeastOne: 'Hitamo kode imwe byibuze',
      deleteConfirmation: 'Ubusobanuro Bwo Gusiba',
      allCodesDeleted: 'Kode zose zasibwe',
      usedCodesDeleted: 'Kode zakoreshejwe zasibwe',
      codeDeleted: 'Kode yasibwe neza',
      failedToDelete: 'Kusiba kode kunanirwe',
      networkError: 'Ikosa ry\'urubuga. Reba uko wiyungururira.',
      codeNotFound: 'Kode ntabwo yabonetse cyangwa yarasibwe',
      invalidRequest: 'Gusaba ntabwo ari byo',
      unexpectedError: 'Hari ikitagirwaho bitewe n\'ikibazo kitazwi',
    },
  };

  const t = translations[language];

  /* ---------- Memoised values ---------- */
  const stats = useMemo<Stats>(
    () => ({
      used: codes.filter((c) => c.used).length,
      unused: codes.filter((c) => !c.used).length,
    }),
    [codes]
  );

  const codesToPrint = useMemo(
    () => {
      const seen = new Set<string>();
      return codes.filter((c) => {
        if (!selectedForPrint.includes(c.id)) return false;
        if (seen.has(c.id)) return false;
        seen.add(c.id);
        return true;
      });
    },
    [codes, selectedForPrint]
  );

  /* ---------- API helpers ---------- */
  const fetchCodes = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/codes");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCodes(data);
    } catch (e) {
      toast.error("Failed to load codes");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateCode = useCallback(async () => {
    try {
      setIsGenerating(true);
      const res = await fetch("/api/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAsUsed: false })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to generate");
      setCodes((prev) => [{
        id: Date.now().toString(), // Temporary ID; ideally use real ID from backend if available
        code: data.code,
        used: false,
        usedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }, ...prev]);
      toast.success(`Generated: ${data.code}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to generate code");
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const toggleCodeUsed = useCallback(
    async (id: string, current: boolean) => {
      try {
        const res = await fetch(`/api/codes/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ used: !current }),
        });
        if (!res.ok) throw new Error("Failed to update");
        setCodes((prev) =>
          prev.map((c) =>
            c.id === id
              ? { ...c, used: !current, updatedAt: new Date() }
              : c
          )
        );
        toast.success(`Marked as ${!current ? "used" : "unused"}`);
      } catch (e) {
        toast.error("Failed to update status");
      }
    },
    []
  );

  const deleteCode = useCallback(async (id: string) => {
    if (!confirm(t.confirmDelete)) return;
    if (!id || typeof id !== 'string' || id.trim() === '') {
      toast.error('Invalid code ID');
      return;
    }
    try {
      const res = await fetch(`/api/codes/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to delete');
      setCodes(prev => prev.filter(code => code.id !== id));
      setSelectedForPrint(prev => prev.filter(i => i !== id));
      toast.success(t.codeDeleted);
    } catch (error: any) {
      let displayMessage = t.failedToDelete;
      if (error.message?.includes('Network')) displayMessage = t.networkError;
      if (error.message?.includes('404') || error.message?.includes('not found')) displayMessage = t.codeNotFound;
      if (error.message?.includes('400')) displayMessage = t.invalidRequest;
      toast.error(displayMessage);
    }
  }, [t]);

  const deleteCodeFallback = useCallback(async (id: string, requestId: string) => {
    const fallbackUrl = `/api/codes/${encodeURIComponent(id)}`;
    console.log('Attempting fallback delete at:', fallbackUrl);
    
    try {
      const response = await fetch(fallbackUrl, {
        method: 'DELETE',
        headers: {
          'X-Request-ID': requestId
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Fallback delete failed with status ${response.status}: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Fallback delete failed:', error);
      throw error;
    }
  }, []);

  const deleteUsedCodes = useCallback(async () => {
    if (!confirm(t.confirmDeleteUsed)) return;

    try {
      const res = await fetch("/api/codes/used", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setCodes((prev) => prev.filter((c) => !c.used));
      toast.success(t.usedCodesDeleted);
    } catch (e) {
      toast.error(t.failedToDelete);
    }
  }, [t]);

  const clearAll = useCallback(() => {
    if (!confirm(t.confirmDeleteAll)) return;
    setCodes([]);
    setSelectedForPrint([]);
    toast.success(t.allCodesDeleted);
  }, [t]);

  const handleCopy = useCallback(async (code: string) => {
    try {
      // Try the modern clipboard API first
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(code);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = code;
        textArea.style.position = 'fixed';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      // Update UI to show success
      setCopiedCode(code);
      toast.success(t.codeCopied(code), {
        duration: 2000,
        icon: '📋',
      });
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedCode(null);
      }, 2000);
      
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast.error(t.failedToCopy);
    }
  }, []);

  const onToggleSelect = useCallback((id: string) => {
    setSelectedForPrint(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  }, []);

  const handleMarkAsUsedAndRegister = useCallback(async (codeId: string, code: string) => {
    // First mark the code as used
    const codeObj = codes.find(c => c.id === codeId);
    if (!codeObj) return;
    
    if (!codeObj.used) {
      try {
        await toggleCodeUsed(codeId, false);
      } catch (error) {
        toast.error("Failed to mark code as used");
        return;
      }
    }
    
    // Then open the registration modal
    setRegisterModal({ isOpen: true, codeId, code });
  }, [codes, toggleCodeUsed]);

  const togglePrintSelection = useCallback(
    (selectAll: boolean) => {
      setSelectedForPrint(selectAll ? codes.map((c) => c.id) : []);
    },
    [codes]
  );

  const handlePrint = useCallback(() => {
    if (selectedForPrint.length === 0) {
      toast.error(t.selectAtLeastOne);
      return;
    }
    setShowPrint(true);
  }, [selectedForPrint, t]);

  /* ---------- Effects ---------- */
  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  /* ---------- Render ---------- */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t.appTitle}</h1>
          
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <button 
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600"
                onClick={() => setLanguage(prev => prev === 'en' ? 'rw' : 'en')}
                title={language === 'en' ? 'Hindura muri Kinyarwanda' : 'Switch to English'}
              >
                <Globe className="h-4 w-4" />
                <span>{language.toUpperCase()}</span>
              </button>
              <div className="absolute right-0 mt-1 w-32 py-1 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 hidden group-hover:block z-10">
                <button 
                  onClick={() => setLanguage('en')} 
                  className={`block w-full text-left px-4 py-2 text-sm ${language === 'en' ? 'bg-gray-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  English
                </button>
                <button 
                  onClick={() => setLanguage('rw')}
                  className={`block w-full text-left px-4 py-2 text-sm ${language === 'rw' ? 'bg-gray-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  Kinyarwanda
                </button>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
                showLeaderboard
                  ? "bg-yellow-600 text-white hover:bg-yellow-700"
                  : "bg-gray-600 text-white hover:bg-gray-700"
              }`}
              title={uiText[language].rankingsTooltip}
            >
              <Trophy className="h-4 w-4" />
              <span>{uiText[language].rankings}</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={selectedForPrint.length === 0}
              className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
                selectedForPrint.length === 0
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              title={t.print}
            >
              <Printer className="h-4 w-4" />
              <span>Print ({selectedForPrint.length})</span>
            </button>

            <button
              onClick={() => togglePrintSelection(selectedForPrint.length < codes.length)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {selectedForPrint.length === codes.length ? "Deselect All" : "Select All"}
            </button>

            <button
              onClick={generateCode}
              disabled={isGenerating}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300 flex items-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>{t.generateCode}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total</h3>
            <p className="text-2xl font-semibold">{stats.used + stats.unused}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">{t.used}</h3>
            <p className="text-2xl font-semibold text-red-600">{stats.used}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">{t.unused}</h3>
            <p className="text-2xl font-semibold text-green-600">{stats.unused}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 mb-4">
          {selectedForPrint.length > 0 && (() => {
            const selectedCode = codes.find(c => c.id === selectedForPrint[0]);
            if (selectedCode && !selectedCode.used) {
              return (
                <button
                  onClick={() => handleMarkAsUsedAndRegister(selectedCode.id, selectedCode.code)}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 flex items-center space-x-2"
                >
                  <Check className="h-4 w-4" />
                  <span>{uiText[language].markUsedBySomeone}</span>
                </button>
              );
            }
            return null;
          })()}
          <button
            onClick={deleteUsedCodes}
            disabled={stats.used === 0}
            className={`px-3 py-1 text-sm rounded-md ${
              stats.used === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-red-100 text-red-700 hover:bg-red-200"
            }`}
          >
            {t.deleteUsed} ({stats.used})
          </button>
          <button
            onClick={clearAll}
            disabled={codes.length === 0}
            className={`px-3 py-1 text-sm rounded-md ${
              codes.length === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-red-100 text-red-700 hover:bg-red-200"
            }`}
          >
            {t.clearAll}
          </button>
        </div>

        {/* Leaderboard or Code List */}
        {showLeaderboard ? (
          <div className="mb-6">
            <UserLeaderboard language={language} />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4">
              {codes.length === 0 ? (
                <p className="text-gray-500">{t.noCodes}</p>
              ) : (
                <CodeList
                  codes={codes}
                  selectedCodes={selectedForPrint}
                  copiedCode={copiedCode}
                  t={t}
                  onToggleUsed={toggleCodeUsed}
                  onDelete={deleteCode}
                  onCopy={handleCopy}
                  onToggleSelect={onToggleSelect}
                  onRegisterUser={(codeId, code) => {
                    setRegisterModal({ isOpen: true, codeId, code });
                  }}
                  onMarkAsUsedAndRegister={handleMarkAsUsedAndRegister}
                />
              )}
            </div>
          </div>
        )}

        {/* Print Modal */}
        {showPrint && (
          <PrintView
            codes={codesToPrint}
            onClose={() => setShowPrint(false)}
            ref={printRef}
            t={t}
          />
        )}

        {/* Register User Modal */}
        <RegisterUserModal
          codeId={registerModal.codeId}
          code={registerModal.code}
          isOpen={registerModal.isOpen}
          onClose={() => setRegisterModal({ isOpen: false, codeId: "", code: "" })}
          onSuccess={() => {
            fetchCodes(); // Refresh codes list
          }}
          language={language}
        />
      </div>

      {/* Toast Container */}
      <Toaster position="top-right" />
    </>
  );
}
