
import { type ProcessedStudent, type Student, type CourseDetails } from './types';

// Declare global variables from CDN scripts for TypeScript
declare const XLSX: any;
declare const Fuse: any;
declare const html2canvas: any;
declare const jspdf: any;

// Helper to read an array buffer from a file
const readFile = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
    reader.onerror = (e) => reject(new Error("File reading error"));
    reader.readAsArrayBuffer(file);
  });
};

// Function to normalize names for better matching
const normalizeName = (name: string): string => {
  if (!name) return '';
  return name
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, '');
};

export const processSpreadsheets = async (
  studentFile: File,
  attendanceFile: File,
  totalClasses: number
): Promise<ProcessedStudent[]> => {
  try {
    const [studentData, attendanceData] = await Promise.all([
      readFile(studentFile),
      readFile(attendanceFile)
    ]);

    const studentWb = XLSX.read(studentData, { type: 'array' });
    const studentSheet = studentWb.Sheets[studentWb.SheetNames[0]];
    const officialStudents: Student[] = XLSX.utils.sheet_to_json(studentSheet);

    const attendanceWb = XLSX.read(attendanceData, { type: 'array' });
    const attendanceSheet = attendanceWb.Sheets[attendanceWb.SheetNames[0]];
    const attendanceList: { [key: string]: string }[] = XLSX.utils.sheet_to_json(attendanceSheet);
    
    // Assuming the first column in the attendance sheet contains the names.
    const attendanceNameKey = Object.keys(attendanceList[0])[0];
    const attendanceNames = attendanceList.map(row => row[attendanceNameKey]);

    const normalizedOfficialStudents = officialStudents.map((student, index) => ({
        ...student,
        id: `${index}-${student.Email}`,
        normalizedName: normalizeName(student['Nome Completo'])
    }));

    const fuse = new Fuse(normalizedOfficialStudents, {
      keys: ['normalizedName'],
      threshold: 0.4, // Corresponds to a less strict matching
      includeScore: true,
    });

    const attendanceCounts: { [key: string]: number } = {};
    normalizedOfficialStudents.forEach(student => {
        attendanceCounts[student.id] = 0;
    });

    for (const name of attendanceNames) {
      const normalizedName = normalizeName(name);
      const result = fuse.search(normalizedName);
      if (result.length > 0) {
        // The first result is the best match
        const bestMatch = result[0].item;
        attendanceCounts[bestMatch.id]++;
      }
    }
    
    return normalizedOfficialStudents.map(student => ({
      ...student,
      aulasPresente: attendanceCounts[student.id],
      percentualFrequencia: totalClasses > 0 ? (attendanceCounts[student.id] / totalClasses) * 100 : 0,
      status: 'Pendente',
    }));

  } catch (error) {
    console.error("Error processing spreadsheets:", error);
    throw error;
  }
};

export const exportToXlsx = (data: ProcessedStudent[], fileName: string) => {
  const ws = XLSX.utils.json_to_sheet(data.map(d => ({
    "Nome Completo": d["Nome Completo"],
    "Email": d.Email,
    "Aulas Presente": d.aulasPresente,
    "Percentual Frequencia (%)": d.percentualFrequencia.toFixed(2),
    "Status": d.status,
  })));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Resultados Frequencia");
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

export const generatePdf = async (elementId: string, fileName: string) => {
    const { jsPDF } = jspdf;
    const certificateElement = document.getElementById(elementId);
    if (!certificateElement) {
        console.error("Certificate element not found!");
        return;
    }

    const canvas = await html2canvas(certificateElement, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        logging: false,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${fileName}.pdf`);
};
