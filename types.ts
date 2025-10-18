
export interface Student {
  "Nome Completo": string;
  Email: string;
}

export interface ProcessedStudent extends Student {
  id: string;
  aulasPresente: number;
  percentualFrequencia: number;
  status: 'Aprovado' | 'Reprovado' | 'Pendente';
}

export interface CourseDetails {
  nomeCurso: string;
  cargaHoraria: string;
  dataCurso: string;
}
