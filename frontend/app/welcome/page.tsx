import LandingHero from "@/components/LandingHero";
import Footer from "@/components/shared/Footer";
import Header from "@/components/shared/Header";
import { Welcome } from "@/components/shared/welcome";

export default function Home() {
  return (
    <>
      <div className="main flex flex-col min-h-screen w-full">
        <div className="relative ">
          <Header />
        </div>
        <Welcome />
      </div>

      {/* Footer */}
      <Footer />
    </>
  );
}
