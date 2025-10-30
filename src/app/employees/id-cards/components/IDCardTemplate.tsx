import React from 'react';

interface Props {
  name: string;
  designation: string;
  employee_id: string;
  blood_group?: string | null;
}

// Scaled 3x for visibility
const SCALE = 3;
const CARD_W_MM = 85.6;
const CARD_H_MM = 53.98;
const HEADER_H_MM = 15;

const mmToPx = (mm: number) => `${mm * SCALE * 3.78}px`; // ~3.78px per mm

export default function IDCardTemplate({ name, designation, employee_id, blood_group }: Props) {
  const blood = blood_group || '____';
  return (
    <div
      className="relative border-2 rounded-sm"
      style={{
        width: mmToPx(CARD_W_MM),
        height: mmToPx(CARD_H_MM),
        borderColor: '#1e40af',
      }}
    >
      <div
        className="w-full"
        style={{ backgroundColor: '#dc2626', height: mmToPx(HEADER_H_MM) }}
      >
        <div className="flex items-center h-full px-2 gap-2">
          <div
            className="flex items-center justify-center text-white text-[10px] font-bold"
            style={{ width: mmToPx(12), height: mmToPx(12) }}
          >
            {/* Logo placeholder space */}
          </div>
          <div className="text-white font-bold text-xs">SECURITECH SEVEN PVT LTD</div>
        </div>
      </div>

      <div className="p-2 flex gap-2">
        <div
          className="flex items-center justify-center text-gray-500 text-[10px] font-bold"
          style={{
            width: mmToPx(20),
            height: mmToPx(25),
            backgroundColor: '#f3f4f6',
            border: '1px solid #e5e7eb',
          }}
        >
          PHOTO
        </div>
        <div className="text-[10px] space-y-1">
          <div> Name: {name} </div>
          <div> Rank: {designation} </div>
          <div> ID No: {employee_id} </div>
          <div> Blood Group: {blood} </div>
        </div>
      </div>

      <div className="absolute left-2 right-2" style={{ bottom: mmToPx(5) }}>
        <div className="grid grid-cols-2 gap-4 text-[9px]">
          <div className="space-y-2">
            <div>
              <span>Date of Issue:</span>
              <span className="inline-block border-b border-gray-400 ml-2" style={{ width: mmToPx(30) }} />
            </div>
            <div>
              <div>Signature of the Cardholder:</div>
              <span className="inline-block border-b border-gray-400" style={{ width: mmToPx(45), marginTop: '4px' }} />
            </div>
            <div>
              <span>Valid upto:</span>
              <span className="inline-block border-b border-gray-400 ml-2" style={{ width: mmToPx(30) }} />
            </div>
          </div>
          <div className="space-y-2">
            <div>ID No: {employee_id}</div>
            <div>
              <div>Signature of Issuing Authority</div>
              <span className="inline-block border-b border-gray-400" style={{ width: mmToPx(45), marginTop: '4px' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


