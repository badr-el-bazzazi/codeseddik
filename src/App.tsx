// import { useState } from "react";
// import reactLogo from "./assets/react.svg";
// import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  // const [greetMsg, setGreetMsg] = useState("");
  // const [name, setName] = useState("");

  // async function greet() {
  //   // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
  //   // setGreetMsg(await invoke("greet", { name }));
  // }


  return (
    <div className="container mx-auto w-full h-24 bg-red-700">
      <h1 className={"text-7xl text-center text-white"} >Hello World</h1>
    </div>
  );
}

export default App;
