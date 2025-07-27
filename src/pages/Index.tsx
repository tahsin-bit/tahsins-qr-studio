import { Header } from "@/components/Header";
import { QRGenerator } from "@/components/QRGenerator";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-12 px-6">
        <QRGenerator />
      </main>
    </div>
  );
};

export default Index;
