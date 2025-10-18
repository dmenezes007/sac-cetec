
import React from 'react';
import { type ProcessedStudent, type CourseDetails } from '../types';

interface CertificateTemplateProps {
  student: ProcessedStudent;
  courseDetails: CourseDetails;
  backgroundImage: string | null;
  id: string;
}

const CertificateTemplate: React.FC<CertificateTemplateProps> = ({ student, courseDetails, backgroundImage, id }) => {
  return (
    <div id={id} className="w-[1000px] h-[700px] bg-white shadow-lg relative font-serif text-gray-800 flex flex-col items-center justify-center p-12 text-center break-words">
      {backgroundImage ? (
        <img src={backgroundImage} alt="Certificate Background" className="absolute top-0 left-0 w-full h-full object-cover -z-10" />
      ) : (
        <div className="absolute top-0 left-0 w-full h-full border-8 border-blue-800 bg-blue-50 -z-10"></div>
      )}
      <h1 className="text-5xl font-bold text-blue-900 tracking-wider">Certificado de Conclusão</h1>
      <p className="mt-12 text-xl">Certificamos que</p>
      <p className="mt-4 text-4xl font-semibold text-blue-800" style={{ fontFamily: '"Playfair Display", serif' }}>
        {student['Nome Completo']}
      </p>
      <p className="mt-8 text-lg max-w-2xl mx-auto leading-relaxed">
        concluiu com sucesso o curso de <span className="font-semibold">{courseDetails.nomeCurso}</span>,
        realizado em <span className="font-semibold">{courseDetails.dataCurso}</span>, com carga horária total de <span className="font-semibold">{courseDetails.cargaHoraria}</span>.
      </p>
       <div className="mt-auto flex justify-between w-full items-end">
            <div className="text-center">
                <p className="border-t-2 border-gray-700 px-8 pt-2 text-sm">Coordenação do Curso</p>
            </div>
            <div className="text-center">
                <p className="text-sm">Emitido em {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
        </div>
    </div>
  );
};

export default CertificateTemplate;
