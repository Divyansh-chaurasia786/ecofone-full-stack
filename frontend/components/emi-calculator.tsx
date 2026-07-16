'use client';

import React, { useState } from 'react';

interface EmiCalculatorProps {
  price: number;
}

export default function EmiCalculator({ price }: EmiCalculatorProps) {
  const [downpayment, setDownpayment] = useState(0);

  const calculateEmiForTenure = (months: number, annualRate: number) => {
    const principal = price - downpayment;
    if (principal <= 0) return { emi: 0, interest: 0, total: 0 };

    const r = annualRate / 12 / 100; // monthly rate
    const n = months;

    // Standard EMI formula: [P * R * (1+R)^N] / [(1+R)^N - 1]
    const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalAmount = emi * n;
    const totalInterest = totalAmount - principal;

    return {
      emi: Math.round(emi),
      interest: Math.round(totalInterest),
      total: Math.round(totalAmount),
    };
  };

  const tenures = [
    { months: 3, rate: 12 },
    { months: 6, rate: 13 },
    { months: 9, rate: 14 },
    { months: 12, rate: 15 },
  ];

  return (
    <div className="glassmorphism-card rounded-2xl p-6 border border-white/10 space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <h3 className="font-display font-semibold text-white text-base">🏷️ Monthly EMI Calculator</h3>
        <span className="text-gray-400 text-xs">Device Price: ₹{price.toLocaleString('en-IN')}</span>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-gray-400 flex justify-between">
          <span>Downpayment Amount:</span>
          <span className="font-bold text-white">₹{downpayment.toLocaleString('en-IN')}</span>
        </label>
        <input
          type="range"
          min="0"
          max={price - 2000}
          step="1000"
          value={downpayment}
          onChange={(e) => setDownpayment(Number(e.target.value))}
          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-ecoGreen-500"
        />
        <div className="flex justify-between text-[10px] text-gray-500">
          <span>₹0 downpayment</span>
          <span>Max ₹{(price - 2000).toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-300">
          <thead>
            <tr className="border-b border-white/10 text-gray-400">
              <th className="py-2">Tenure</th>
              <th className="py-2">Interest Rate</th>
              <th className="py-2">Monthly EMI</th>
              <th className="py-2 text-right">Total Interest</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {tenures.map((tenure) => {
              const { emi, interest } = calculateEmiForTenure(tenure.months, tenure.rate);
              return (
                <tr key={tenure.months} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 font-semibold text-white">{tenure.months} Months</td>
                  <td className="py-3">{tenure.rate}% p.a.</td>
                  <td className="py-3 font-semibold text-ecoGreen-400">₹{emi.toLocaleString('en-IN')}/mo</td>
                  <td className="py-3 text-right text-gray-400">₹{interest.toLocaleString('en-IN')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-[9px] text-gray-500 leading-relaxed pt-2">
        *EMI calculations are subject to credit approval from our financial partners (HDFC, Bajaj Finserv, ZestMoney). Taxes and processing fees extra.
      </p>
    </div>
  );
}
