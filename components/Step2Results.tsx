
import React, { useState, useEffect, useMemo } from 'react';
import { type ProcessedStudent } from '../types';
import { DownloadIcon } from './icons';
import { exportToXlsx } from '../utils/helpers';

interface Step2ResultsProps {
  processedData: ProcessedStudent[];
  setProcessedData: React.Dispatch<React.SetStateAction<ProcessedStudent[]>>;
  onNext: () => void;
  onBack: () => void;
  totalClasses: number;
}

const Step2Results: React.FC<Step2ResultsProps> = ({ processedData, setProcessedData, onNext, onBack, totalClasses }) => {
  const [minPercentage, setMinPercentage] = useState<number>(75);

  const updatedData = useMemo(() => {
    return processedData.map(student => ({
      ...student,
      status: student.percentualFrequencia >= minPercentage ? 'Aprovado' : 'Reprovado'
    }));
  }, [processedData, minPercentage]);

  useEffect(() => {
    setProcessedData(updatedData);
  }, [updatedData, setProcessedData]);

  const approvedCount = updatedData.filter(s => s.status === 'Aprovado').length;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-3">
          <label htmlFor="minPercentage" className="font-medium text-gray-700">Percentual Mínimo de Aprovação (%):</label>
          <input
            type="number"
            id="minPercentage"
            value={minPercentage}
            onChange={(e) => setMinPercentage(Number(e.target.value))}
            className="w-24 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            min="0"
            max="100"
          />
        </div>
        <div className="text-center md:text-right">
            <p className="font-semibold text-lg">{approvedCount} / {updatedData.length} Alunos Aprovados</p>
            <p className="text-sm text-gray-500">com base em {totalClasses} aulas totais</p>
        </div>
        <button onClick={() => exportToXlsx(updatedData, 'resultados_frequencia')} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-green-700 transition-colors">
          <DownloadIcon className="h-5 w-5" />
          Baixar Listagem (.xlsx)
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome Completo</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aulas Presente</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Frequência (%)</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {updatedData.map((student) => (
              <tr key={student.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student['Nome Completo']}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.Email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{student.aulasPresente}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{student.percentualFrequencia.toFixed(1)}%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    student.status === 'Aprovado' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {student.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-between">
        <button onClick={onBack} className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-md shadow-sm hover:bg-gray-700 transition-colors">Voltar</button>
        <button onClick={onNext} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 disabled:bg-gray-400" disabled={approvedCount === 0}>
          Gerar Certificados para Aprovados ({approvedCount})
        </button>
      </div>
    </div>
  );
};

export default Step2Results;
