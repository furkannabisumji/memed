import HowItWorks from "@/components/HowItWorks";
import LandingHero from "@/components/LandingHero";
import Footer from "@/components/shared/Footer";
import Header from "@/components/shared/Header";
import LeaderboardTable from "@/components/shared/LeaderboardTable";

export default function Home() {
  return (
    <>
      <div className="main flex flex-col min-h-screen w-full">
        <div className="relative h-screen">
          <img src={'/Perspective Grid.svg'} alt="curve" className="w-full h-screen absolute -z-40"/>
          <Header />
          <LandingHero />
        </div>
        <HowItWorks />
        <div className="md:p-20 md:px-40 min-h-screen flex flex-col items-center justify-center md:gap-10 ">
          <h2 className="font-clash font-bold text-4xl text-center mb-10">Trending Meme Tokens</h2>
          <LeaderboardTable />
        </div>
      </div>


      {/* Footer */}
      <Footer />
    </>
  );
}
