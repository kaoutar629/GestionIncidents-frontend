import Navbar from "./Navbar";

const BodyContent = ({ children }) => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="p-4 md:p-6 max-w-7xl mx-auto">{children}</main>
  </div>
);

export default BodyContent;
