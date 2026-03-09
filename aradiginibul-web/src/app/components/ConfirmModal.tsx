import React from 'react';

interface ConfirmModalProps {
    visible: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({ visible, message, onConfirm, onCancel }: ConfirmModalProps) {
    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-red-800 rounded-lg shadow-lg max-w-sm w-full p-6">
                <h2 className="text-lg font-semibold mb-4">Onay</h2>
                <p className="mb-6 text-sm text-red-1000 dark:text-red-1000">{message}</p>
                <div className="flex justify-end space-x-3">
                    <button
                        className="px-4 py-2 bg-green-600 dark:bg-green-600 rounded hover:bg-green-600 dark:hover:bg-green-600"
                        onClick={onCancel}
                    >
                        Vazgeç
                    </button>
                    <button
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        onClick={onConfirm}
                    >
                        Sil
                    </button>
                </div>
            </div>
        </div>
    );
}
