"use client";

import { useEffect, useRef, useState } from "react";
import { X, Loader2, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

type Language = "en" | "rw";

interface RegisterUserModalProps {
  codeId: string;
  code: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  language: Language;
}

const modalTranslations: Record<
  Language,
  {
    title: string;
    codeLabel: string;
    nameLabel: string;
    phoneLabel: string;
    namePlaceholder: string;
    phonePlaceholder: string;
    cancel: string;
    register: string;
    registering: string;
    fillAllFields: string;
    success: string;
    failGeneric: string;
  }
> = {
  en: {
    title: "Register User for Code",
    codeLabel: "Code",
    nameLabel: "Name *",
    phoneLabel: "Phone Number *",
    namePlaceholder: "Enter name",
    phonePlaceholder: "+256 784 321 509",
    cancel: "Cancel",
    register: "Register",
    registering: "Registering...",
    fillAllFields: "Please fill in all fields",
    success: "User registered successfully!",
    failGeneric: "Failed to register user",
  },
  rw: {
    title: "Andika Umukiriya ku Kode",
    codeLabel: "Kode",
    nameLabel: "Izina *",
    phoneLabel: "Numero ya Telefoni *",
    namePlaceholder: "Andika izina",
    phonePlaceholder: "+256 784 321 509",
    cancel: "Funga",
    register: "Andika",
    registering: "Irimo kwandika...",
    fillAllFields: "Uzuza ibisabwa byose",
    success: "Umukiriya yanditswe neza!",
    failGeneric: "Kwiyandikisha byanze",
  },
};

export default function RegisterUserModal({
  codeId,
  code,
  isOpen,
  onClose,
  onSuccess,
  language,
}: RegisterUserModalProps) {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const t = modalTranslations[language];

  useEffect(() => {
    if (isOpen) {
      window.setTimeout(() => nameInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phoneNumber.trim()) {
      toast.error(t.fillAllFields);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/codes/${codeId}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          phoneNumber: phoneNumber.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || t.failGeneric);
      }

      toast.success(t.success);
      setName("");
      setPhoneNumber("");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error registering user:", error);
      toast.error(error.message || t.failGeneric);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="register-user-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-indigo-600 text-white">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 id="register-user-title" className="text-lg font-semibold text-slate-950 dark:text-white">
                {t.title}
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {language === "en"
                  ? "Enter the person's details. This adds them to rankings."
                  : "Andika amakuru y'umukiriya. Ibi bimushyira ku rutonde."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-slate-500 hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            disabled={isSubmitting}
            aria-label="Close popup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              {t.codeLabel}
            </label>
            <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-3 font-mono text-lg font-bold text-indigo-800 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-200">
              {code}
            </div>
          </div>

          <div className="mb-4">
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              {t.nameLabel}
            </label>
            <input
              ref={nameInputRef}
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20"
              placeholder={t.namePlaceholder}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="phoneNumber"
              className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              {t.phoneLabel}
            </label>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20"
              placeholder={t.phonePlaceholder}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              disabled={isSubmitting}
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-indigo-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t.registering}</span>
                </>
              ) : (
                <span>{t.register}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


