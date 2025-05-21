import Header from "./Components/Header/Header";

import "./App.css";

function App() {
  const bgColor = "bg-transparent";

  return (
    <div /*className={`${bgColor} border min-h-screen w-full`}*/>
      <Header />
      {/* <div className="grid grid-cols-[3fr_1fr] px-6 mt-8 poppins gap-4 "></div> */}
    </div>
  );
}

export default App;
