import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import AuthContextProvider from "./layout/AuthContextProvider";
import InnerApp from "./InnerApp";

const App = () => (
  <AuthContextProvider>
    <InnerApp />
    <ToastContainer
      position="bottom-right"
      autoClose={3000}
      hideProgressBar
      newestOnTop
      closeOnClick
      toastClassName="!rounded-lg !shadow-lg !border !border-border !bg-background !text-foreground text-sm"
    />
  </AuthContextProvider>
);
export default App;