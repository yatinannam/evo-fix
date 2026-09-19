import { motion } from "motion/react";
import { HeroVideo } from "../components/HeroVideo";
import { RocketParallax } from "../components/RocketParallax";
import {
  DESKTOP_PAGE_HEIGHT,
  DESKTOP_POST_ROCKET_LIFT,
  DESKTOP_SCROLL_ZONE_HEIGHT,
} from "../site/desktopLayout";
import { footerGo, footerToast, openSocial } from "../site/footerActions";
import { desktop, shared } from "../assets/images";
import Image from "next/image";

const {
  imgAccountCircle,
  imgSecurity,
  imgSnippetFolder,
  imgShare,
  imgFolder,
  imgInsertDriveFile,
  img11445426Ba2B4C09Ac9280556D0604081,
  imgAaf2E3D59Df742E69Cb4088821Fd7C631,
  img11445426Ba2B4C09Ac9280556D0604082,
  imgMockupResult,
  imgA9A956Bc93884Afd8De4311B3A4B1A781,
  imgD6B5B3CfD8D24B6A9D67C13C7443F4A63,
  imgUntitledDesign21,
  imgRectangle152,
  imgVector,
  imgVector1,
  imgVector2,
  imgVector3,
  imgGroup,
  imgGroup1,
  imgGroup2,
  imgGroup3,
  imgGroup4,
  imgGroup95,
  imgArrowArrowCircleUpRight,
  imgFolder1,
  imgFolder2,
  imgCursor1,
  imgVector4,
  imgVector5,
  imgMaskGroup,
  imgMaskGroup1,
  imgFavorite,
  imgLine8,
  imgLine10,
  imgLine13,
  imgLine2,
  imgInstagram,
  imgLinkedIn,
  imgArrowArrowCircleUpRight1,
  imgArrowArrowCircleUpRight2,
  imgVector6,
  imgVector9,
  imgVector8,
  imgVector7,
} = { ...desktop, ...shared };

function AccountCircle({ className }: { className?: string }) {
  return (
    <div className={className || "relative size-[64px]"} data-node-id="408:1367" data-name="account_circle">
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgAccountCircle} />
    </div>
  );
}

function Security({ className }: { className?: string }) {
  return (
    <div className={className || "relative size-[44px]"} data-node-id="352:902" data-name="security">
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSecurity} />
    </div>
  );
}

function SnippetFolder({ className }: { className?: string }) {
  return (
    <div className={className || "overflow-clip relative size-[24px]"} data-node-id="352:953" data-name="snippet_folder">
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSnippetFolder} />
    </div>
  );
}

function Share({ className }: { className?: string }) {
  return (
    <div className={className || "relative size-[24px]"} data-node-id="352:839" data-name="share">
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgShare} />
    </div>
  );
}

function Folder({ className }: { className?: string }) {
  return (
    <div className={className || "relative size-[24px]"} data-node-id="352:853" data-name="folder">
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgFolder} />
    </div>
  );
}

function InsertDriveFile({ className }: { className?: string }) {
  return (
    <div className={className || "relative size-[24px]"} data-node-id="352:476" data-name="insert_drive_file">
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgInsertDriveFile} />
    </div>
  );
}

