// import { createRootRoute, Outlet } from "@tanstack/react-router";
// import { TanStackRouterDevtools } from "@tanstack/router-devtools";
// import { Toaster } from "@/components/ui/toaster";
// // import { createContext, useContext, useState } from "react";
// import { ResultProvider } from "../components/ResultProvider";

// const RouterComponent = () => {
//   // const ResultContext = createContext([]);
//   // const [ctxResult , setCtxResult] = useState<any[]>([]);
//   return (
//     <>
//       {
//         /*<ResultContext.Provider value={{ctxResult , setCtxResult}}>
//       </ResultContext.Provider>*/
//       }

//       <ResultProvider>
//         <Outlet />
//       </ResultProvider>
//       <Toaster />
//       <TanStackRouterDevtools />
//     </>
//   );
// };

// export const Route = createRootRoute({
//   component: RouterComponent,
// });

import { ResultProvider } from "../components/ResultProvider";
import { createRootRoute, Outlet } from "@tanstack/react-router";
// import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Toaster } from "@/components/ui/toaster";

const RouterComponent = () => {
  return (
    <>
        <ResultProvider>
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
