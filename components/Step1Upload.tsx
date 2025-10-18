import React from 'react';
import { UploadIcon } from './icons';
import { type CourseDetails } from '../types';

interface Step1UploadProps {
  courseDetails: CourseDetails;
  setCourseDetails: React.Dispatch<React.SetStateAction<CourseDetails>>;
  setStudentFile: (file: File | null) => void;
  setAttendanceFile: (file: File | null) => void;
  setCertificateBgFile: (file: File | null) => void;
  onNext: () => void;
}

const FileInput: React.FC<{ id: string; label: string; fileType: string; onChange: (file: File | null) => void; }> = ({ id, label, fileType, onChange }) => {
  const [fileName, setFileName] = React.useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onChange(file);
    } else {
      setFileName(null);
      onChange(null);
    }
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <label htmlFor={id} className="w-full flex items-center justify-center px-4 py-6 bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
        <div className="text-center">
          <UploadIcon className="mx-auto h-10 w-10 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">{fileName || `Clique para carregar ${fileType}`}</p>
          <input id={id} type="file" className="hidden" accept={fileType} onChange={handleChange} />
        </div>
      </label>
    </div>
  );
};

const Step1Upload: React.FC<Step1UploadProps> = ({
  courseDetails,
  setCourseDetails,
  setStudentFile,
  setAttendanceFile,
  setCertificateBgFile,
  onNext,
}) => {
  const [formValid, setFormValid] = React.useState(false);
  const [files, setFiles] = React.useState({ student: false, attendance: false });

  React.useEffect(() => {
    // FIX: Property 'trim' does not exist on type 'unknown'. Added a type check to ensure value is a string.
    const detailsValid = Object.values(courseDetails).every(v => typeof v === 'string' && v.trim() !== '');
    const filesValid = files.student && files.attendance;
    setFormValid(detailsValid && filesValid);
  }, [courseDetails, files]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCourseDetails(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FileInput id="studentFile" label="Planilha de Alunos (com Nome Completo e Email)" fileType=".xlsx" onChange={(file) => { setStudentFile(file); setFiles(f => ({ ...f, student: !!file })); }} />
        <FileInput id="attendanceFile" label="Planilha de Presença (com nomes variáveis)" fileType=".xlsx" onChange={(file) => { setAttendanceFile(file); setFiles(f => ({ ...f, attendance: !!file })); }} />
      </div>
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">Detalhes do Curso</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" name="nomeCurso" value={courseDetails.nomeCurso} onChange={handleInputChange} placeholder="Nome do Curso" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
          <input type="text" name="cargaHoraria" value={courseDetails.cargaHoraria} onChange={handleInputChange} placeholder="Carga Horária (ex: 40 Horas)" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
          <input type="text" name="dataCurso" value={courseDetails.dataCurso} onChange={handleInputChange} placeholder="Data de Realização" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>
      </div>
      <div>
         <h3 className="text-lg font-medium text-gray-800 mb-2">Modelo do Certificado (Opcional)</h3>
         <FileInput id="certificateBgFile" label="Fundo do Certificado (Imagem)" fileType="image/png, image/jpeg" onChange={setCertificateBgFile} />
         <p className="text-xs text-gray-500 mt-1">Faça o upload de uma imagem de fundo. Caso não seja fornecida, um modelo padrão será usado. Substitui a necessidade de um modelo .docx, que não pode ser processado no navegador.</p>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!formValid}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Processar Frequência
        </button>
      </div>
    </div>
  );
};

export default Step1Upload;