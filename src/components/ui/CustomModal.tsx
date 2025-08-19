// components/ui/CustomModal.tsx
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal box */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-lg w-full relative">
          {/* Header */}
          <div className="flex justify-between items-center border-b px-6 py-4">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close modal"
            >
              &#10005;
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[70vh] overflow-auto">{children}</div>
        </div>
      </div>
    </>
  );
}

export interface EditableField<T = any> {
  name: keyof T & string;
  label: string;
  type?: 'text' | 'number' | 'select';
  options?: Array<{ label: string; value: string }>; // for select
}

interface EditModalProps<T> extends Omit<ModalProps, 'children'> {
  values: T;
  fields: EditableField<T>[];
  onChange: (next: T) => void;
  onSave: () => Promise<void> | void;
  saveLabel?: string;
}

export function EditModal<T>({ isOpen, onClose, title, values, fields, onChange, onSave, saveLabel = 'Save' }: EditModalProps<T>) {
  if (!isOpen) return null;

  const handleField = (name: string, value: any) => {
    onChange({ ...(values as any), [name]: value });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-lg w-full relative">
          <div className="flex justify-between items-center border-b px-6 py-4">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close modal">
              &#10005;
            </button>
          </div>
          <div className="p-6 max-h-[70vh] overflow-auto space-y-4">
            {fields.map((f) => (
              <div key={String(f.name)} className="space-y-1">
                <label className="text-sm text-gray-700">{f.label}</label>
                {f.type === 'select' ? (
                  <select
                    value={(values as any)[f.name] ?? ''}
                    onChange={(e) => handleField(f.name, e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  >
                    {(f.options || []).map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type === 'number' ? 'number' : 'text'}
                    value={(values as any)[f.name] ?? ''}
                    onChange={(e) => handleField(f.name, f.type === 'number' ? Number(e.target.value) : e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                )}
              </div>
            ))}
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={onClose} className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200">Cancel</button>
              <button onClick={() => void onSave()} className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white">{saveLabel}</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
