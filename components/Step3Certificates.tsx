import React, { useState, useCallback } from 'react';
import { type ProcessedStudent, type CourseDetails } from '../types';
import CertificateTemplate from './CertificateTemplate';
import { DownloadIcon } from './icons';
import { generatePdf } from '../utils/helpers';

interface Step3CertificatesProps {
  approvedStudents: ProcessedStudent[];
  courseDetails: CourseDetails;
  certificateBg: string | null;
  onNext: () => void;
  onBack: () => void;
}

const Step3Certificates: React.FC<Step3CertificatesProps> = ({ approvedStudents, courseDetails, certificateBg, onNext, onBack }) => {
  const [selectedStudent, setSelectedStudent] = useState<ProcessedStudent | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const handleDownload = useCallback(async (student: ProcessedStudent) => {
    setIsDownloading(student.id);
    const certificateId = `cert-${student.id}`;
    const fileName = `Certificado_${student['Nome Completo'].replace(/\s/g, '_')}`;
    // Render the certificate off-screen to generate PDF from it
    const hiddenContainer = document.createElement('div');
    hiddenContainer.style.position = 'fixed';
    hiddenContainer.style.left = '-9999px';
    hiddenContainer.style.top = '-9999px';
    document.body.appendChild(hiddenContainer);

    const { createRoot } = await import('react-dom/client');
    const root = createRoot(hiddenContainer);
    root.render(
        <CertificateTemplate student={student} courseDetails={courseDetails} backgroundImage={certificateBg} id={certificateId} />
    );
    
    // Give it a moment to render fully before generating PDF
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await generatePdf(certificateId, fileName);
    
    // Cleanup
    root.unmount();
    document.body.removeChild(hiddenContainer);
    
    setIsDownloading(null);
  }, [courseDetails, certificateBg]);

  return (
    <div className="space-y-6">
      <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 text-center">
        <h2 className="text-xl font-semibold">Certificados Prontos para Emissão</h2>
        <p className="text-gray-600">
          {approvedStudents.length} certificados foram gerados. Visualize e faça o download individualmente ou prossiga para o envio em massa.
        </p>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {approvedStudents.map(student => (
          <div key={student.id} className="flex items-center justify-between p-3 bg-white rounded-md shadow-sm border border-gray-200">
            <div>
              <p className="font-medium text-gray-800">{student['Nome Completo']}</p>
              <p className="text-sm text-gray-500">{student.Email}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedStudent(student)}
                className="text-sm text-green-600 hover:underline"
              >
                Visualizar
              </button>
              <button
                onClick={() => handleDownload(student)}
                disabled={isDownloading === student.id}
                className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white text-sm font-semibold rounded-md shadow-sm hover:bg-green-700 transition-colors disabled:bg-gray-400"
              >
                {isDownloading === student.id ? 'Baixando...' : <> <DownloadIcon className="h-4 w-4" /> PDF </>}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-md shadow-sm hover:bg-gray-700 transition-colors">Voltar</button>
        <button onClick={onNext} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-green-700 transition-colors">
          Preparar Envio de E-mails
        </button>
      </div>

      {/* Modal for Certificate Preview */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setSelectedStudent(null)}>
          <div className="relative transform-gpu scale-[0.6] origin-center" onClick={e => e.stopPropagation()}>
            <CertificateTemplate student={selectedStudent} courseDetails={courseDetails} backgroundImage={certificateBg} id={`preview-${selectedStudent.id}`}/>
            <button
                onClick={() => setSelectedStudent(null)}
                className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-lg text-gray-700 hover:bg-gray-200"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step3Certificates;