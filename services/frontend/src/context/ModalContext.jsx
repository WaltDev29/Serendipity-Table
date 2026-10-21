import React, { createContext, useContext, useState, useCallback } from 'react';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'alert', // 'alert' | 'confirm'
    title: '',
    message: '',
    confirmText: '확인',
    cancelText: '취소',
    onConfirm: null,
    onCancel: null
  });

  const showAlert = useCallback((message, title = '알림', confirmText = '확인') => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        type: 'alert',
        title,
        message,
        confirmText,
        cancelText: '취소',
        onConfirm: () => {
          setModalState((prev) => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: null
      });
    });
  }, []);

  const showConfirm = useCallback((message, title = '확인', confirmText = '확인', cancelText = '취소') => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        type: 'confirm',
        title,
        message,
        confirmText,
        cancelText,
        onConfirm: () => {
          setModalState((prev) => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setModalState((prev) => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm, closeModal }}>
      {children}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in select-none">
          <div className="w-full max-w-sm bg-surface-container-lowest rounded-3xl p-6 shadow-2xl border border-surface-container flex flex-col items-center text-center gap-4 animate-scale-up">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              modalState.type === 'confirm'
                ? 'bg-primary-fixed text-primary'
                : 'bg-primary-fixed text-primary'
            }`}>
              <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                {modalState.type === 'confirm' ? 'help' : 'info'}
              </span>
            </div>

            <div className="w-full space-y-1.5">
              <h3 className="font-headline-sm text-base font-bold text-on-surface">
                {modalState.title}
              </h3>
              <p className="font-body-md text-xs text-on-surface-variant whitespace-pre-line leading-relaxed px-1">
                {modalState.message}
              </p>
            </div>

            <div className="w-full flex gap-2 pt-2">
              {modalState.type === 'confirm' && (
                <button
                  type="button"
                  onClick={modalState.onCancel}
                  className="flex-1 h-11 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-bold transition-all active:scale-[0.98]"
                >
                  {modalState.cancelText}
                </button>
              )}
              <button
                type="button"
                onClick={modalState.onConfirm}
                className="flex-1 h-11 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold shadow-md transition-all active:scale-[0.98]"
              >
                {modalState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);
