// import { ResultProvider } from "../components/ResultProvider";
// import { createRootRoute, Outlet } from "@tanstack/react-router";
// import { Toaster } from "@/components/ui/toaster";

// const RouterComponent = () => {
//   return (
//     <>
//         <ResultProvider>
//           <Outlet />
//         </ResultProvider>
//         <Toaster />
//         {/*<TanStackRouterDevtools />*/}
//     </>
//   );
// };

// export const Route = createRootRoute({
//   component: RouterComponent,
// });


import { ResultProvider } from "../components/ResultProvider";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/toaster";
import { useState } from "react";


interface resultType {
  questionId: number;
  correct: boolean;
}
const RouterComponent = () => {
  const [resultContext, setResultContext] = useState<resultType[]>([]);
  const [mode, setMode] = useState("");

  const getResult = (): resultType[] => {
    return resultContext;
  };

  return (
    <>
      <ResultProvider
        getResult={getResult}
        resultContext={resultContext}
        setResultContext={setResultContext}
        mode={mode}
        setMode={setMode}
      >
        <Outlet />
      </ResultProvider>
      <Toaster />
      {/*<TanStackRouterDevtools />*/}
    </>
  );
};

export const Route = createRootRoute({
  component: RouterComponent,
});
