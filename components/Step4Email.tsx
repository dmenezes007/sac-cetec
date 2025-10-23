import React, { useState, useEffect } from 'react';
import { type ProcessedStudent } from '../types';
import { MailIcon, CheckCircleIcon } from './icons';

interface Step4EmailProps {
  approvedStudents: ProcessedStudent[];
  onBack: () => void;
}

const Step4Email: React.FC<Step4EmailProps> = ({ approvedStudents, onBack }) => {
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    // Initially select all students
    setSelectedStudents(new Set(approvedStudents.map(s => s.id)));
  }, [approvedStudents]);

  const handleSelect = (studentId: string) => {
    setSelectedStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedStudents.size === approvedStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(approvedStudents.map(s => s.id)));
    }
  };

  const handleSendEmails = () => {
    setIsSending(true);
    console.log("--- SIMULATING EMAIL SENDING ---");
    const recipients = approvedStudents.filter(s => selectedStudents.has(s.id));
    recipients.forEach(student => {
      console.log(`To: ${student.Email}, Subject: Seu Certificado do Curso! Body: Parabéns, ${student['Nome Completo']}! Seu certificado está em anexo.`);
    });
    
    setTimeout(() => {
      setIsSending(false);
      setSent(true);
    }, 2000);
  };
  
  if (sent) {
    return (
       <div className="text-center p-8 bg-white rounded-lg shadow-md border border-gray-200">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">E-mails Enviados!</h2>
            <p className="text-gray-600 mb-6">A simulação de envio de e-mails para {selectedStudents.size} participante(s) foi concluída com sucesso.</p>
            <button onClick={onBack} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-green-700 transition-colors">Voltar</button>
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold">Enviar Certificados por E-mail</h2>
        <p className="text-gray-600 mt-1">Selecione os participantes que receberão o certificado por e-mail. Esta é uma simulação e nenhum e-mail real será enviado.</p>
      </div>

      <div className="flex justify-between items-center px-3">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="selectAll"
            className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            checked={selectedStudents.size === approvedStudents.length}
            onChange={handleSelectAll}
          />
          <label htmlFor="selectAll" className="ml-2 block text-sm text-gray-900">
            {selectedStudents.size === approvedStudents.length ? "Desmarcar Todos" : "Marcar Todos"}
          </label>
        </div>
        <span className="text-sm font-medium">{selectedStudents.size} de {approvedStudents.length} selecionados</span>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
        {approvedStudents.map(student => (
          <div key={student.id} className="flex items-center p-3 bg-white rounded-md shadow-sm border border-gray-200">
            <input
              type="checkbox"
              id={`student-${student.id}`}
              className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              checked={selectedStudents.has(student.id)}
              onChange={() => handleSelect(student.id)}
            />
            <label htmlFor={`student-${student.id}`} className="ml-3 flex-grow">
              <p className="font-medium text-gray-800">{student['Nome Completo']}</p>
              <p className="text-sm text-gray-500">{student.Email}</p>
            </label>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-md shadow-sm hover:bg-gray-700 transition-colors">Voltar</button>
        <button
          onClick={handleSendEmails}
          disabled={isSending || selectedStudents.size === 0}
          className="flex items-center justify-center gap-2 w-64 px-6 py-2 bg-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-green-700 disabled:bg-gray-400 transition-colors"
        >
          {isSending ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <MailIcon className="h-5 w-5" />
              Enviar E-mails para Selecionados ({selectedStudents.size})
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Step4Email;