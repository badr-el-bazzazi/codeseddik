import { createContext, useState, ReactNode } from 'react';

interface resultType {
  questionId: number;
  correct: boolean;
}

interface ResultContextType {
  children: ReactNode;
  getResult: () => resultType[];
  resultContext: resultType[];
  setResultContext: React.Dispatch<React.SetStateAction<resultType[]>>;
  mode: string;
  setMode: React.Dispatch<React.SetStateAction<string>>;
}

export const ResultContext = createContext<ResultContextType | undefined>(undefined);

export const ResultProvider = ({ children }: ResultContextType) => {
  const [resultContext, setResultContext] = useState<resultType[]>([]);
  const [mode, setMode] = useState('');

  const getResult = (): resultType[] => {
    return resultContext;
  };

  return (
    <ResultContext.Provider
      value={{ children, getResult, resultContext, setResultContext, mode, setMode }}
    >
      {children}
    </ResultContext.Provider>
  );
};
