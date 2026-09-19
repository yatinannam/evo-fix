import { DesktopPageScaler } from "./layout/DesktopPageScaler";
import { MobilePageScaler } from "./layout/MobilePageScaler";
import { useMediaQuery } from "./hooks/useMediaQuery";

const MOBILE_BREAKPOINT = "(max-width: 767px)";

export default function App() {
  return (
    <>
      <div className="block md:hidden w-full">
        <MobilePageScaler />
      </div>
      <div className="hidden md:block w-full">
        <DesktopPageScaler />
      </div>
    </>
  );
}
