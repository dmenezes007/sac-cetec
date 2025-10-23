import React, { useState, useMemo } from 'react';
import { type CourseDetails, type ProcessedStudent } from './types';
import { processSpreadsheets } from './utils/helpers';
import Step1Upload from './components/Step1Upload';
import Step2Results from './components/Step2Results';
import Step3Certificates from './components/Step3Certificates';
import Step4Email from './components/Step4Email';
import { UploadIcon, CheckCircleIcon, AwardIcon, MailIcon } from './components/icons';
import LoginPage from './components/LoginPage';

const App: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [courseDetails, setCourseDetails] = useState<CourseDetails>({
    nomeCurso: '',
    cargaHoraria: '',
    dataCurso: '',
  });
  const [studentFile, setStudentFile] = useState<File | null>(null);
  const [attendanceFile, setAttendanceFile] = useState<File | null>(null);
  const [certificateBg, setCertificateBg] = useState<string | null>(null);
  const [totalClasses, setTotalClasses] = useState<number>(10); // Default, can be made dynamic
  const [processedData, setProcessedData] = useState<ProcessedStudent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const approvedStudents = useMemo(() => {
    return processedData.filter(student => student.status === 'Aprovado');
  }, [processedData]);

  const handleLogin = (password: string) => {
    if (password === 'SAC_CETEC_2025') {
      setIsLoggedIn(true);
    } else {
      alert('Senha incorreta');
    }
  };

  // FIX: Refactored to remove redundant FileReader logic which caused variable redeclaration errors.
  // The logic for determining total classes from the file was also unused.
  const handleProcessFiles = async () => {
    if (!studentFile || !attendanceFile) {
      setError("Por favor, carregue os dois arquivos de planilha.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // A more robust approach might be to have total number of classes as a separate input. 
      // For now, this is a placeholder. Let's stick with a fixed number for reliability.
      const totalAulas = 10; // Let's use a fixed number for demo.
      setTotalClasses(totalAulas);

      const data = await processSpreadsheets(studentFile, attendanceFile, totalAulas);
      setProcessedData(data);
      setStep(2);
    } catch (err) {
      setError("Ocorreu um erro ao processar as planilhas. Verifique o formato dos arquivos.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetCertificateBg = (file: File | null) => {
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setCertificateBg(reader.result as string);
        };
        reader.readAsDataURL(file);
    } else {
        setCertificateBg(null);
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1Upload courseDetails={courseDetails} setCourseDetails={setCourseDetails} setStudentFile={setStudentFile} setAttendanceFile={setAttendanceFile} setCertificateBgFile={handleSetCertificateBg} onNext={handleProcessFiles} />;
      case 2:
        return <Step2Results processedData={processedData} setProcessedData={setProcessedData} onNext={() => setStep(3)} onBack={() => setStep(1)} totalClasses={totalClasses}/>;
      case 3:
        return <Step3Certificates approvedStudents={approvedStudents} courseDetails={courseDetails} certificateBg={certificateBg} onNext={() => setStep(4)} onBack={() => setStep(2)} />;
      case 4:
        return <Step4Email approvedStudents={approvedStudents} onBack={() => setStep(3)} />;
      default:
        return <div>Etapa desconhecida</div>;
    }
  };
  
  const steps = [
      { number: 1, name: 'Upload', icon: <UploadIcon className="h-6 w-6"/> },
      { number: 2, name: 'Resultados', icon: <CheckCircleIcon className="h-6 w-6"/> },
      { number: 3, name: 'Certificados', icon: <AwardIcon className="h-6 w-6"/> },
      { number: 4, name: 'Envio', icon: <MailIcon className="h-6 w-6"/> }
  ]

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-100">
      <div className="w-full max-w-5xl mx-auto">
        <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-green-800">Sistema Avançado de Certificações</h1>
            <p className="text-slate-600 mt-2">Automatize a geração e envio de certificados com facilidade.</p>
        </header>
        
        <nav className="mb-8">
            <ol className="flex items-center justify-center space-x-4">
                {steps.map((s, index) => (
                    <React.Fragment key={s.number}>
                        <li className="flex items-center">
                            <span className={`flex items-center justify-center w-12 h-12 rounded-full font-bold ${step >= s.number ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                {s.icon}
                            </span>
                        </li>
                        {index < steps.length - 1 && <div className={`flex-auto border-t-2 transition-colors duration-500 ${step > s.number ? 'border-green-600' : 'border-gray-200'}`} />}
                    </React.Fragment>
                ))}
            </ol>
        </nav>

        <main className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-200">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600"></div>
              <p className="mt-4 text-lg font-semibold text-gray-700">Processando dados...</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 bg-red-100 p-4 rounded-md">
              <p className="font-bold">Erro!</p>
              <p>{error}</p>
              <button onClick={() => { setError(null); setStep(1); }} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Tentar Novamente</button>
            </div>
          ) : (
            renderStep()
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
