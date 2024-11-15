import { Children, createContext, useState } from "react";

const ResultContext = createContext([]);

export const ResultProvider = ({ children }) => {
  const [resultContext, setResultContext] = useState();
  const [mode , setMode] = useState("");

  const getResult = () => {
    return resultContext;
  };

  return (
    <ResultContext.Provider value={{ getResult, resultContext, setResultContext , mode , setMode }}>
      {children}
    </ResultContext.Provider>
  );
};


export { ResultContext };