export default function DesktopLandingPage() {
  return (
    <div
      className="bg-white relative w-[1512px] overflow-clip"
      style={{ height: DESKTOP_PAGE_HEIGHT }}
      data-node-id="501:492"
      data-name="EVOCARE Home - Animation"
    >
      <div className="-translate-x-1/2 absolute h-[1777.5px] left-[calc(50%+1.62px)] top-[430px] w-[1455.242px]" data-node-id="501:493">
        <div className="absolute inset-[2.48%_0_0_0]">
          <img alt="" className="block max-w-none size-full" src={imgRectangle152} />
        </div>
      </div>
      <div
        id="three-things-scroll-zone"
        className="absolute bottom-0 left-[85px] pointer-events-none top-[1251px]"
        style={{ height: DESKTOP_SCROLL_ZONE_HEIGHT }}
        data-node-id="501:848"
      >
        <div
          id="three-things-cards"
          className="relative z-10 h-[643px] pointer-events-auto w-[1353px]"
        >
          <div className="absolute inset-[61.12%_29.05%_21.27%_63.64%]" data-node-id="501:495" data-name="Vector">
            <div className="absolute inset-[-1.32%_-2.17%_-1.33%_-1.52%]">
              <img alt="" className="block max-w-none size-full" src={imgVector} />
            </div>
          </div>
          <div className="absolute flex inset-[59.1%_64.45%_23.29%_28.23%] items-center justify-center" data-node-id="501:496" style={{ containerType: "size" }}>
            <div className="-scale-x-100 flex-none h-[100cqh] w-[100cqw]">
              <div className="relative size-full" data-name="Vector">
                <div className="absolute inset-[-1.33%_-1.52%_-1.32%_-2.17%]">
                  <img alt="" className="block max-w-none size-full" src={imgVector1} />
                </div>
              </div>
            </div>
          </div>
          <p
            id="three-things-heading"
            className="[word-break:break-word] absolute font-raleway font-extrabold leading-[normal] left-[calc(50%-676.5px)] text-[#141414] text-[70px] top-[130px] w-[1096px]"
            data-node-id="501:497"
          >
            Three Things. Done Beautifully.
          </p>
          <div className="absolute bottom-0 h-[421px] left-[calc(50%-661.5px)] pointer-events-none top-[222px]" data-node-id="501:505">
            <p className="[word-break:break-word] font-inter font-medium leading-[normal] not-italic pointer-events-auto sticky text-[#6e6e6e] text-[14px] top-0 whitespace-nowrap">Upload once. Organize effortlessly. Share securely, whenever it matters.</p>
          </div>
          <div className="absolute contents left-0 top-[275px]" data-node-id="501:558">
            <div className="absolute bg-white h-[368px] left-0 rounded-[15px] shadow-[8px_8px_20px_0px_rgba(0,0,0,0.25)] top-[275px] w-[391px]" data-node-id="501:559" />
            <p className="[word-break:break-word] absolute font-inter font-bold leading-[normal] left-[132px] not-italic text-[#429ff4] text-[13px] top-[347px] whitespace-nowrap" data-node-id="501:560">
              Drop Your Files Here
            </p>
            <div className="absolute bottom-0 h-[-157px] left-[calc(50%-661.5px)] pointer-events-none top-[525px]" data-node-id="501:561">
              <p className="[word-break:break-word] font-inter font-medium leading-[normal] not-italic pointer-events-auto sticky text-[14px] text-black top-0 w-[358px]">Drag, tap or scan — add prescriptions, reports and scans in seconds.</p>
            </div>
            <div className="absolute bottom-0 h-[-119px] left-[calc(50%-661.5px)] pointer-events-none top-[487px]" data-node-id="501:562">
              <p className="[word-break:break-word] font-inter font-medium leading-[normal] not-italic pointer-events-auto sticky text-[#6e6e6e] text-[12px] top-0 w-[313px]">Bring every report together.</p>
            </div>
            <div className="absolute bg-[rgba(89,161,252,0.3)] border border-[#59a1fc] border-dashed h-[118px] left-[14px] rounded-[8px] top-[288px] w-[365px]" data-node-id="501:563" />
            <div className="absolute inset-[49.46%_84.92%_47.74%_13.9%]" data-node-id="501:564" data-name="Vector">
              <div className="absolute inset-[-5.56%_-6.25%]">
                <img alt="" className="block max-w-none size-full" src={imgVector2} />
              </div>
            </div>
            <div className="absolute inset-[70.45%_97.71%_26.75%_1.11%]" data-node-id="501:565" data-name="Vector">
              <div className="absolute inset-[-8.33%_-9.38%]">
                <img alt="" className="block max-w-none size-full" src={imgVector3} />
              </div>
            </div>
            <div className="absolute bg-white border border-[#429ff4] border-solid h-[37px] left-[87px] rounded-[5px] top-[387px] w-[220px]" data-node-id="501:566" />
            <div className="absolute h-[55px] left-[254px] overflow-clip top-[398px] w-[53px]" data-node-id="501:567" data-name="closedhand 1">
              <div className="absolute contents inset-0" data-node-id="501:568" data-name="Group">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup} />
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup1} />
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup2} />
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup3} />
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup4} />
              </div>
            </div>
            <InsertDriveFile className="absolute inset-[61.28%_91.35%_34.99%_6.87%]" />
            <p className="[word-break:break-word] absolute font-inter font-medium leading-[normal] left-[124px] not-italic text-[12px] text-black top-[395px] whitespace-nowrap" data-node-id="501:590">
              BloodReports.pdf
            </p>
            <div className="absolute h-0 left-[125px] top-[416px] w-[136px]" data-node-id="501:591">
              <div className="absolute inset-[-3px_0_0_0]">
                <img alt="" className="block max-w-none size-full" src={imgGroup95} />
              </div>
            </div>
            <p className="[word-break:break-word] absolute font-inter font-black leading-[normal] left-[calc(50%-635.5px)] not-italic text-[#429ff4] text-[24px] top-[448px] whitespace-nowrap" data-node-id="501:594">
              UPLOAD
            </p>
            <div className="absolute contents left-[14px] top-[586px]" data-node-id="501:595">
              <div className="absolute bg-[#aff2fb] h-[39px] left-[14px] rounded-[8px] shadow-[2px_2px_10px_0px_rgba(0,0,0,0.25)] top-[586px] w-[365px]" data-node-id="501:596" />
              <p className="[word-break:break-word] absolute font-inter font-semibold leading-[normal] left-[calc(50%-566.5px)] not-italic text-[16px] text-black top-[596px] whitespace-nowrap" data-node-id="501:597">
                Upload Records
              </p>
              <div className="absolute left-[253px] size-[29px] top-[591px]" data-node-id="501:598" data-name="Arrow / Arrow_Circle_Up_Right">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgArrowArrowCircleUpRight} />
              </div>
            </div>
          </div>
          <div className="absolute contents left-[481px] top-[275px]" data-node-id="501:599">
            <div className="absolute bg-white h-[368px] left-[481px] rounded-[15px] shadow-[8px_8px_20px_0px_rgba(0,0,0,0.25)] top-[275px] w-[391px]" data-node-id="501:600" />
            <div className="absolute bottom-0 h-[-157px] left-[calc(50%-179.5px)] pointer-events-none top-[525px]" data-node-id="501:601">
              <p className="[word-break:break-word] font-inter font-medium leading-[normal] not-italic pointer-events-auto sticky text-[14px] text-black top-0 w-[358px]">Smart categories keep every document exactly where you expect it.</p>
            </div>
            <div className="absolute bottom-0 h-[-119px] left-[calc(50%-178.5px)] pointer-events-none top-[487px]" data-node-id="501:602">
              <p className="[word-break:break-word] font-inter font-medium leading-[normal] not-italic pointer-events-auto sticky text-[#6e6e6e] text-[12px] top-0 w-[313px]">Find files without searching.</p>
            </div>
            <div className="absolute bg-[rgba(66,159,244,0.23)] border-2 border-[#429ff4] border-solid h-[37px] left-[532px] rounded-[5px] top-[292px] w-[323px]" data-node-id="501:603" />
            <div className="absolute bg-[rgba(182,66,244,0.2)] border border-[#b642f4] border-solid h-[37px] left-[513px] rounded-[5px] top-[340px] w-[342px]" data-node-id="501:604" />
            <div className="absolute bg-[rgba(16,165,0,0.19)] border border-[#0eab00] border-solid h-[37px] left-[498px] rounded-[5px] top-[388px] w-[357px]" data-node-id="501:605" />
            <p className="[word-break:break-word] absolute font-inter font-medium leading-[normal] left-[572px] not-italic text-[12px] text-black top-[303px] whitespace-nowrap" data-node-id="501:606">
              Cardiology
            </p>
            <p className="[word-break:break-word] absolute font-inter font-medium leading-[normal] left-[553px] not-italic text-[12px] text-black top-[351px] whitespace-nowrap" data-node-id="501:607">
              Lab Results
            </p>
            <p className="[word-break:break-word] absolute font-inter font-medium leading-[normal] left-[535px] not-italic text-[12px] text-black top-[399px] whitespace-nowrap" data-node-id="501:608">
              Prescriptions
            </p>
            <p className="[word-break:break-word] absolute font-inter font-black leading-[normal] left-[calc(50%-146.5px)] not-italic text-[#429ff4] text-[24px] top-[449px] whitespace-nowrap" data-node-id="501:609">
              SELECT
            </p>
            <Folder className="absolute left-[522px] size-[24px] top-[347px]" />
            <div className="absolute left-[541px] size-[24px] top-[299px]" data-node-id="501:611" data-name="folder">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgFolder1} />
            </div>
            <div className="absolute left-[498px] size-[24px] top-[452px]" data-node-id="501:612" data-name="folder">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgFolder1} />
            </div>
            <div className="absolute left-[504px] size-[24px] top-[395px]" data-node-id="501:613" data-name="folder">
              <img loading="lazy" alt="" className="absolute block inset-0 max-w-none size-full" src={imgFolder2} />
            </div>
            <div className="absolute left-[677px] size-[28px] top-[318px]" data-node-id="501:614" data-name="cursor 1">
              <img loading="lazy" alt="" className="absolute block inset-0 max-w-none size-full" src={imgCursor1} />
            </div>
            <div className="absolute bg-[rgba(66,159,244,0.25)] h-[19px] left-[788px] rounded-[5px] top-[301px] w-[55px]" data-node-id="501:619" />
            <div className="absolute bg-[rgba(182,66,244,0.25)] h-[19px] left-[788px] rounded-[5px] top-[349px] w-[55px]" data-node-id="501:620" />
            <div className="absolute bg-[rgba(85,193,75,0.25)] h-[19px] left-[788px] rounded-[5px] top-[397px] w-[55px]" data-node-id="501:621" />
            <p className="[word-break:break-word] absolute font-inter font-medium leading-[normal] left-[801px] not-italic text-[#0080f5] text-[10px] top-[305px] whitespace-nowrap" data-node-id="501:622">
              2 files
            </p>
            <p className="[word-break:break-word] absolute font-inter font-medium leading-[normal] left-[799px] not-italic text-[#6100e0] text-[10px] top-[353px] whitespace-nowrap" data-node-id="501:623">
              13 files
            </p>
            <p className="[word-break:break-word] absolute font-inter font-medium leading-[normal] left-[801px] not-italic text-[#097500] text-[10px] top-[400px] whitespace-nowrap" data-node-id="501:624">
              4 files
            </p>
            <div className="absolute contents left-[494px] top-[586px]" data-node-id="501:625">
              <div className="absolute bg-[#aff2fb] h-[39px] left-[494px] rounded-[8px] shadow-[2px_2px_10px_0px_rgba(0,0,0,0.25)] top-[586px] w-[365px]" data-node-id="501:626" />
              <p className="[word-break:break-word] absolute font-inter font-semibold leading-[normal] left-[calc(50%-93.5px)] not-italic text-[16px] text-black top-[596px] whitespace-nowrap" data-node-id="501:627">
                Organize Records
              </p>
              <div className="absolute left-[741px] size-[29px] top-[591px]" data-node-id="501:628" data-name="Arrow / Arrow_Circle_Up_Right">
                <img loading="lazy" alt="" className="absolute block inset-0 max-w-none size-full" src={imgArrowArrowCircleUpRight} />
              </div>
            </div>
          </div>
          <div className="absolute contents left-[962px] top-[275px]" data-node-id="501:629">
            <div className="absolute bg-white h-[368px] left-[962px] rounded-[15px] shadow-[8px_8px_20px_0px_rgba(0,0,0,0.25)] top-[275px] w-[391px]" data-node-id="501:630" />
            <div className="absolute bottom-0 h-[-157px] left-[calc(50%+317.5px)] pointer-events-none top-[525px]" data-node-id="501:631">
              <p className="[word-break:break-word] font-inter font-medium leading-[normal] not-italic pointer-events-auto sticky text-[14px] text-black top-0 w-[329px]">Send records securely to any doctor or family member, instantly.</p>
            </div>
            <div className="absolute bottom-0 h-[-119px] left-[calc(50%+315.5px)] pointer-events-none top-[487px]" data-node-id="501:632">
              <p className="[word-break:break-word] font-inter font-medium leading-[normal] not-italic pointer-events-auto sticky text-[#6e6e6e] text-[12px] top-0 w-[313px]">Secure sharing, made simple.</p>
            </div>
            <p className="[word-break:break-word] absolute font-inter font-black leading-[normal] left-[calc(50%+344.5px)] not-italic text-[#429ff4] text-[24px] top-[449px] whitespace-nowrap" data-node-id="501:633">
              SHARE
            </p>
            <Share className="absolute left-[989px] size-[24px] top-[452px]" />
            <div className="absolute inset-[55.21%_14.63%_35.61%_80.71%]" data-node-id="501:635" data-name="Vector">
              <div className="absolute inset-[-2.56%_-2.38%_-2.54%_-2.38%]">
                <img loading="lazy" alt="" className="block max-w-none size-full" src={imgVector4} />
              </div>
            </div>
            <div className="absolute flex inset-[48.87%_9.68%_37.79%_85.96%] items-center justify-center" data-node-id="501:636" style={{ containerType: "size" }}>
              <div className="flex-none h-[100cqh] rotate-180 w-[100cqw]">
                <div className="relative size-full" data-name="Vector">
                  <div className="absolute inset-[-1.75%_-2.54%]">
                    <img loading="lazy" alt="" className="block max-w-none size-full" src={imgVector5} />
                  </div>
                </div>
              </div>
            </div>
            <Security className="absolute left-[1136px] size-[44px] top-[333px]" />
            <div className="absolute bg-white h-[112px] left-[992px] rounded-[5px] shadow-[3px_3px_10px_0px_rgba(0,0,0,0.25)] top-[313px] w-[100px]" data-node-id="501:638" />
            <div className="absolute bg-white h-[112px] left-[1223px] rounded-[5px] shadow-[3px_3px_10px_0px_rgba(0,0,0,0.25)] top-[313px] w-[100px]" data-node-id="501:639" />
            <div className="absolute left-[1014px] size-[55px] top-[317px]" data-node-id="501:640" data-name="Mask group">
              <img loading="lazy" alt="" className="absolute block inset-0 max-w-none size-full" src={imgMaskGroup} />
            </div>
            <div className="absolute left-[1237px] size-[72px] top-[306px]" data-node-id="501:643" data-name="Mask group">
              <img loading="lazy" alt="" className="absolute block inset-0 max-w-none size-full" src={imgMaskGroup1} />
            </div>
            <SnippetFolder className="absolute left-[1029px] overflow-clip size-[24px] top-[388px]" />
            <SnippetFolder className="absolute left-[1261px] overflow-clip size-[24px] top-[388px]" />
            <p className="[word-break:break-word] absolute font-inter font-normal leading-[normal] left-[1025px] not-italic text-[10px] text-black top-[366px] whitespace-nowrap" data-node-id="501:648">
              Patient
            </p>
            <p className="[word-break:break-word] absolute font-inter font-normal leading-[normal] left-[1256px] not-italic text-[10px] text-black top-[366px] whitespace-nowrap" data-node-id="501:649">
              Doctor
            </p>
            <div className="absolute contents left-[976px] top-[586px]" data-node-id="501:650">
              <div className="absolute bg-[#aff2fb] h-[39px] left-[976px] rounded-[8px] shadow-[2px_2px_10px_0px_rgba(0,0,0,0.25)] top-[586px] w-[365px]" data-node-id="501:651" />
              <p className="[word-break:break-word] absolute font-inter font-semibold leading-[normal] left-[calc(50%+399.5px)] not-italic text-[16px] text-black top-[596px] whitespace-nowrap" data-node-id="501:652">
                Share Securely
              </p>
              <div className="absolute left-[1213px] size-[29px] top-[591px]" data-node-id="501:653" data-name="Arrow / Arrow_Circle_Up_Right">
                <img loading="lazy" alt="" className="absolute block inset-0 max-w-none size-full" src={imgArrowArrowCircleUpRight} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        id="launching-first"
        className="absolute bg-white h-[3326px] left-0 top-[3087px] w-[1507px]"
        style={{ transform: `translateY(-${DESKTOP_POST_ROCKET_LIFT}px)` }}
        data-node-id="501:849"
      >
        <p className="[word-break:break-word] absolute font-raleway font-extrabold leading-[normal] left-[calc(50%-659.5px)] text-[#141414] text-[70px] top-[218px] whitespace-nowrap" data-node-id="501:494">
          Launching First
        </p>
        <div className="absolute bottom-0 h-[2866px] left-[calc(50%-655.5px)] pointer-events-none top-[310px]" data-node-id="501:498">
          <p className="[word-break:break-word] font-inter font-medium leading-[normal] not-italic pointer-events-auto sticky text-[#6e6e6e] text-[14px] top-0 whitespace-nowrap">The first features arriving with Evocare at launch.</p>
        </div>
        <div className="absolute bottom-0 h-[2561px] left-[calc(50%-655.5px)] pointer-events-none top-[615px]" data-node-id="501:499">
          <p className="[word-break:break-word] font-inter font-medium leading-[normal] not-italic pointer-events-auto sticky text-[#6e6e6e] text-[14px] top-0 w-[605px]">Store prescriptions, lab reports, scans and medical records in one secure place, beautifully organized and ready whenever you need them.</p>
        </div>
        <div className="absolute bottom-0 h-[2063px] left-[calc(50%+16.5px)] pointer-events-none top-[1263px]" data-node-id="501:500">
          <p className="[word-break:break-word] font-inter font-medium leading-[normal] not-italic pointer-events-auto sticky text-[#6e6e6e] text-[14px] top-0 w-[560px]">Receive simple, timely reminders that help you stay on track with your medicines, every single day.</p>
        </div>
        <div className="absolute bottom-0 h-[3125px] left-[calc(50%-655.5px)] pointer-events-none top-[201px]" data-node-id="501:501">
          <p className="[word-break:break-word] font-inter font-medium leading-[normal] not-italic pointer-events-auto sticky text-[#429ff4] text-[14px] top-0 whitespace-nowrap">Pre-Launch Features</p>
        </div>
        <div className="absolute bottom-0 h-[2922px] left-[calc(50%-655.5px)] pointer-events-none top-[404px]" data-node-id="501:503">
          <p className="[word-break:break-word] font-inter font-bold leading-[normal] not-italic pointer-events-auto sticky text-[#429ff4] text-[14px] top-0 whitespace-nowrap">Store · Sort · Share</p>
        </div>
        <div className="absolute bottom-0 h-[2216px] left-[calc(50%+14.5px)] pointer-events-none top-[1110px]" data-node-id="501:504">
          <p className="[word-break:break-word] font-inter font-bold leading-[normal] not-italic pointer-events-auto sticky text-[#429ff4] text-[14px] top-0 whitespace-nowrap">Medicine Reminder</p>
        </div>
        <div className="absolute h-[664px] left-[734px] top-[369px] w-[724px]" data-node-id="501:506" data-name="11445426-ba2b-4c09-ac92-80556d060408 1">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img loading="lazy" alt="" className="absolute h-[144.65%] left-0 max-w-none top-[-10.84%] w-[199.74%]" src={img11445426Ba2B4C09Ac9280556D0604081} />
          </div>
        </div>
        <div className="absolute h-[632px] left-[771px] top-[1740px] w-[608px]" data-node-id="589:333" data-name="aaf2e3d5-9df7-42e6-9cb4-088821fd7c63 1">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img loading="lazy" alt="" className="absolute h-[126.73%] left-0 max-w-none top-[-8.04%] w-[205.35%]" src={imgAaf2E3D59Df742E69Cb4088821Fd7C631} />
          </div>
        </div>
        <div className="absolute h-[596px] left-[60px] top-[1080px] w-[681px]" data-node-id="501:507" data-name="11445426-ba2b-4c09-ac92-80556d060408 2">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img loading="lazy" alt="" className="absolute h-[152.04%] left-[-99.48%] max-w-none top-[-17.62%] w-[199.48%]" src={img11445426Ba2B4C09Ac9280556D0604082} />
          </div>
        </div>
        <div className="[word-break:break-word] absolute font-inter font-black leading-[0] left-[calc(50%-655.5px)] not-italic text-[#000400] text-[48px] top-[426px] w-[647px]" data-node-id="501:556">
          <p className="leading-[normal] mb-0">All Your Health Documents.</p>
          <p className="leading-[normal] text-[#429ff4]">One Secure Home.</p>
        </div>
        <div className="[word-break:break-word] absolute font-inter font-black leading-[0] left-[calc(50%+14.5px)] not-italic text-[#000400] text-[48px] top-[1132px] w-[679px]" data-node-id="501:557">
          <p className="leading-[normal] mb-0">Never Miss</p>
          <p>
            <span className="leading-[normal]">{`A Dose `}</span>
            <span className="leading-[normal] text-[#429ff4]">Again.</span>
          </p>
        </div>
        <div className="-translate-x-1/2 absolute contents left-1/2 top-[3085px]" data-node-id="501:673">
          <div className="absolute bg-[#f5f5f7] h-[120px] left-[139px] rounded-[25px] top-[3085px] w-[1229px]" data-node-id="501:674" />
          <div className="absolute left-[1016.65px] size-[62.707px] top-[3117.01px]" data-node-id="501:675" data-name="favorite">
            <img loading="lazy" alt="" className="absolute block inset-0 max-w-none size-full" src={imgFavorite} />
          </div>
          <div className="absolute flex h-[68.165px] items-center justify-center left-[537px] top-[3113.8px] w-0" data-node-id="501:676">
            <div className="-rotate-90 flex-none">
              <div className="h-0 relative w-[68.165px]">
                <div className="absolute inset-[-4px_0_0_0]">
                  <img loading="lazy" alt="" className="block max-w-none size-full" src={imgLine8} />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[68.165px] items-center justify-center left-[946px] top-[3113.8px] w-0" data-node-id="501:677">
            <div className="-rotate-90 flex-none">
              <div className="h-0 relative w-[68.165px]">
                <div className="absolute inset-[-4px_0_0_0]">
                  <img loading="lazy" alt="" className="block max-w-none size-full" src={imgLine8} />
                </div>
              </div>
            </div>
          </div>
          <Security className="absolute left-[209.65px] size-[62.707px] top-[3117.01px]" />
          <AccountCircle className="absolute left-[607.65px] size-[62.707px] top-[3117.01px]" />
          <div className="absolute bottom-0 h-[-3006.28px] left-[calc(50%-455.5px)] pointer-events-none top-[3126.28px]" data-node-id="501:680">
            <div className="[word-break:break-word] font-inter font-medium h-[44.16px] leading-[0] not-italic pointer-events-auto sticky text-[#636363] text-[14px] top-0 tracking-[0.42px] w-[169px]">
              <p className="leading-[138.2550048828125%] mb-0">Your Data 100% Secure.</p>
              <p className="leading-[138.2550048828125%]">End-To-End Encryption.</p>
            </div>
          </div>
          <div className="absolute bottom-0 h-[-3005.32px] left-[calc(50%+353.5px)] pointer-events-none top-[3125.32px]" data-node-id="501:681">
            <div className="[word-break:break-word] font-inter font-medium h-[44.16px] leading-[0] not-italic pointer-events-auto sticky text-[#636363] text-[14px] top-0 tracking-[0.42px] w-[191px]">
              <p className="leading-[138.2550048828125%] mb-0">Built With Care.</p>
              <p className="leading-[138.2550048828125%]">{`For You & Your Loved Ones`}</p>
            </div>
          </div>
          <div className="absolute bottom-0 h-[-3006.28px] left-[calc(50%-57.5px)] pointer-events-none top-[3126.28px]" data-node-id="501:682">
            <div className="[word-break:break-word] font-inter font-medium h-[44.16px] leading-[0] not-italic pointer-events-auto sticky text-[#636363] text-[14px] top-0 tracking-[0.42px] w-[180px]">
              <p className="leading-[138.2550048828125%] mb-0">You Are In Control.</p>
              <p className="leading-[138.2550048828125%]">Your Health, Your Privacy</p>
            </div>
          </div>
        </div>
        <div className="absolute h-0 left-[98px] top-[681px] w-[123px]" data-node-id="501:683">
          <div className="absolute inset-[-3px_0_0_0]">
            <img loading="lazy" alt="" className="block max-w-none size-full" src={imgLine10} />
          </div>
        </div>
        <div className="absolute bottom-0 h-[1420px] left-[calc(50%-653.5px)] pointer-events-none top-[1906px]" data-node-id="589:274">
          <p className="[word-break:break-word] font-inter font-medium leading-[normal] not-italic pointer-events-auto sticky text-[#6e6e6e] text-[14px] top-0 w-[605px]">{`Parents, kids, grandparents — manage your whole family's health from a single, secure account. No separate logins, no scattered records.`}</p>
        </div>
        <div className="absolute bottom-0 h-[1573px] left-[calc(50%-653.5px)] pointer-events-none top-[1753px]" data-node-id="589:275">
          <p className="[word-break:break-word] font-inter font-bold leading-[normal] not-italic pointer-events-auto sticky text-[#429ff4] text-[14px] top-0 whitespace-nowrap">Family Health Management</p>
        </div>
        <p className="[word-break:break-word] absolute font-inter font-black leading-[0] left-[calc(50%-653.5px)] not-italic text-[#000400] text-[48px] top-[1775px] w-[510px]" data-node-id="589:276">
          <span className="leading-[normal]">{`One Dashboard. Every `}</span>
          <span className="leading-[normal] text-[#429ff4]">Loved One.</span>
        </p>
        <div className="absolute h-0 left-[100px] top-[1972px] w-[123px]" data-node-id="589:277">
          <div className="absolute inset-[-3px_0_0_0]">
            <img loading="lazy" alt="" className="block max-w-none size-full" src={imgLine10} />
          </div>
        </div>
        <div className="absolute h-0 left-[768px] top-[1327px] w-[123px]" data-node-id="501:684">
          <div className="absolute inset-[-3px_0_0_0]">
            <img loading="lazy" alt="" className="block max-w-none size-full" src={imgLine10} />
          </div>
        </div>
        <div className="absolute contents left-[97px] top-[697px]" data-node-id="589:351">
          <p className="[word-break:break-word] absolute font-inter font-black h-[98.6px] leading-[normal] left-[calc(50%-442.5px)] not-italic text-[96px] text-[transparent] top-[697px] w-[62px]" data-node-id="589:352">
            2
          </p>
          <p className="[word-break:break-word] absolute font-inter font-black h-[98.6px] leading-[normal] left-[calc(50%-656.5px)] not-italic text-[96px] text-[transparent] top-[697px] w-[48px]" data-node-id="589:353">
            1
          </p>
          <p className="[word-break:break-word] absolute font-inter font-black h-[98.6px] leading-[normal] left-[calc(50%-227.5px)] not-italic text-[96px] text-[transparent] top-[697px] w-[63px]" data-node-id="589:354">
            3
          </p>
          <div className="absolute bg-[#f5f5f7] h-[181.05px] left-[120px] rounded-[10px] shadow-[4px_4px_20px_0px_rgba(0,0,0,0.25)] top-[753.95px] w-[161px]" data-node-id="589:355" />
          <div className="absolute bg-[#f5f5f7] h-[181.05px] left-[330px] rounded-[10px] shadow-[4px_4px_20px_0px_rgba(0,0,0,0.25)] top-[753.95px] w-[162px]" data-node-id="589:356" />
          <div className="absolute bg-[#f5f5f7] h-[181.05px] left-[541px] rounded-[10px] shadow-[4px_4px_20px_0px_rgba(0,0,0,0.25)] top-[753.95px] w-[162px]" data-node-id="589:357" />
          <p className="[word-break:break-word] absolute font-inter font-black leading-[normal] left-[calc(50%-593.5px)] not-italic text-[#429ff4] text-[24px] top-[771px] whitespace-nowrap" data-node-id="589:358">
            STORE
          </p>
          <p className="[word-break:break-word] absolute font-inter font-black leading-[normal] left-[calc(50%-376.5px)] not-italic text-[#429ff4] text-[24px] top-[771px] whitespace-nowrap" data-node-id="589:359">
            SORT
          </p>
          <p className="[word-break:break-word] absolute font-inter font-black leading-[normal] left-[calc(50%-174.5px)] not-italic text-[#429ff4] text-[24px] top-[771px] whitespace-nowrap" data-node-id="589:360">
            SHARE
          </p>
          <div className="absolute bottom-0 h-[-580.5498016357421px] left-[calc(50%-552.5px)] pointer-events-none top-[818.55px]" data-node-id="589:361">
            <p className="-translate-x-1/2 [word-break:break-word] font-inter font-medium h-[43.35px] leading-[normal] not-italic pointer-events-auto sticky text-[14px] text-black text-center top-0 w-[136px]">Keep every record secure and ready whenever you need it.</p>
          </div>
          <div className="absolute bottom-0 h-[-580.5498016357421px] left-[calc(50%-342.5px)] pointer-events-none top-[818.55px]" data-node-id="589:362">
            <p className="-translate-x-1/2 [word-break:break-word] font-inter font-medium h-[57.8px] leading-[normal] not-italic pointer-events-auto sticky text-[14px] text-black text-center top-0 w-[136px]">Find the right document in seconds, not minutes.</p>
          </div>
          <div className="absolute bottom-0 h-[-580.5498016357421px] left-[calc(50%-131.5px)] pointer-events-none top-[818.55px]" data-node-id="589:363">
            <p className="-translate-x-1/2 [word-break:break-word] font-inter font-medium h-[72.25px] leading-[normal] not-italic pointer-events-auto sticky text-[14px] text-black text-center top-0 w-[136px]">Share important records instantly with doctors or loved ones.</p>
          </div>
        </div>
        <div className="absolute contents left-[99px] top-[2002px]" data-node-id="589:284">
          <p className="[word-break:break-word] absolute font-inter font-black h-[98.6px] leading-[normal] left-[calc(50%-440.5px)] not-italic text-[96px] text-[transparent] top-[2002px] w-[62px]" data-node-id="589:285">
            2
          </p>
          <p className="[word-break:break-word] absolute font-inter font-black h-[98.6px] leading-[normal] left-[calc(50%-654.5px)] not-italic text-[96px] text-[transparent] top-[2002px] w-[48px]" data-node-id="589:286">
            1
          </p>
          <p className="[word-break:break-word] absolute font-inter font-black h-[98.6px] leading-[normal] left-[calc(50%-225.5px)] not-italic text-[96px] text-[transparent] top-[2002px] w-[63px]" data-node-id="589:287">
            3
          </p>
          <div className="absolute bg-[#f5f5f7] h-[181.05px] left-[122px] rounded-[10px] shadow-[4px_4px_20px_0px_rgba(0,0,0,0.25)] top-[2058.95px] w-[161px]" data-node-id="589:288" />
          <div className="absolute bg-[#f5f5f7] h-[181.05px] left-[332px] rounded-[10px] shadow-[4px_4px_20px_0px_rgba(0,0,0,0.25)] top-[2058.95px] w-[162px]" data-node-id="589:289" />
          <div className="absolute bg-[#f5f5f7] h-[181.05px] left-[543px] rounded-[10px] shadow-[4px_4px_20px_0px_rgba(0,0,0,0.25)] top-[2058.95px] w-[162px]" data-node-id="589:290" />
          <p className="[word-break:break-word] absolute font-inter font-black h-[24.65px] leading-[normal] left-[calc(50%-578.5px)] not-italic text-[#429ff4] text-[24px] top-[2075.95px] w-[55px]" data-node-id="589:291">
            ADD
          </p>
          <p className="[word-break:break-word] absolute font-inter font-black h-[24.65px] leading-[normal] left-[calc(50%-391.5px)] not-italic text-[#429ff4] text-[24px] top-[2075.95px] w-[102px]" data-node-id="589:292">
            SWITCH
          </p>
          <p className="[word-break:break-word] absolute font-inter font-black h-[24.65px] leading-[normal] left-[calc(50%-185.5px)] not-italic text-[#429ff4] text-[24px] top-[2075.95px] w-[111px]" data-node-id="589:293">
            MANAGE
          </p>
          <div className="absolute bottom-0 h-[-1885.5498016357424px] left-[calc(50%-550.5px)] pointer-events-none top-[2123.55px]" data-node-id="589:294">
            <p className="-translate-x-1/2 [word-break:break-word] font-inter font-medium h-[43.35px] leading-[normal] not-italic pointer-events-auto sticky text-[14px] text-black text-center top-0 w-[136px]">Create a profile for each family member in seconds.</p>
          </div>
          <div className="absolute bottom-0 h-[-1885.5498016357424px] left-[calc(50%-340.5px)] pointer-events-none top-[2123.55px]" data-node-id="589:295">
            <p className="-translate-x-1/2 [word-break:break-word] font-inter font-medium h-[57.8px] leading-[normal] not-italic pointer-events-auto sticky text-[14px] text-black text-center top-0 w-[136px]">Toggle between profiles instantly, right from your dashboard.</p>
          </div>
          <div className="absolute bottom-0 h-[-1885.5498016357424px] left-[calc(50%-129.5px)] pointer-events-none top-[2123.55px]" data-node-id="589:296">
            <p className="-translate-x-1/2 [word-break:break-word] font-inter font-medium h-[72.25px] leading-[normal] not-italic pointer-events-auto sticky text-[14px] text-black text-center top-0 w-[136px]">View records, reminders, and vitals for anyone in your family, anytime.</p>
          </div>
        </div>
        <div className="absolute contents left-[773px] top-[1357px]" data-node-id="589:337">
          <p className="[word-break:break-word] absolute font-inter font-black h-[98.6px] leading-[normal] left-[calc(50%+233.5px)] not-italic text-[96px] text-[transparent] top-[1357px] w-[62px]" data-node-id="589:338">
            2
          </p>
          <p className="[word-break:break-word] absolute font-inter font-black h-[98.6px] leading-[normal] left-[calc(50%+19.5px)] not-italic text-[96px] text-[transparent] top-[1357px] w-[48px]" data-node-id="589:339">
            1
          </p>
          <p className="[word-break:break-word] absolute font-inter font-black h-[98.6px] leading-[normal] left-[calc(50%+448.5px)] not-italic text-[96px] text-[transparent] top-[1357px] w-[63px]" data-node-id="589:340">
            3
          </p>
          <div className="absolute contents left-[796px] top-[1413.95px]" data-node-id="594:717">
            <div className="absolute bg-[#f5f5f7] h-[181.05px] left-[796px] rounded-[10px] shadow-[4px_4px_20px_0px_rgba(0,0,0,0.25)] top-[1413.95px] w-[161px]" data-node-id="589:341" />
            <p className="[word-break:break-word] absolute font-inter font-black leading-[normal] left-[calc(50%+75.5px)] not-italic text-[#429ff4] text-[24px] top-[1431px] whitespace-nowrap" data-node-id="589:344">
              REMIND
            </p>
            <div className="absolute bottom-0 h-[-1297.4999969482421px] left-[calc(50%+123.5px)] pointer-events-none top-[1478.55px]" data-node-id="589:347">
              <p className="-translate-x-1/2 [word-break:break-word] font-inter font-medium h-[43.35px] leading-[normal] not-italic pointer-events-auto sticky text-[14px] text-black text-center top-0 w-[136px]">Stay on time with reminders that fit your daily schedule.</p>
            </div>
          </div>
          <div className="absolute contents left-[1006px] top-[1413.95px]" data-node-id="594:723">
            <div className="absolute bg-[#f5f5f7] h-[181.05px] left-[1006px] rounded-[10px] shadow-[4px_4px_20px_0px_rgba(0,0,0,0.25)] top-[1413.95px] w-[162px]" data-node-id="589:342" />
            <p className="[word-break:break-word] absolute font-inter font-black leading-[normal] left-[calc(50%+278.5px)] not-italic text-[#429ff4] text-[24px] top-[1431px] whitespace-nowrap" data-node-id="589:345">
              ROUTINE
            </p>
            <div className="absolute bottom-0 h-[-1297.4999969482421px] left-[calc(50%+333.5px)] pointer-events-none top-[1478.55px]" data-node-id="589:348">
              <p className="-translate-x-1/2 [word-break:break-word] font-inter font-medium h-[57.8px] leading-[normal] not-italic pointer-events-auto sticky text-[14px] text-black text-center top-0 w-[136px]">Build healthier habits with simple daily wellness routines.</p>
            </div>
          </div>
          <div className="absolute contents left-[1217px] top-[1413.95px]" data-node-id="594:734">
            <div className="absolute bg-[#f5f5f7] h-[181.05px] left-[1217px] rounded-[10px] shadow-[4px_4px_20px_0px_rgba(0,0,0,0.25)] top-[1413.95px] w-[162px]" data-node-id="589:343" />
            <p className="[word-break:break-word] absolute font-inter font-black leading-[normal] left-[calc(50%+510.5px)] not-italic text-[#429ff4] text-[24px] top-[1431px] whitespace-nowrap" data-node-id="589:346">
              CARE
            </p>
            <div className="absolute bottom-0 h-[-1297.4999969482421px] left-[calc(50%+544.5px)] pointer-events-none top-[1478.55px]" data-node-id="589:349">
              <p className="-translate-x-1/2 [word-break:break-word] font-inter font-medium h-[72.25px] leading-[normal] not-italic pointer-events-auto sticky text-[14px] text-black text-center top-0 w-[136px]">Share progress and stay connected with the people who care.</p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 h-[722px] left-[calc(50%+3.5px)] pointer-events-none top-[2604px]" data-node-id="589:312">
          <p className="[word-break:break-word] font-inter font-medium leading-[normal] not-italic pointer-events-auto sticky text-[#6e6e6e] text-[14px] top-0 w-[560px]">Blood sugar, blood pressure, fever — log the numbers that keep you and your family safe, and spot patterns before they become problems.</p>
        </div>
        <div className="absolute bottom-0 h-[875px] left-[calc(50%+1.5px)] pointer-events-none top-[2451px]" data-node-id="589:313">
          <p className="[word-break:break-word] font-inter font-bold leading-[normal] not-italic pointer-events-auto sticky text-[#429ff4] text-[14px] top-0 whitespace-nowrap">Daily Vitals</p>
        </div>
        <div className="absolute h-[632px] left-[86px] top-[2387px] w-[596px]" data-node-id="589:335" data-name="aaf2e3d5-9df7-42e6-9cb4-088821fd7c63 2">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img loading="lazy" alt="" className="absolute h-[116.82%] left-[-102.64%] max-w-none top-[-5.92%] w-[202.64%]" src={imgAaf2E3D59Df742E69Cb4088821Fd7C631} />
          </div>
        </div>
        <p className="[word-break:break-word] absolute font-inter font-black leading-[0] left-[calc(50%+1.5px)] not-italic text-[#000400] text-[48px] top-[2473px] w-[562px]" data-node-id="589:315">
          <span className="leading-[normal]">{`Track What Matters. Every `}</span>
          <span className="leading-[normal] text-[#429ff4]">Single Day.</span>
        </p>
        <div className="absolute h-0 left-[755px] top-[2670px] w-[123px]" data-node-id="589:316">
          <div className="absolute inset-[-3px_0_0_0]">
            <img loading="lazy" alt="" className="block max-w-none size-full" src={imgLine13} />
          </div>
        </div>
        <div className="absolute contents left-[760px] top-[2700px]" data-node-id="589:365">
          <p className="[word-break:break-word] absolute font-inter font-black h-[98.6px] leading-[normal] left-[calc(50%+220.5px)] not-italic text-[96px] text-[transparent] top-[2700px] w-[62px]" data-node-id="589:366">
            2
          </p>
          <p className="[word-break:break-word] absolute font-inter font-black h-[98.6px] leading-[normal] left-[calc(50%+6.5px)] not-italic text-[96px] text-[transparent] top-[2700px] w-[48px]" data-node-id="589:367">
            1
          </p>
          <p className="[word-break:break-word] absolute font-inter font-black h-[98.6px] leading-[normal] left-[calc(50%+435.5px)] not-italic text-[96px] text-[transparent] top-[2700px] w-[63px]" data-node-id="589:368">
            3
          </p>
          <div className="absolute bg-[#f5f5f7] h-[181.05px] left-[783px] rounded-[10px] shadow-[4px_4px_20px_0px_rgba(0,0,0,0.25)] top-[2756.95px] w-[161px]" data-node-id="589:369" />
          <div className="absolute bg-[#f5f5f7] h-[181.05px] left-[993px] rounded-[10px] shadow-[4px_4px_20px_0px_rgba(0,0,0,0.25)] top-[2756.95px] w-[162px]" data-node-id="589:370" />
          <div className="absolute bg-[#f5f5f7] h-[181.05px] left-[1204px] rounded-[10px] shadow-[4px_4px_20px_0px_rgba(0,0,0,0.25)] top-[2756.95px] w-[162px]" data-node-id="589:371" />
          <p className="[word-break:break-word] absolute font-inter font-black h-[24.65px] leading-[normal] left-[calc(50%+82.5px)] not-italic text-[#429ff4] text-[24px] top-[2774px] w-[55px]" data-node-id="589:372">
            LOG
          </p>
          <p className="[word-break:break-word] absolute font-inter font-black leading-[normal] left-[calc(50%+278.5px)] not-italic text-[#429ff4] text-[24px] top-[2774px] whitespace-nowrap" data-node-id="589:373">
            TREND
          </p>
          <p className="[word-break:break-word] absolute font-inter font-black leading-[normal] left-[calc(50%+488.5px)] not-italic text-[#429ff4] text-[24px] top-[2774px] whitespace-nowrap" data-node-id="589:374">
            SHARE
          </p>
          <div className="absolute bottom-0 h-[-2583.55px] left-[calc(50%+110.5px)] pointer-events-none top-[2821.55px]" data-node-id="589:375">
            <p className="-translate-x-1/2 [word-break:break-word] font-inter font-medium h-[43.35px] leading-[normal] not-italic pointer-events-auto sticky text-[14px] text-black text-center top-0 w-[136px]">Record vitals in seconds, right from your phone.</p>
          </div>
          <div className="absolute bottom-0 h-[-2583.55px] left-[calc(50%+320.5px)] pointer-events-none top-[2821.55px]" data-node-id="589:376">
            <p className="-translate-x-1/2 [word-break:break-word] font-inter font-medium h-[57.8px] leading-[normal] not-italic pointer-events-auto sticky text-[14px] text-black text-center top-0 w-[136px]">See patterns over time with simple, clear charts.</p>
          </div>
          <div className="absolute bottom-0 h-[-2583.55px] left-[calc(50%+531.5px)] pointer-events-none top-[2821.55px]" data-node-id="589:377">
            <p className="-translate-x-1/2 [word-break:break-word] font-inter font-medium h-[72.25px] leading-[normal] not-italic pointer-events-auto sticky text-[14px] text-black text-center top-0 w-[136px]">Send your vitals history to any doctor before your next visit.</p>
          </div>
        </div>
      </div>
      <div id="contact" className="absolute left-0 top-[6640px] w-[1512px]" data-node-id="583:270">
        <div className="-translate-x-1/2 absolute bg-[#aff2fb] h-[614px] left-[calc(50%-2.5px)] top-0 w-[1529px]" data-node-id="501:508" />
        <p className="[word-break:break-word] absolute font-raleway font-extrabold leading-[normal] left-[calc(50%-636px)] text-[#141414] text-[70px] top-[90px] w-[486px]" data-node-id="501:509">
          Your Voice Shapes What Comes Next
        </p>
        <p className="[word-break:break-word] absolute font-inter font-medium leading-[24px] left-[calc(50%-625px)] not-italic text-[#6e6e6e] text-[16px] text-justify top-[373px] w-[471px]" data-node-id="501:510">
          Share what works, what doesn’t, and what should change. Every response helps refine the experience.
        </p>
        <div className="-translate-x-1/2 absolute contents left-[calc(50%+270px)] top-[83px]" data-node-id="501:511">
          <div className="-translate-x-1/2 absolute bg-white h-[448px] left-[calc(50%+270px)] rounded-[14px] top-[83px] w-[674px]" data-node-id="501:512" />
          <p className="-translate-x-1/2 [word-break:break-word] absolute font-raleway font-extrabold leading-[normal] left-[calc(50%+270px)] pointer-events-none text-[#429ff4] text-[36px] text-center top-[114px] w-[620px]" data-node-id="501:513">
            Login/Sign Up Now
          </p>
          <p className="[word-break:break-word] absolute font-inter font-medium leading-[normal] left-[calc(50%-4px)] not-italic pointer-events-none text-[#585858] text-[14px] top-[180px] whitespace-nowrap" data-node-id="501:514">
            Everything you need to know about architecture, security, and clinical integration.
          </p>
          <div className="absolute contents left-[740px] top-[373px]" data-node-id="501:515">
            <div className="absolute bg-[#429ff4] h-[48px] left-[740px] rounded-[5px] top-[373px] w-[574px]" data-node-id="501:516" />
            <div className="-translate-x-1/2 -translate-y-1/2 absolute contents left-[calc(50%+270.93px)] top-[397px]" data-node-id="501:517">
              <div className="-translate-x-1/2 absolute contents left-[calc(50%+270.93px)] top-[389px]" data-node-id="501:518">
                <p className="[word-break:break-word] absolute font-inter font-bold h-[16px] leading-[normal] left-[calc(50%+174px)] not-italic text-[14px] text-white top-[381px] w-[186.708px]" data-node-id="501:519">
                  Login now
                </p>
                <div className="absolute h-0 left-[1088.43px] top-[397px] w-[35.426px]" data-node-id="501:520">
                  <div className="absolute inset-[-7.36px_-2.82%_-7.36px_0]">
                    <img loading="lazy" alt="" className="block max-w-none size-full" src={imgLine2} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute contents left-[740px] top-[304px]" data-node-id="501:523">
            <div className="absolute bg-white border border-[#429ff4] border-solid h-[48px] left-[740px] rounded-[5px] top-[304px] w-[574px]" data-node-id="501:524" />
          </div>
          <div className="absolute contents left-[740px] top-[235px]" data-node-id="501:525">
            <div className="absolute bg-white border border-[#429ff4] border-solid h-[48px] left-[740px] rounded-[5px] top-[235px] w-[573px]" data-node-id="501:526" />
          </div>
          <p className="[word-break:break-word] absolute font-inter font-normal leading-[0] left-[calc(50%-4px)] not-italic pointer-events-none text-[14px] text-[rgba(67,67,67,0.5)] top-[265px] whitespace-nowrap" data-node-id="501:527">
            <span className="leading-[normal]">{`Name `}</span>
            <span className="leading-[normal] text-[rgba(255,0,0,0.5)]">*</span>
          </p>
          <p className="[word-break:break-word] absolute font-inter font-normal leading-[0] left-[calc(50%-4px)] not-italic pointer-events-none text-[14px] text-[rgba(67,67,67,0.5)] top-[334px] whitespace-nowrap" data-node-id="501:528">
            <span className="leading-[normal]">{`Email `}</span>
            <span className="leading-[normal] text-[rgba(255,0,0,0.5)]">*</span>
          </p>
        </div>
      </div>
      <div className="-translate-x-1/2 absolute bottom-0 h-[498px] left-[calc(50%-2px)] overflow-clip w-[1526px]" data-node-id="501:531">
        <div className="absolute contents left-0 top-0" data-node-id="501:532">
          <div className="absolute bg-[#eee] h-[498px] left-0 top-0 w-[1526px]" data-node-id="501:533" />
          <p className="[word-break:break-word] absolute font-raleway font-extrabold leading-[normal] left-[calc(50%-716px)] text-[#d6d6d6] text-[340px] top-[235px] whitespace-nowrap" data-node-id="501:534">
            Evocare
          </p>
          <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-inter font-normal justify-center leading-[0] left-[242px] not-italic text-[#1b1b1b] text-[18px] top-[88px] w-[413px]" data-node-id="501:535">
            <p className="leading-[normal]">The next generation of clinical intelligence. Empowering modern physicians with AI-assisted diagnostics and high-fidelity insights.</p>
          </div>
          <button
            type="button"
            aria-label="Instagram"
            className="footer-interactive-icon absolute bg-[#eee] content-stretch flex items-center justify-center left-[242px] rounded-[4px] size-[40px] top-[151px]"
            data-node-id="501:536"
            data-name="Background"
            onClick={() => openSocial("https://www.instagram.com/Evocare.in/")}
          >
            <div className="relative shrink-0 size-[20px]" data-node-id="501:537" data-name="SVG">
              <img loading="lazy" alt="" className="absolute block inset-0 max-w-none size-full" src={imgInstagram} />
            </div>
          </button>
          <button
            type="button"
            aria-label="LinkedIn"
            className="footer-interactive-icon absolute bg-[#eee] content-stretch flex items-center justify-center left-[298px] rounded-[4px] size-[40px] top-[151px]"
            data-node-id="501:539"
            data-name="Background"
            onClick={() => openSocial("https://www.linkedin.com/company/Evocare-in/")}
          >
            <div className="relative shrink-0 size-[20px]" data-node-id="501:540" data-name="SVG">
              <img loading="lazy" alt="" className="absolute block inset-0 max-w-none size-full" src={imgLinkedIn} />
            </div>
          </button>
          <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-inter font-semibold justify-center leading-[0] left-[865px] not-italic text-[12px] text-black top-[61px] tracking-[0.6px] w-[205px]" data-node-id="501:542">
            <p className="leading-[12px]">Platform</p>
          </div>
          <button
            type="button"
            className="footer-interactive-link -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-inter font-normal justify-center leading-[0] left-[865px] not-italic text-[12px] text-black text-left top-[93px] tracking-[0.6px] whitespace-nowrap"
            data-node-id="501:543"
            onClick={() => window.location.assign("/evocare/about")}
          >
            <span className="leading-[12px]">About Us</span>
          </button>
          <button
            type="button"
            className="footer-interactive-link -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-inter font-normal justify-center leading-[0] left-[865px] not-italic text-[12px] text-black text-left top-[125px] tracking-[0.6px] whitespace-nowrap"
            data-node-id="501:544"
            onClick={footerToast.login}
          >
            <span className="leading-[12px]">Log In</span>
          </button>
          <button
            type="button"
            className="footer-interactive-link -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-inter font-normal justify-center leading-[0] left-[1134px] not-italic text-[12px] text-black text-left top-[93px] tracking-[0.6px] whitespace-nowrap"
            data-node-id="501:545"
            onClick={() => footerGo("contact")}
          >
            <span className="leading-[12px]">About Founder</span>
          </button>
          <button
            type="button"
            className="footer-interactive-link -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-inter font-normal justify-center leading-[0] left-[1134px] not-italic text-[12px] text-black text-left top-[125px] tracking-[0.6px] whitespace-nowrap"
            data-node-id="501:546"
            onClick={() => window.location.assign("/evodoc/contact")}
          >
            <span className="leading-[12px]">Contact Us</span>
          </button>
          <button
            type="button"
            className="footer-interactive-link -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-inter font-normal justify-center leading-[0] left-[1134px] not-italic text-[12px] text-black text-left top-[157px] tracking-[0.6px] whitespace-nowrap"
            data-node-id="501:547"
            onClick={() => footerGo("contact")}
          >
            <span className="leading-[12px]">Feedback</span>
          </button>
          <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-inter font-semibold justify-center leading-[0] left-[1134px] not-italic text-[12px] text-black top-[61px] tracking-[0.6px] w-[205px]" data-node-id="501:548">
            <p className="leading-[12px]">Connect</p>
          </div>
          <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-inter font-normal justify-center leading-[0] left-[242px] not-italic text-[#636363] text-[16px] top-[263px] whitespace-nowrap" data-node-id="501:549">
            <p className="leading-[24px]">© 2026 Evocare AI. All rights reserved.</p>
          </div>
          <button
            type="button"
            className="footer-interactive-link absolute bottom-[229px] content-stretch flex items-start left-[873px] top-[245px] [word-break:break-word] font-inter font-normal justify-center leading-[0] not-italic text-[#636363] text-[16px] text-left whitespace-nowrap"
            data-node-id="501:550"
            data-name="Link"
            onClick={footerToast.privacy}
          >
            <span className="leading-[24px]">Privacy Policy</span>
          </button>
          <button
            type="button"
            className="footer-interactive-link absolute bottom-[229px] content-stretch flex items-start left-[1006px] top-[245px] [word-break:break-word] font-inter font-normal justify-center leading-[0] not-italic text-[#636363] text-[16px] text-left whitespace-nowrap"
            data-node-id="501:552"
            data-name="Link"
            onClick={footerToast.terms}
          >
            <span className="leading-[24px]">Terms of Service</span>
          </button>
          <button
            type="button"
            className="footer-interactive-link absolute bottom-[229px] content-stretch flex items-start left-[1165px] top-[245px] [word-break:break-word] font-inter font-normal justify-center leading-[0] not-italic text-[#636363] text-[16px] text-left whitespace-nowrap"
            data-node-id="501:554"
            data-name="Link"
            onClick={footerToast.cookies}
          >
            <span className="leading-[24px]">Cookies</span>
          </button>
        </div>
      </div>
      <motion.div className="-translate-x-1/2 [word-break:break-word] absolute font-raleway font-extrabold leading-[0] left-1/2 text-[70px] text-black text-center top-[142px] whitespace-nowrap" data-node-id="501:654">
        <p className="leading-[normal]">You Don't Have To</p>
        <p className="leading-[normal]">Remember Everything.</p>
      </motion.div>
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-inter font-medium leading-[24px] left-[calc(50%+0.5px)] not-italic text-[#161616] text-[16px] text-center top-[322px] w-[665px]" data-node-id="501:655">
        Treatments change. Doctors change. Evocare remembers what helped you - what didn’t and quietly protects you from repeating the same mistakes.
      </p>
      <div className="-translate-x-1/2 absolute contents left-1/2 top-[406px]" data-node-id="501:656">
        <div className="absolute contents left-[366px] top-[406px]" data-node-id="501:657">
          <motion.div className="absolute bg-[#429ff4] h-[56px] left-[366px] rounded-[13px] shadow-[8px_8px_20px_0px_rgba(0,0,0,0.25)] top-[406px] w-[377px]" data-node-id="501:658" />
          <div className="-translate-x-1/2 -translate-y-1/2 absolute contents left-[calc(50%-201.5px)] top-[434px]" data-node-id="501:659">
            <div className="absolute left-[648px] size-[29px] top-[420px]" data-node-id="501:660" data-name="Arrow / Arrow_Circle_Up_Right">
              <img loading="lazy" alt="" className="absolute block inset-0 max-w-none size-full" src={imgArrowArrowCircleUpRight1} />
            </div>
            <p className="[word-break:break-word] absolute font-inter font-semibold leading-[normal] left-[calc(50%-324px)] not-italic text-[20px] text-white top-[423px] whitespace-nowrap" data-node-id="501:661">
              Get Started For Free
            </p>
          </div>
        </div>
        <motion.div
          className="absolute flex items-center justify-center gap-3 border-4 border-[#429ff4] border-solid h-[56px] left-[769px] rounded-[13px] shadow-[8px_8px_20px_0px_rgba(0,0,0,0.25)] top-[406px] w-[377px] cursor-pointer"
          data-node-id="501:663"
        >
          <p className="[word-break:break-word] font-inter font-semibold leading-[normal] not-italic text-[#429ff4] text-[20px] whitespace-nowrap m-0" data-node-id="501:666">
            Our Upcoming Features
          </p>
          <div className="size-[26px] shrink-0" data-node-id="501:665" data-name="Arrow / Arrow_Circle_Up_Right">
            <img loading="lazy" alt="" className="block max-w-none size-full" src={imgArrowArrowCircleUpRight2} />
          </div>
        </motion.div>
      </div>

      <div className="absolute contents left-[163px] top-[578px]" data-node-id="505:886">
        <div className="-translate-x-1/2 absolute h-[746px] left-1/2 top-[578px] w-[1186px]" data-node-id="505:887" data-name="Mockup Result">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img loading="lazy" alt="" className="absolute h-[127.13%] left-[-31.01%] max-w-none top-[-6.76%] w-[162.23%]" src={imgMockupResult} />
          </div>
        </div>
        <div className="absolute h-[685px] left-[209px] overflow-hidden rounded-[20px] top-[606px] w-[1101px]" data-node-id="505:888" data-name="Untitled 3">
          <HeroVideo src="/evocare-video-compressed.mp4" className="h-full w-full object-cover" />
        </div>
      </div>
      <RocketParallax
        src={imgA9A956Bc93884Afd8De4311B3A4B1A781}
        className="-translate-x-1/2 absolute z-[60] h-[1388px] left-[calc(50%-11.5px)] top-[1847px] w-[1801px]"
      />
      <div
        id="launching-next"
        className="absolute bg-[#f5f5f7] h-[1158px] left-[calc(50%+0.5px)] overflow-clip top-[6382px] w-[1507px]"
        style={{ transform: `translateX(-50%) translateY(-${DESKTOP_POST_ROCKET_LIFT}px)` }}
        data-node-id="589:379"
      >
        <div className="absolute bottom-0 h-[66px] left-[calc(50%-243.5px)] pointer-events-none top-[1092px]" data-node-id="589:512">
          <p className="[word-break:break-word] font-inter font-black leading-[normal] not-italic pointer-events-auto sticky text-[#429ff4] text-[20px] top-0 whitespace-nowrap">More amazing features coming soon. Stay tuned.</p>
        </div>
        <p className="[word-break:break-word] absolute font-raleway font-extrabold leading-[normal] left-[calc(50%-663.5px)] text-[#141414] text-[70px] top-[62px] whitespace-nowrap" data-node-id="594:545">
          Launching Next
        </p>
        <div className="absolute bottom-0 h-[1004px] left-[calc(50%-659.5px)] pointer-events-none top-[154px]" data-node-id="594:546">
          <p className="[word-break:break-word] font-inter font-medium leading-[normal] not-italic pointer-events-auto sticky text-[#6e6e6e] text-[14px] top-0 w-[633px]">{`Here's what's coming to your EvoCare dashboard — built with real patients and doctors.`}</p>
        </div>
        <div className="absolute bottom-0 h-[1113px] left-[calc(50%-659.5px)] pointer-events-none top-[45px]" data-node-id="594:547">
          <p className="[word-break:break-word] font-inter font-medium leading-[normal] not-italic pointer-events-auto sticky text-[#429ff4] text-[14px] top-0 whitespace-nowrap">Upcoming Features</p>
        </div>
        <div className="-translate-x-1/2 absolute contents left-[calc(50%+14px)] top-[213px]" data-node-id="594:623">
          <div className="absolute h-[47.5px] left-[67.5px] top-[763.5px] w-[68px]" data-node-id="594:576">
            <div className="absolute inset-[-31.24%_-21.59%_-31.09%_-21.55%]">
              <img loading="lazy" alt="" className="block max-w-none size-full" src={imgVector6} />
            </div>
          </div>
          <div className="absolute h-[46px] left-[1156px] top-[587px] w-[77px]" data-node-id="594:628">
            <div className="absolute inset-[-31.9%_-19.08%_-31.75%_-19.39%]">
              <img loading="lazy" alt="" className="block max-w-none size-full" src={imgVector9} />
            </div>
          </div>
          <div className="absolute h-[154px] left-[1306px] top-[905px] w-[45px]" data-node-id="594:626">
            <div className="absolute inset-[-9.27%_-32.44%_-9.5%_-32.44%]">
              <img loading="lazy" alt="" className="block max-w-none size-full" src={imgVector8} />
            </div>
          </div>
          <div className="absolute h-[46px] left-[1381px] top-[1000px] w-[45px]" data-node-id="594:578">
            <div className="absolute inset-[-33.16%_-32.84%_-31.75%_-32.44%]">
              <img loading="lazy" alt="" className="block max-w-none size-full" src={imgVector7} />
            </div>
          </div>
          <div className="launching-next-card-group group absolute left-[101px] top-[213px] h-[307px] w-[433px]">
            <div className="launching-next-card absolute inset-0 rounded-[20px] bg-[#cbf3f9]" data-node-id="594:529" />
            <div className="pointer-events-none absolute left-[186px] top-[59px] h-[257px] w-[249px]" data-node-id="594:559" data-name="d6b5b3cf-d8d2-4b6a-9d67-c13c7443f4a6 5">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img loading="lazy" alt="" className="absolute h-[388.82%] left-[-388.86%] max-w-none top-[-257.04%] w-[600.33%]" src={imgD6B5B3CfD8D24B6A9D67C13C7443F4A63} />
              </div>
            </div>
            <p className="[word-break:break-word] absolute left-[21px] top-[25px] z-10 font-inter font-black leading-[normal] not-italic text-[#429ff4] text-[24px] uppercase w-[343px]" data-node-id="594:580">
              Prescription Safety Cross-Checking
            </p>
            <div className="absolute left-[21px] top-[106px] z-10 w-[209px]" data-node-id="594:598">
              <div className="[word-break:break-word] font-inter font-normal leading-[0] not-italic text-[14px] text-black">
                <p className="leading-[normal] mb-0">Every new prescription is automatically scanned against your history to catch drug</p>
                <p className="leading-[normal]">interactions, allergies, and health risks before they become a problem.</p>
              </div>
            </div>
          </div>
          <div className="launching-next-card-group group absolute left-[558px] top-[213px] h-[246px] w-[409px]">
            <div className="launching-next-card absolute inset-0 rounded-[20px] bg-white" data-node-id="594:535" />
            <div className="pointer-events-none absolute left-[240px] top-[6px] h-[240px] w-[169px]" data-node-id="594:557" data-name="d6b5b3cf-d8d2-4b6a-9d67-c13c7443f4a6 4">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img loading="lazy" alt="" className="absolute h-[426.84%] left-[-753.25%] max-w-none top-[-273.42%] w-[908.88%]" src={imgD6B5B3CfD8D24B6A9D67C13C7443F4A63} />
              </div>
            </div>
            <p className="[word-break:break-word] absolute left-[20px] top-[25px] z-10 font-inter font-black leading-[normal] not-italic text-[#429ff4] text-[24px] uppercase w-[220px]" data-node-id="594:582">
              The Insurance Vault
            </p>
            <div className="absolute left-[20px] top-[106px] z-10 w-[197px]" data-node-id="594:600">
              <div className="[word-break:break-word] font-inter font-normal leading-[0] not-italic text-[14px] text-black">
                <p className="leading-[normal] mb-0">{`Enter your coverage details once. EvoCare automatically maps what's covered, what`}</p>
                <p className="leading-[normal]">{`isn't, and what to expect before a procedure.`}</p>
              </div>
            </div>
          </div>
          <div className="launching-next-card-group group absolute left-[985px] top-[213px] h-[407px] w-[396px]">
            <div className="launching-next-card absolute inset-0 rounded-[20px] bg-white" data-node-id="594:533" />
            <div className="pointer-events-none absolute left-[52px] top-[83px] h-[334px] w-[347px]" data-node-id="594:553" data-name="d6b5b3cf-d8d2-4b6a-9d67-c13c7443f4a6 3">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img loading="lazy" alt="" className="absolute h-[197.56%] left-[-6.42%] max-w-none top-[0.16%] w-[285.05%]" src={imgD6B5B3CfD8D24B6A9D67C13C7443F4A63} />
              </div>
            </div>
            <p className="[word-break:break-word] absolute left-[34px] top-[35px] z-10 font-inter font-black leading-[normal] not-italic text-[#429ff4] text-[24px] uppercase w-[324px]" data-node-id="594:607">
              Doctor-Ready Summary Reports
            </p>
            <div className="absolute left-[34px] top-[116px] z-10 w-[193px]" data-node-id="594:602">
              <p className="[word-break:break-word] font-inter font-normal leading-[normal] not-italic text-[14px] text-black">Log your symptoms before your appointment. EvoCare builds a structured, chronological timeline for your doctor — plus an AI-curated list of questions worth asking.</p>
            </div>
          </div>
          <div className="launching-next-card-group group absolute left-[555px] top-[481px] h-[321px] w-[412px]">
            <div className="launching-next-card absolute inset-0 rounded-[20px] bg-[#cbf3f9]" data-node-id="594:528" />
            <div className="pointer-events-none absolute left-[201px] top-[74px] h-[247px] w-[211px]" data-node-id="594:551" data-name="d6b5b3cf-d8d2-4b6a-9d67-c13c7443f4a6 2">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img loading="lazy" alt="" className="absolute h-[478.85%] left-[-159.45%] max-w-none top-[-288.52%] w-[841.41%]" src={imgD6B5B3CfD8D24B6A9D67C13C7443F4A63} />
              </div>
            </div>
            <p className="[word-break:break-word] absolute left-[23px] top-[16px] z-10 font-inter font-black leading-[normal] not-italic text-[#429ff4] text-[24px] uppercase w-[365px]" data-node-id="594:586">
              Disease-Specific Entry Metrics
            </p>
            <div className="absolute left-[23px] top-[97px] z-10 w-[176px]" data-node-id="594:613">
              <div className="[word-break:break-word] font-inter font-normal leading-[0] not-italic text-[14px] text-black">
                <p className="leading-[normal] mb-0">Daily tracking fields tailored to your exact condition — giving your doctor high-fidelity</p>
                <p className="leading-[normal]">structured data at every appointment.</p>
              </div>
            </div>
          </div>
          <div className="launching-next-card-group group absolute left-[101px] top-[540px] h-[262px] w-[433px]">
            <div className="launching-next-card absolute inset-0 rounded-[20px] bg-white" data-node-id="594:565" />
            <div className="pointer-events-none absolute left-[-45px] top-[9px] h-[273px] w-[203px]" data-node-id="594:567" data-name="d6b5b3cf-d8d2-4b6a-9d67-c13c7443f4a6 6">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img loading="lazy" alt="" className="absolute h-[305.96%] left-[-210.42%] max-w-none top-[-190.41%] w-[618.22%]" src={imgD6B5B3CfD8D24B6A9D67C13C7443F4A63} />
              </div>
            </div>
            <p className="[word-break:break-word] absolute left-[158px] top-[24px] z-10 font-inter font-black leading-[normal] not-italic text-[#429ff4] text-[24px] uppercase w-[251px]" data-node-id="594:588">{`Personalized Health Education & Coaching`}</p>
            <div className="absolute left-[158px] top-[134px] z-10 w-[251px]" data-node-id="594:615">
              <p className="[word-break:break-word] font-inter font-normal leading-[normal] not-italic text-[14px] text-black">Curated, disease-specific tips, learning content, and lifestyle suggestions built around your health profile.</p>
            </div>
          </div>
          <div className="launching-next-card-group group absolute left-[985px] top-[640px] h-[406px] w-[396px]">
            <div className="launching-next-card absolute inset-0 rounded-[20px] bg-[#cbf3f9]" data-node-id="594:537" />
            <div className="pointer-events-none absolute left-[137px] top-[89px] h-[338px] w-[357px]" data-node-id="594:550" data-name="d6b5b3cf-d8d2-4b6a-9d67-c13c7443f4a6 1">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img loading="lazy" alt="" className="absolute h-[191.81%] left-[-149.47%] max-w-none top-[-0.04%] w-[272.34%]" src={imgD6B5B3CfD8D24B6A9D67C13C7443F4A63} />
              </div>
            </div>
            <p className="[word-break:break-word] absolute left-[26px] top-[24px] z-10 font-inter font-black leading-[normal] not-italic text-[#429ff4] text-[24px] uppercase w-[304px]" data-node-id="594:590">
              Lockscreen Emergency QR Widget
            </p>
            <div className="absolute left-[26px] top-[105px] z-10 w-[154px]" data-node-id="594:604">
              <p className="[word-break:break-word] font-inter font-normal leading-[normal] not-italic text-[14px] text-black">Critical medical details, right on your lock screen. In an emergency, anyone can scan and access life-saving information in seconds — no unlocking required</p>
            </div>
          </div>
          <div className="launching-next-card-group group absolute left-[101px] top-[827px] h-[224px] w-[400px]">
            <div className="launching-next-card absolute inset-0 rounded-[20px] bg-[#cbf3f9]" data-node-id="594:539" />
            <div className="pointer-events-none absolute left-[217px] top-0 h-[223px] w-[183px] rounded-[20px]" data-node-id="594:555" data-name="d6b5b3cf-d8d2-4b6a-9d67-c13c7443f4a6 3">
              <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[20px]">
                <img loading="lazy" alt="" className="absolute h-[432.19%] left-[4.5%] max-w-none top-[-260.03%] w-[790.51%]" src={imgD6B5B3CfD8D24B6A9D67C13C7443F4A63} />
              </div>
            </div>
            <p className="[word-break:break-word] absolute left-[13px] top-[16px] z-10 font-inter font-black leading-[normal] not-italic text-[#429ff4] text-[24px] uppercase w-[238px]" data-node-id="594:596">
              Unified Health Dashboard
            </p>
            <div className="absolute left-[13px] top-[97px] z-10 w-[216px]" data-node-id="594:617">
              <p className="[word-break:break-word] font-inter font-normal leading-[normal] not-italic text-[14px] text-black">One command center. Personalized, condition-specific care pipelines for chronic illnesses and ongoing health situations.</p>
            </div>
          </div>
          <div className="launching-next-card-group group absolute left-[520px] top-[827px] h-[224px] w-[445px]">
            <div className="launching-next-card absolute inset-0 rounded-[20px] bg-white" data-node-id="594:541" />
            <div className="pointer-events-none absolute left-[201px] top-[33px] h-[190px] w-[254px]" data-node-id="594:569" data-name="d6b5b3cf-d8d2-4b6a-9d67-c13c7443f4a6 7">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img loading="lazy" alt="" className="absolute h-[566.98%] left-[-311.72%] max-w-none top-[-357.42%] w-[632.66%]" src={imgD6B5B3CfD8D24B6A9D67C13C7443F4A63} />
              </div>
            </div>
            <p className="[word-break:break-word] absolute left-[16px] top-[16px] z-10 font-inter font-black leading-[normal] not-italic text-[#429ff4] text-[24px] uppercase w-[335px]" data-node-id="594:594">
              Predictive Medicine Refill Alerts
            </p>
            <div className="absolute left-[16px] top-[97px] z-10 w-[208px]" data-node-id="594:619">
              <div className="[word-break:break-word] font-inter font-normal leading-[0] not-italic text-[14px] text-black">
                <p className="leading-[normal] mb-0">Smarter than a reminder — EvoCare tells you exactly when your physical prescription</p>
                <p className="leading-[normal]">supply is about to run out</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute contents left-0 top-[-3px]" data-node-id="501:711">
        <div className="absolute bg-white h-[107px] left-0 top-[-3px] w-[1512px]" data-node-id="501:712" />
        <div className="absolute h-[42px] left-[89px] top-[42px] w-[126px]" data-node-id="501:713" data-name="Untitled design (2) 1">
          <img loading="lazy" alt="EvoCare" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgUntitledDesign21} />
        </div>
        <div className="[word-break:break-word] absolute contents font-inter font-medium leading-[normal] left-[606px] not-italic text-[14px] text-black top-[54.25px] whitespace-nowrap" data-node-id="501:714">
          <p className="absolute left-[606px] top-[54.25px]" data-node-id="501:715">
            About Us
          </p>
          <p className="absolute left-[719px] top-[54.25px]" data-node-id="501:716">
            Contact Us
          </p>
          <p className="absolute left-[847px] top-[54.25px]" data-node-id="501:717">
            Features
          </p>
          <p className="absolute left-[950px] top-[54.25px]" data-node-id="501:717b">
            Privacy
          </p>
          <p className="absolute left-[1030px] top-[54.25px]" data-node-id="501:717c">
            Blogs
          </p>
        </div>
        <div className="absolute contents left-[1298px] top-[43px]" data-node-id="501:718">
          <div className="absolute contents left-[1298px] top-[43px]" data-node-id="501:719">
            <div className="absolute bg-[#aff2fb] h-[39px] left-[1298px] rounded-[10px] top-[43px] w-[125px]" data-node-id="501:720" />
            <p className="[word-break:break-word] absolute font-inter font-bold leading-[normal] left-[calc(50%+555px)] not-italic text-[#141414] text-[14px] top-[54px] whitespace-nowrap" data-node-id="501:721">
              Login/ Sign up
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
