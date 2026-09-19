import React from "react";
import { motion } from "motion/react";
import { HeroVideo } from "../components/HeroVideo";
import {
  MOBILE_ROCKET_PARALLAX,
  RocketParallax,
} from "../components/RocketParallax";
import { footerGo, footerToast, openSocial } from "../site/footerActions";
import { mobile, shared } from "../assets/images";
import Image from "next/image";

const {
  imgFolder,
  imgInsertDriveFile,
  imgAccountCircle,
  imgSecurity,
  imgSnippetFolder,
  imgShare,
  imgMockupResult,
  imgA9A956Bc93884Afd8De4311B3A4B1A781,
  img11445426Ba2B4C09Ac9280556D0604083,
  img11445426Ba2B4C09Ac9280556D0604084,
  imgAaf2E3D59Df742E69Cb4088821Fd7C633,
  imgD6B5B3CfD8D24B6A9D67C13C7443F4A68,
  imgUntitledDesign21,
  imgRectangle152,
  imgVector,
  imgVector1,
  imgVector2,
  imgMaskGroup,
  imgMaskGroup1,
  imgArrowArrowCircleUpRight,
  imgLine8,
  imgFavorite,
  imgArrowArrowCircleUpRight1,
  imgArrowArrowCircleUpRight2,
  imgVector3,
  imgVector4,
  imgVector5,
  imgClipPathGroup,
  imgClipPathGroup1,
  imgClipPathGroup2,
  imgClipPathGroup3,
  imgClipPathGroup4,
  imgGroup95,
  imgFolder1,
  imgFolder2,
  imgCursor1,
  imgArrowArrowCircleUpRight3,
  imgLine2,
  imgInstagram,
  imgLinkedIn,
} = { ...mobile, ...shared };

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

export default function MobileLandingPage({
  showAllCards,
  setShowAllCards,
}: {
  showAllCards: boolean;
  setShowAllCards: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div className="bg-white relative w-[402px] overflow-clip" style={{ height: showAllCards ? 10999 : 9544 }} data-node-id="444:440" data-name="iPhone EVOCARE Home - Animation">
      <div className="-translate-x-1/2 absolute h-[2206.5px] left-[calc(50%+0.5px)] top-[548px] w-[367px]" data-node-id="456:908">
        <div className="absolute inset-[1.52%_0_0_0]">
          <img alt="" className="block max-w-none size-full" src={imgRectangle152} />
        </div>
      </div>
      <div className="absolute flex inset-[18.12%_36.07%_81%_35.82%] items-center justify-center" data-node-id="456:906" style={{ containerType: "size" }}>
        <div className="-rotate-90 flex-none h-[100cqw] w-[100cqh]">
          <div className="relative size-full" data-name="Vector">
            <div className="absolute inset-[-1.33%_-1.55%_-1.33%_-2.19%]">
              <img alt="" className="block max-w-none size-full" src={imgVector} />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute left-1/2 h-[532px] pointer-events-none top-[1951px] w-[402px]" data-node-id="628:3623">
        <div className="-translate-x-1/2 relative h-[532px] overflow-clip pointer-events-auto w-[402px]">
          <div className="absolute contents left-[40px] top-[142px]" data-node-id="628:3624">
            <div className="absolute bg-white h-[368px] left-[40px] rounded-[15px] shadow-[8px_8px_20px_0px_rgba(0,0,0,0.25)] top-[142px] w-[322px]" data-node-id="628:3625" />
            <div className="absolute bottom-0 h-[-24px] left-[calc(50%-134.65px)] pointer-events-none top-[392px]" data-node-id="628:3626">
              <p className="[word-break:break-word] font-inter font-medium leading-[normal] not-italic pointer-events-auto sticky text-[12px] text-black top-0 w-[270.941px]">Send records securely to any doctor or family member, instantly.</p>
            </div>
            <div className="absolute bottom-0 h-[14px] left-[calc(50%-136.29px)] pointer-events-none top-[354px]" data-node-id="628:3627">
              <p className="[word-break:break-word] font-inter font-medium leading-[normal] not-italic pointer-events-auto sticky text-[#6e6e6e] text-[12px] top-0 w-[257.765px]">Secure sharing, made simple.</p>
            </div>
            <p className="[word-break:break-word] absolute font-inter font-black leading-[normal] left-[calc(50%-112px)] not-italic text-[#429ff4] text-[24px] top-[316px] w-[86px]" data-node-id="628:3628">
              SHARE
            </p>
            <Share className="absolute h-[24px] left-[62.24px] top-[319px] w-[19.765px]" />
            <div className="absolute inset-[40.98%_50.5%_47.18%_36.57%]" data-node-id="628:3630" data-name="Vector">
              <div className="absolute inset-[-2.38%_-2.88%_-2.38%_-2.89%]">
                <img alt="" className="block max-w-none size-full" src={imgVector1} />
              </div>
            </div>
            <div className="absolute flex inset-[34.07%_36.79%_49.81%_51.13%] items-center justify-center" data-node-id="628:3631" style={{ containerType: "size" }}>
              <div className="flex-none h-[100cqh] rotate-180 w-[100cqw]">
                <div className="relative size-full" data-name="Vector">
                  <div className="absolute inset-[-1.75%_-3.09%]">
                    <img alt="" className="block max-w-none size-full" src={imgVector2} />
                  </div>
                </div>
              </div>
            </div>
            <Security className="absolute left-[181.45px] size-[39.929px] top-[202.04px]" />
            <div className="absolute bg-white h-[112px] left-[64.71px] rounded-[5px] shadow-[3px_3px_10px_0px_rgba(0,0,0,0.25)] top-[180px] w-[82.353px]" data-node-id="628:3633" />
            <div className="absolute bg-white h-[112px] left-[254.94px] rounded-[5px] shadow-[3px_3px_10px_0px_rgba(0,0,0,0.25)] top-[180px] w-[82.353px]" data-node-id="628:3634" />
            <div className="absolute left-[80.51px] size-[49.912px] top-[186.54px]" data-node-id="628:3635" data-name="Mask group">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgMaskGroup} />
            </div>
            <div className="absolute left-[263.45px] size-[65.339px] top-[176.33px]" data-node-id="628:3638" data-name="Mask group">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgMaskGroup1} />
            </div>
            <SnippetFolder className="absolute left-[93px] overflow-clip size-[24px] top-[255px]" />
            <SnippetFolder className="absolute left-[284px] overflow-clip size-[24px] top-[255px]" />
            <p className="[word-break:break-word] absolute font-inter font-normal leading-[normal] left-[87px] not-italic text-[10px] text-black top-[232px] w-[36px]" data-node-id="628:3643">
              Patient
            </p>
            <p className="[word-break:break-word] absolute font-inter font-normal leading-[normal] left-[279px] not-italic text-[10px] text-black top-[234px] w-[33px]" data-node-id="628:3644">
              Doctor
            </p>
            <div className="absolute contents left-[51.53px] top-[453px]" data-node-id="628:3645">
              <div className="absolute bg-[#aff2fb] h-[39px] left-[51.53px] rounded-[8px] shadow-[2px_2px_10px_0px_rgba(0,0,0,0.25)] top-[453px] w-[300.588px]" data-node-id="628:3646" />
              <p className="[word-break:break-word] absolute font-inter font-semibold leading-[normal] left-[calc(50%-81px)] not-italic text-[14px] text-black top-[463.66px] whitespace-nowrap" data-node-id="628:3647">
                Share Securely
              </p>
              <div className="absolute left-[242.49px] size-[26.317px] top-[460px]" data-node-id="628:3648" data-name="Arrow / Arrow_Circle_Up_Right">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgArrowArrowCircleUpRight} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="launching-first" className="absolute bg-white h-[4452px] left-0 overflow-clip top-[2824px] w-[402px]" data-node-id="505:892">
        <p className="[word-break:break-word] absolute font-raleway font-extrabold leading-[normal] left-[calc(50%-161px)] text-[#141414] text-[35px] top-[207px] whitespace-nowrap" data-node-id="479:492">
          Launching First
        </p>
        <div className="absolute bottom-0 h-[4197px] left-[calc(50%-161px)] pointer-events-none top-[255px]" data-node-id="479:493">
          <p className="[word-break:break-word] font-inter font-medium leading-[normal] not-italic pointer-events-auto sticky text-[#6e6e6e] text-[12px] top-0 whitespace-nowrap">The first features arriving with Evocare at launch.</p>
        </div>
        <div className="absolute bottom-0 h-[4267px] left-[calc(50%-161px)] pointer-events-none top-[185px]" data-node-id="479:494">
          <p className="[word-break:break-word] font-inter font-medium leading-[normal] not-italic pointer-events-auto sticky text-[#429ff4] text-[12px] top-0 whitespace-nowrap">Pre-Launch Features</p>
        </div>
        <div className="absolute contents left-[56px] top-[4127px]" data-node-id="603:980">
          <div className="absolute bg-[#f5f5f7] h-[280px] left-[56px] rounded-[25px] top-[4127px] w-[290px]" data-node-id="603:942" />
          <div className="absolute h-0 left-[70px] top-[4220px] w-[248px]" data-node-id="603:944">
            <div className="absolute inset-[-4px_0_0_0]">
              <img alt="" className="block max-w-none size-full" src={imgLine8} />
            </div>
          </div>
          <Security className="absolute left-[94px] size-[35px] top-[4158px]" />
          <AccountCircle className="absolute left-[94px] size-[35px] top-[4249px]" />
          <div className="absolute bottom-0 h-[-3877.55px] left-[calc(50%-59.34px)] pointer-events-none top-[4157.55px]" data-node-id="603:948">
            <div className="[word-break:break-word] font-inter font-medium h-[33.551px] leading-[0] not-italic pointer-events-auto sticky text-[#636363] text-[12px] top-0 tracking-[0.36px] w-[169px]">
              <p className="leading-[138.2550048828125%] mb-0">Your Data 100% Secure.</p>
              <p className="leading-[138.2550048828125%]">End-To-End Encryption.</p>
            </div>
          </div>
          <div className="absolute bottom-0 h-[-3968.55px] left-[calc(50%-59.34px)] pointer-events-none top-[4248.55px]" data-node-id="603:950">
            <div className="[word-break:break-word] font-inter font-medium h-[33.551px] leading-[0] not-italic pointer-events-auto sticky text-[#636363] text-[12px] top-0 tracking-[0.36px] w-[180px]">
              <p className="leading-[138.2550048828125%] mb-0">You Are In Control.</p>
              <p className="leading-[138.2550048828125%]">Your Health, Your Privacy</p>
            </div>
          </div>
          <div className="absolute h-0 left-[70px] top-[4313px] w-[248px]" data-node-id="603:961">
            <div className="absolute inset-[-4px_0_0_0]">
              <img alt="" className="block max-w-none size-full" src={imgLine8} />
            </div>
          </div>
          <div className="absolute left-[94px] size-[35px] top-[4342px]" data-node-id="603:968" data-name="favorite">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgFavorite} />
          </div>
          <div className="absolute bottom-0 h-[-4061px] left-[calc(50%-59px)] pointer-events-none top-[4341px]" data-node-id="603:978">
            <div className="[word-break:break-word] font-inter font-medium h-[33.551px] leading-[0] not-italic pointer-events-auto sticky text-[#636363] text-[12px] top-0 tracking-[0.36px] w-[191px]">
              <p className="leading-[138.2550048828125%] mb-0">Built With Care.</p>
              <p className="leading-[138.2550048828125%]">{`For You & Your Loved Ones`}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="-translate-x-1/2 absolute contents left-[calc(50%+0.5px)] top-[125px]" data-node-id="444:881">
        <div className="absolute border-2 border-[#59a1fc] border-solid h-[31px] left-[156px] rounded-[30px] top-[125px] w-[91px]" data-node-id="444:882" />
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-inter font-extrabold leading-[normal] left-1/2 not-italic text-[#59a1fc] text-[12px] top-[133px] whitespace-nowrap" data-node-id="444:883">
          EVOCARE
        </p>
      </div>
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-inter font-semibold leading-[24px] left-1/2 not-italic text-[12px] text-[rgba(66,159,244,0.9)] text-center top-[161px] whitespace-nowrap" data-node-id="444:885">
        Pre-Launch Features Of EVOCARE.
      </p>
      <div className="-translate-x-1/2 absolute left-1/2 top-[190px] z-10 flex w-[354px] flex-col items-center gap-3 text-center">
        <motion.div className="[word-break:break-word] font-raleway font-extrabold leading-tight text-[35px] text-black" data-node-id="456:461">
          <p className="mb-0 leading-tight">You Don&apos;t Have To</p>
          <p className="leading-tight">Remember Everything.</p>
        </motion.div>
        <p className="[word-break:break-word] font-inter font-medium leading-6 not-italic text-[#161616] text-[12px]" data-node-id="456:474">
          Treatments change. Doctors change. Evocare remembers what helped you - what didn’t and quietly protects you from repeating the same mistakes.
        </p>
      </div>
      <div className="absolute contents left-[18px] top-[455px]" data-node-id="456:477">
        <motion.div className="absolute bg-[#429ff4] h-[47.181px] left-[18px] rounded-[10px] shadow-[8px_8px_20px_0px_rgba(0,0,0,0.25)] top-[455px] w-[365px]" data-node-id="456:489" />
      </div>
      <motion.div
        className="absolute flex items-center justify-center gap-2 border-4 border-[#429ff4] border-solid h-[47px] left-[18px] rounded-[10px] shadow-[8px_8px_20px_0px_rgba(0,0,0,0.25)] top-[514px] w-[365px] cursor-pointer"
        data-node-id="456:512"
      >
        <p className="[word-break:break-word] font-inter font-semibold leading-[normal] not-italic text-[#429ff4] text-[16px] whitespace-nowrap m-0" data-node-id="456:537">
          Our Upcoming Features
        </p>
        <div className="size-[24px] shrink-0" data-node-id="456:525" data-name="Arrow / Arrow_Circle_Up_Right">
          <img alt="" className="block max-w-none size-full" src={imgArrowArrowCircleUpRight1} />
        </div>
      </motion.div>
      <div className="-translate-x-1/2 absolute contents left-[calc(50%-0.19px)] top-[465px]" data-node-id="456:1448">
        <motion.div className="absolute left-[276px] size-[26.619px] top-[465px]" data-node-id="456:1460" data-name="Arrow / Arrow_Circle_Up_Right">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgArrowArrowCircleUpRight2} />
        </motion.div>
        <p className="[word-break:break-word] absolute font-inter font-semibold leading-[normal] left-[calc(50%-102px)] not-italic text-[16px] text-white top-[467px] whitespace-nowrap" data-node-id="456:1472">
          Get Started For Free
        </p>
      </div>
      <div
        id="three-things-scroll-zone"
        className="absolute left-0 top-[1080px] h-[1800px] w-px pointer-events-none"
        aria-hidden
      />
      <p
        id="three-things-heading"
        className="[word-break:break-word] absolute font-raleway font-extrabold leading-[normal] left-[calc(50%-161px)] text-[#141414] text-[35px] top-[1080px] w-[322px]"
        data-node-id="456:900"
      >
        Three Things. Done Beautifully.
      </p>
      <p
        className="[word-break:break-word] absolute font-inter font-medium leading-[normal] left-[calc(50%-155px)] not-italic text-[#6e6e6e] text-[12px] top-[1170px] w-[308px]"
        data-node-id="456:902"
      >
        Upload once. Organize effortlessly. Share securely, whenever it matters.
      </p>
      <div className="absolute contents left-[77px] top-[575px]" data-node-id="456:552">
        <div className="absolute contents left-[77px] top-[575px]" data-node-id="456:543">
          <div className="absolute h-[489px] left-[77px] top-[575px] w-[248px]" data-node-id="456:544" data-name="Mockup Result">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img alt="" className="absolute h-[112.68%] left-[-32.66%] max-w-none top-[-3.49%] w-[159.27%]" src={imgMockupResult} />
            </div>
          </div>
          <div className="absolute h-[468px] left-[88px] overflow-hidden rounded-[33px] top-[584px] w-[229px]" data-node-id="456:912" data-name="Untitled 5">
            <HeroVideo src="/evocare-video-compressed.mp4" className="h-full w-full object-cover" />
          </div>
          <div className="absolute bg-[#010200] h-[16.039px] left-[170.7px] rounded-[18px] top-[591.08px] w-[63.845px]" data-node-id="456:546" />
        </div>
        <div className="absolute bg-[#080503] h-[16px] left-[170px] rounded-[8px] top-[591px] w-[64px]" data-node-id="456:549" />
      </div>
      <RocketParallax
        src={imgA9A956Bc93884Afd8De4311B3A4B1A781}
        config={MOBILE_ROCKET_PARALLAX}
        className="-translate-x-1/2 absolute z-[60] h-[531px] left-[calc(50%+1.5px)] top-[2451px] w-[689px]"
      />
      <div className="absolute flex inset-[14.01%_33.83%_85.22%_38.06%] items-center justify-center" data-node-id="456:904" style={{ containerType: "size" }}>
        <div className="-scale-x-100 flex-none h-[100cqw] rotate-90 w-[100cqh]">
          <div className="relative size-full" data-name="Vector">
            <div className="absolute inset-[-1.33%_-1.77%_-1.33%_-2.35%]">
              <img alt="" className="block max-w-none size-full" src={imgVector3} />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute contents left-[40px] top-[1184px]" data-node-id="456:553">
        <div className="absolute bg-white h-[368px] left-[40px] rounded-[15px] shadow-[8px_8px_20px_0px_rgba(0,0,0,0.25)] top-[1184px] w-[322px]" data-node-id="456:554" />
        <p className="[word-break:break-word] absolute font-inter font-bold leading-[normal] left-[134px] not-italic text-[#429ff4] text-[13px] top-[1256px] w-[135px]" data-node-id="456:555">
          Drop Your Files Here
        </p>
        <div className="absolute bottom-0 h-[-1066px] left-[calc(50%-148.65px)] pointer-events-none top-[1434px]" data-node-id="456:556">
          <p className="[word-break:break-word] font-inter font-medium leading-[normal] not-italic pointer-events-auto sticky text-[12px] text-black top-0 w-[294.824px]">Drag, tap or scan — add prescriptions, reports and scans in seconds.</p>
        </div>
        <div className="absolute bottom-0 h-[-1028px] left-[calc(50%-148.65px)] pointer-events-none top-[1396px]" data-node-id="456:557">
          <p className="[word-break:break-word] font-inter font-medium leading-[normal] not-italic pointer-events-auto sticky text-[#6e6e6e] text-[12px] top-0 w-[257.765px]">Bring every report together.</p>
        </div>
        <div className="absolute bg-[rgba(89,161,252,0.3)] border border-[#59a1fc] border-dashed h-[118px] left-[51.53px] rounded-[8px] top-[1197px] w-[300.588px]" data-node-id="456:558" />
        <div className="absolute inset-[11.16%_48.26%_88.68%_48.46%]" data-node-id="456:559" data-name="Vector">
          <div className="absolute inset-[-5.56%_-7.59%]">
            <img loading="lazy" alt="" className="block max-w-none size-full" src={imgVector4} />
          </div>
        </div>
        <div className="absolute inset-[12.38%_83.7%_87.45%_13.02%]" data-node-id="456:560" data-name="Vector">
          <div className="absolute inset-[-8.33%_-11.39%]">
            <img loading="lazy" alt="" className="block max-w-none size-full" src={imgVector5} />
          </div>
        </div>
        <div className="absolute bg-white border border-[#429ff4] border-solid h-[37px] left-[111.65px] rounded-[5px] top-[1296px] w-[181.176px]" data-node-id="456:561" />
        <div className="absolute h-[55px] left-[249.18px] overflow-clip top-[1307px] w-[43.647px]" data-node-id="456:562" data-name="closedhand 1">
          <div className="absolute contents inset-[0_-124.13%_0_102.7%]" data-node-id="456:563" data-name="Group">
            <div className="absolute inset-[0_-124.13%_0_102.7%]" data-node-id="456:564" data-name="Clip path group">
              <img loading="lazy" alt="" className="absolute block inset-0 max-w-none size-full" src={imgClipPathGroup} />
            </div>
            <div className="absolute inset-[0_-124.13%_0_102.7%]" data-node-id="456:568" data-name="Clip path group">
              <img loading="lazy" alt="" className="absolute block inset-0 max-w-none size-full" src={imgClipPathGroup1} />
            </div>
            <div className="absolute inset-[0_-124.13%_0_102.7%]" data-node-id="456:572" data-name="Clip path group">
              <img loading="lazy" alt="" className="absolute block inset-0 max-w-none size-full" src={imgClipPathGroup2} />
            </div>
            <div className="absolute inset-[0_-124.13%_0_102.7%]" data-node-id="456:576" data-name="Clip path group">
              <img loading="lazy" alt="" className="absolute block inset-0 max-w-none size-full" src={imgClipPathGroup3} />
            </div>
            <div className="absolute inset-[0_-124.13%_0_102.7%]" data-node-id="456:580" data-name="Clip path group">
              <img loading="lazy" alt="" className="absolute block inset-0 max-w-none size-full" src={imgClipPathGroup4} />
            </div>
          </div>
        </div>
        <InsertDriveFile className="absolute inset-[11.85%_66.08%_87.94%_29%]" />
        <p className="[word-break:break-word] absolute font-inter font-medium leading-[normal] left-[142px] not-italic text-[12px] text-black top-[1304px] w-[117px]" data-node-id="456:585">
          BloodReports.pdf
        </p>
        <div className="absolute h-0 left-[120px] top-[1325px] w-[103px]" data-node-id="456:586">
          <div className="absolute inset-[-3px_-41.12%_0_0]">
            <img loading="lazy" alt="" className="block max-w-none size-full" src={imgGroup95} />
          </div>
        </div>
        <div className="absolute contents inset-[11.85%_23.38%_87.65%_63.43%]" data-node-id="456:599" data-name="Group">
          <div className="absolute inset-[11.85%_23.38%_87.65%_63.43%]" data-node-id="456:600" data-name="Clip path group">
            <img loading="lazy" alt="" className="absolute block inset-0 max-w-none size-full" src={imgClipPathGroup} />
          </div>
          <div className="absolute inset-[11.85%_23.38%_87.65%_63.43%]" data-node-id="456:604" data-name="Clip path group">
            <img loading="lazy" alt="" className="absolute block inset-0 max-w-none size-full" src={imgClipPathGroup1} />
          </div>
          <div className="absolute inset-[11.85%_23.38%_87.65%_63.43%]" data-node-id="456:608" data-name="Clip path group">
            <img loading="lazy" alt="" className="absolute block inset-0 max-w-none size-full" src={imgClipPathGroup2} />
          </div>
          <div className="absolute inset-[11.85%_23.38%_87.65%_63.43%]" data-node-id="456:612" data-name="Clip path group">
            <img loading="lazy" alt="" className="absolute block inset-0 max-w-none size-full" src={imgClipPathGroup3} />
          </div>
          <div className="absolute inset-[11.85%_23.38%_87.65%_63.43%]" data-node-id="456:616" data-name="Clip path group">
            <img loading="lazy" alt="" className="absolute block inset-0 max-w-none size-full" src={imgClipPathGroup4} />
          </div>
        </div>
        <p className="[word-break:break-word] absolute font-inter font-black leading-[normal] left-[calc(50%-127px)] not-italic text-[#429ff4] text-[24px] top-[1357px] w-[144px]" data-node-id="456:589">
          UPLOAD
        </p>
        <div className="absolute contents left-[51.53px] top-[1495px]" data-node-id="456:590">
          <div className="absolute bg-[#aff2fb] h-[39px] left-[51.53px] rounded-[8px] shadow-[2px_2px_10px_0px_rgba(0,0,0,0.25)] top-[1495px] w-[300.588px]" data-node-id="456:591" />
          <p className="[word-break:break-word] absolute font-inter font-semibold leading-[normal] left-[calc(50%-76px)] not-italic text-[14px] text-black top-[1505.66px] whitespace-nowrap" data-node-id="456:592">
            Upload Records
          </p>
          <div className="absolute left-[253px] size-[26.317px] top-[1502px]" data-node-id="456:593" data-name="Arrow / Arrow_Circle_Up_Right">
            <img loading="lazy" alt="" className="absolute block inset-0 max-w-none size-full" src={imgArrowArrowCircleUpRight} />
          </div>
        </div>
      </div>
      <div className="absolute contents left-[40px] top-[1637px]" data-node-id="456:856">
        <div className="absolute bg-white h-[368px] left-[40px] rounded-[15px] shadow-[8px_8px_20px_0px_rgba(0,0,0,0.25)] top-[1637px] w-[322px]" data-node-id="456:857" />
        <div className="absolute bottom-0 h-[-1519px] left-[calc(50%-147.82px)] pointer-events-none top-[1887px]" data-node-id="456:858">
          <p className="[word-break:break-word] font-inter font-medium leading-[normal] not-italic pointer-events-auto sticky text-[12px] text-black top-0 w-[294.824px]">Smart categories keep every document exactly where you expect it.</p>
        </div>
        <div className="absolute bottom-0 h-[-1481px] left-[calc(50%-147px)] pointer-events-none top-[1849px]" data-node-id="456:859">
          <p className="[word-break:break-word] font-inter font-medium leading-[normal] not-italic pointer-events-auto sticky text-[#6e6e6e] text-[12px] top-0 w-[257.765px]">Find files without searching.</p>
        </div>
        <div className="absolute bg-[rgba(66,159,244,0.23)] border-2 border-[#429ff4] border-solid h-[37px] left-[82px] rounded-[5px] top-[1654px] w-[266px]" data-node-id="456:860" />
        <div className="absolute bg-[rgba(182,66,244,0.2)] border border-[#b642f4] border-solid h-[37px] left-[66.35px] rounded-[5px] top-[1702px] w-[281.647px]" data-node-id="456:861" />
        <div className="absolute bg-[rgba(16,165,0,0.19)] border border-[#0eab00] border-solid h-[37px] left-[54px] rounded-[5px] top-[1750px] w-[294px]" data-node-id="456:862" />
        <p className="[word-break:break-word] absolute font-inter font-medium leading-[normal] left-[115px] not-italic text-[12px] text-black top-[1665px] w-[73px]" data-node-id="456:863">
          Cardiology
        </p>
        <p className="[word-break:break-word] absolute font-inter font-medium leading-[normal] left-[99.29px] not-italic text-[12px] text-black top-[1713px] whitespace-nowrap" data-node-id="456:864">
          Lab Results
        </p>
        <p className="[word-break:break-word] absolute font-inter font-medium leading-[normal] left-[84.47px] not-italic text-[12px] text-black top-[1761px] whitespace-nowrap" data-node-id="456:865">
          Prescriptions
        </p>
        <p className="[word-break:break-word] absolute font-inter font-black leading-[normal] left-[calc(50%-120.65px)] not-italic text-[#429ff4] text-[24px] top-[1811px] whitespace-nowrap" data-node-id="456:866">
          SELECT
        </p>
        <Folder className="absolute h-[24px] left-[73.77px] top-[1709px] w-[19.765px]" />
        <div className="absolute h-[24px] left-[89.41px] top-[1661px] w-[19.765px]" data-node-id="456:868" data-name="folder">
          <img loading="lazy" alt="" className="absolute block inset-0 max-w-none size-full" src={imgFolder1} />
        </div>
        <div className="absolute h-[24px] left-[54px] top-[1814px] w-[19.765px]" data-node-id="456:869" data-name="folder">
          <img loading="lazy" alt="" className="absolute block inset-0 max-w-none size-full" src={imgFolder1} />
        </div>
        <div className="absolute h-[24px] left-[58.94px] top-[1757px] w-[19.765px]" data-node-id="456:870" data-name="folder">
          <img loading="lazy" alt="" className="absolute block inset-0 max-w-none size-full" src={imgFolder2} />
        </div>
        <div className="absolute h-[28px] left-[201.41px] top-[1680px] w-[23.059px]" data-node-id="456:871" data-name="cursor 1">
          <img loading="lazy" alt="" className="absolute block inset-0 max-w-none size-full" src={imgCursor1} />
        </div>
        <div className="absolute bg-[rgba(66,159,244,0.25)] h-[19px] left-[292.82px] rounded-[5px] top-[1663px] w-[45.294px]" data-node-id="456:876" />
        <div className="absolute bg-[rgba(182,66,244,0.25)] h-[19px] left-[292.82px] rounded-[5px] top-[1711px] w-[45.294px]" data-node-id="456:877" />
        <div className="absolute bg-[rgba(85,193,75,0.25)] h-[19px] left-[292.82px] rounded-[5px] top-[1759px] w-[45.294px]" data-node-id="456:878" />
        <p className="[word-break:break-word] absolute font-inter font-medium leading-[normal] left-[301px] not-italic text-[#0080f5] text-[10px] top-[1667px] whitespace-nowrap" data-node-id="456:879">
          2 files
        </p>
        <p className="[word-break:break-word] absolute font-inter font-medium leading-[normal] left-[299px] not-italic text-[#6100e0] text-[10px] top-[1715px] whitespace-nowrap" data-node-id="456:880">
          13 files
        </p>
        <p className="[word-break:break-word] absolute font-inter font-medium leading-[normal] left-[301px] not-italic text-[#097500] text-[10px] top-[1762px] whitespace-nowrap" data-node-id="456:881">
          4 files
        </p>
        <div className="absolute contents left-[50.71px] top-[1948px]" data-node-id="456:882">
          <div className="absolute bg-[#aff2fb] h-[39px] left-[50.71px] rounded-[8px] shadow-[2px_2px_10px_0px_rgba(0,0,0,0.25)] top-[1948px] w-[300.588px]" data-node-id="456:883" />
          <p className="[word-break:break-word] absolute font-inter font-semibold leading-[normal] left-[calc(50%-84px)] not-italic text-[14px] text-black top-[1958.66px] whitespace-nowrap" data-node-id="456:884">
            Organize Records
          </p>
          <div className="absolute left-[258px] size-[26.317px] top-[1955px]" data-node-id="456:885" data-name="Arrow / Arrow_Circle_Up_Right">
            <img loading="lazy" alt="" className="absolute block inset-0 max-w-none size-full" src={imgArrowArrowCircleUpRight3} />
          </div>
        </div>
      </div>
      <div className="absolute contents left-0 top-[3137px]" data-node-id="603:917">
        <div className="[word-break:break-word] absolute font-raleway font-extrabold leading-[0] left-[calc(50%-161px)] text-[#141414] text-[30px] top-[3155px] w-[307px]" data-node-id="594:634">
          <p className="leading-[normal] mb-0">All Your Health Documents.</p>
          <p className="leading-[normal] text-[#429ff4]">One Secure Home.</p>
        </div>
        <div className="absolute bottom-0 h-[-2220px] left-[calc(50%-161px)] pointer-events-none top-[3137px]" data-node-id="594:636">
          <p className="[word-break:break-word] font-inter font-bold leading-[normal] not-italic pointer-events-auto sticky text-[#429ff4] text-[11px] top-0 whitespace-nowrap">Store · Sort · Share</p>
        </div>
        <div className="absolute contents left-[22px] top-[3751px]" data-node-id="594:689">
          <div className="absolute bg-[#f5f5f7] h-[89px] left-[22px] rounded-[10px] shadow-[4px_4px_20px_0px_rgba(0,0,0,0.25)] top-[3751px] w-[359px]" data-node-id="594:679" />
          <p className="[word-break:break-word] absolute font-inter font-black leading-[normal] left-[calc(50%-163px)] not-italic text-[#429ff4] text-[24px] top-[3769px] whitespace-nowrap" data-node-id="594:682">
            STORE
          </p>
          <div className="absolute bottom-0 h-[-3680px] left-[calc(50%-32px)] pointer-events-none top-[3769px]" data-node-id="594:685">
            <p className="[word-break:break-word] font-inter font-medium leading-[normal] not-italic pointer-events-auto sticky text-[14px] text-black top-0 w-[199px]">Keep every record secure and ready whenever you need it.</p>
          </div>
        </div>
        <div className="absolute contents left-[22px] top-[3858px]" data-node-id="594:841">
          <div className="absolute bg-[#f5f5f7] h-[89px] left-[22px] rounded-[10px] shadow-[4px_4px_20px_0px_rgba(0,0,0,0.25)] top-[3858px] w-[359px]" data-node-id="594:842" />
          <p className="[word-break:break-word] absolute font-inter font-black leading-[normal] left-[calc(50%-163px)] not-italic text-[#429ff4] text-[24px] top-[3876px] whitespace-nowrap" data-node-id="594:843">
            SORT
          </p>
          <div className="absolute bottom-0 h-[-3787px] left-[calc(50%-32px)] pointer-events-none top-[3876px]" data-node-id="594:844">
            <p className="[word-break:break-word] font-inter font-medium leading-[normal] not-italic pointer-events-auto sticky text-[14px] text-black top-0 w-[199px]">Find the right document in seconds, not minutes.</p>
          </div>
        </div>
        <div className="absolute contents left-[21px] top-[3965px]" data-node-id="594:846">
          <div className="absolute bg-[#f5f5f7] h-[89px] left-[21px] rounded-[10px] shadow-[4px_4px_20px_0px_rgba(0,0,0,0.25)] top-[3965px] w-[359px]" data-node-id="594:847" />
          <p className="[word-break:break-word] absolute font-inter font-black leading-[normal] left-[calc(50%-164px)] not-italic text-[#429ff4] text-[24px] top-[3983px] whitespace-nowrap" data-node-id="594:848">
            SHARE
          </p>
          <div className="absolute bottom-0 h-[-3894px] left-[calc(50%-33px)] pointer-events-none top-[3983px]" data-node-id="594:849">
            <p className="[word-break:break-word] font-inter font-medium leading-[normal] not-italic pointer-events-auto sticky text-[14px] text-black top-0 w-[199px]">Share important records instantly with doctors or loved ones.</p>
          </div>
        </div>
        <div className="absolute bottom-0 h-[-2358px] left-[calc(50%-161px)] pointer-events-none top-[3275px]" data-node-id="594:638">
          <p className="[word-break:break-word] font-inter font-medium leading-[normal] not-italic pointer-events-auto sticky text-[#6e6e6e] text-[12px] top-0 w-[307px]">Store prescriptions, lab reports, scans and medical records in one secure place, beautifully organized and ready whenever you need them.</p>
        </div>
        <div className="absolute h-[370px] left-0 top-[3347px] w-[404px]" data-node-id="594:642" data-name="11445426-ba2b-4c09-ac92-80556d060408 3">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img loading="lazy" alt="" className="absolute h-[144.65%] left-0 max-w-none top-[-10.84%] w-[199.74%]" src={img11445426Ba2B4C09Ac9280556D0604083} />
          </div>
        </div>
      </div>
      <div className="absolute contents left-0 top-[4104px]" data-node-id="594:868">
        <div className="absolute contents left-[21px] top-[4668px]" data-node-id="594:851">
          <div className="absolute bg-[#f5f5f7] h-[89px] left-[21px] rounded-[10px] shadow-[4px_4px_20px_0px_rgba(0,0,0,0.25)] top-[4668px] w-[359px]" data-node-id="594:852" />
          <p className="[word-break:break-word] absolute font-inter font-black leading-[normal] left-[calc(50%-164px)] not-italic text-[#429ff4] text-[24px] top-[4686px] whitespace-nowrap" data-node-id="594:853">
            REMIND
          </p>
          <div className="absolute bottom-0 h-[-4597px] left-[calc(50%-33px)] pointer-events-none top-[4686px]" data-node-id="594:854">
            <p className="[word-break:break-word] font-inter font-medium leading-[normal] not-italic pointer-events-auto sticky text-[14px] text-black top-0 w-[199px]">Stay on time with reminders that fit your daily schedule.</p>
          </div>
        </div>
        <div className="absolute contents left-[21px] top-[4775px]" data-node-id="594:855">
          <div className="absolute bg-[#f5f5f7] h-[89px] left-[21px] rounded-[10px] shadow-[4px_4px_20px_0px_rgba(0,0,0,0.25)] top-[4775px] w-[359px]" data-node-id="594:856" />
          <p className="[word-break:break-word] absolute font-inter font-black leading-[normal] left-[calc(50%-164px)] not-italic text-[#429ff4] text-[24px] top-[4793px] whitespace-nowrap" data-node-id="594:857">
            ROUTINE
          </p>
          <div className="absolute bottom-0 h-[-4704px] left-[calc(50%-33px)] pointer-events-none top-[4793px]" data-node-id="594:858">
            <p className="[word-break:break-word] font-inter font-medium leading-[normal] not-italic pointer-events-auto sticky text-[14px] text-black top-0 w-[199px]">Stay on time with reminders that fit your daily schedule.</p>
          </div>
        </div>
        <div className="absolute contents left-[20px] top-[4882px]" data-node-id="594:859">
          <div className="absolute bg-[#f5f5f7] h-[89px] left-[20px] rounded-[10px] shadow-[4px_4px_20px_0px_rgba(0,0,0,0.25)] top-[4882px] w-[359px]" data-node-id="594:860" />
          <p className="[word-break:break-word] absolute font-inter font-black leading-[normal] left-[calc(50%-165px)] not-italic text-[#429ff4] text-[24px] top-[4900px] whitespace-nowrap" data-node-id="594:861">
            CARE
          </p>
          <div className="absolute bottom-0 h-[-4811px] left-[calc(50%-34px)] pointer-events-none top-[4900px]" data-node-id="594:862">
            <p className="[word-break:break-word] font-inter font-medium leading-[normal] not-italic pointer-events-auto sticky text-[14px] text-black top-0 w-[199px]">Stay on time with reminders that fit your daily schedule.</p>
          </div>
        </div>
        <div className="[word-break:break-word] absolute font-raleway font-extrabold leading-[0] left-[calc(50%-161px)] text-[#141414] text-[30px] top-[4122px] w-[307px]" data-node-id="594:696">
          <p className="leading-[normal] mb-0">Never Miss</p>
          <p>
            <span className="leading-[normal]">{`A Dose `}</span>
            <span className="leading-[normal] text-[#429ff4]">Again.</span>
          </p>
        </div>
        <div className="absolute bottom-0 h-[-3237px] left-[calc(50%-161px)] pointer-events-none top-[4104px]" data-node-id="594:697">
          <p className="[word-break:break-word] font-inter font-bold leading-[normal] not-italic pointer-events-auto sticky text-[#429ff4] text-[11px] top-0 whitespace-nowrap">Medicine Reminder</p>
        </div>
        <div className="absolute bottom-0 h-[-3340px] left-[calc(50%-161px)] pointer-events-none top-[4207px]" data-node-id="594:710">
          <p className="[word-break:break-word] font-inter font-medium leading-[normal] not-italic pointer-events-auto sticky text-[#6e6e6e] text-[12px] top-0 w-[307px]">Receive simple, timely reminders that help you stay on track with your medicines, every single day.</p>
        </div>
        <div className="-translate-x-1/2 absolute h-[372px] left-[calc(50%+1px)] top-[4264px] w-[404px]" data-node-id="594:715" data-name="11445426-ba2b-4c09-ac92-80556d060408 4">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img loading="lazy" alt="" className="absolute h-[152.04%] left-[-104.65%] max-w-none top-[-17.6%] w-[209.85%]" src={img11445426Ba2B4C09Ac9280556D0604084} />
          </div>
        </div>
      </div>
      <div className="absolute contents left-[-4px] top-[5021px]" data-node-id="603:916">
        <div className="absolute contents left-[21px] top-[5609px]" data-node-id="594:870">
          <div className="absolute bg-[#f5f5f7] h-[89px] left-[21px] rounded-[10px] shadow-[4px_4px_20px_0px_rgba(0,0,0,0.25)] top-[5609px] w-[359px]" data-node-id="594:871" />
          <p className="[word-break:break-word] absolute font-inter font-black leading-[normal] left-[calc(50%-164px)] not-italic text-[#429ff4] text-[24px] top-[5627px] whitespace-nowrap" data-node-id="594:872">
            ADD
          </p>
          <div className="absolute bottom-0 h-[-5538px] left-[calc(50%-33px)] pointer-events-none top-[5627px]" data-node-id="594:873">
            <p className="[word-break:break-word] font-inter font-medium leading-[normal] not-italic pointer-events-auto sticky text-[14px] text-black top-0 w-[199px]">Create a profile for each family member in seconds.</p>
          </div>
        </div>
        <div className="absolute contents left-[21px] top-[5716px]" data-node-id="594:874">
          <div className="absolute bg-[#f5f5f7] h-[89px] left-[21px] rounded-[10px] shadow-[4px_4px_20px_0px_rgba(0,0,0,0.25)] top-[5716px] w-[359px]" data-node-id="594:875" />
          <p className="[word-break:break-word] absolute font-inter font-black leading-[normal] left-[calc(50%-164px)] not-italic text-[#429ff4] text-[24px] top-[5734px] whitespace-nowrap" data-node-id="594:876">
            SWITCH
          </p>
          <div className="absolute bottom-0 h-[-5645px] left-[calc(50%-33px)] pointer-events-none top-[5734px]" data-node-id="594:877">
            <p className="[word-break:break-word] font-inter font-medium leading-[normal] not-italic pointer-events-auto sticky text-[14px] text-black top-0 w-[199px]">Toggle between profiles instantly, right from your dashboard.</p>
          </div>
        </div>
        <div className="absolute contents left-[20px] top-[5823px]" data-node-id="594:878">
          <div className="absolute bg-[#f5f5f7] h-[89px] left-[20px] rounded-[10px] shadow-[4px_4px_20px_0px_rgba(0,0,0,0.25)] top-[5823px] w-[359px]" data-node-id="594:879" />
          <p className="[word-break:break-word] absolute font-inter font-black leading-[normal] left-[calc(50%-165px)] not-italic text-[#429ff4] text-[24px] top-[5841px] whitespace-nowrap" data-node-id="594:880">
            MANAGE
          </p>
          <div className="absolute bottom-0 h-[-5752px] left-[calc(50%-34px)] pointer-events-none top-[5841px]" data-node-id="594:881">
            <p className="[word-break:break-word] font-inter font-medium leading-[normal] not-italic pointer-events-auto sticky text-[14px] text-black top-0 w-[199px]">View records, reminders, and vitals for anyone in your family, anytime.</p>
          </div>
        </div>
        <p className="[word-break:break-word] absolute font-raleway font-extrabold leading-[0] left-[calc(50%-161px)] text-[#141414] text-[30px] top-[5039px] w-[307px]" data-node-id="594:882">
          <span className="leading-[normal]">{`One Dashboard. Every `}</span>
          <span className="leading-[normal] text-[#429ff4]">Loved One.</span>
        </p>
        <div className="absolute bottom-0 h-[-4130px] left-[calc(50%-161px)] pointer-events-none top-[5021px]" data-node-id="594:883">
          <p className="[word-break:break-word] font-inter font-bold leading-[normal] not-italic pointer-events-auto sticky text-[#429ff4] text-[11px] top-0 whitespace-nowrap">Family Health Management</p>
        </div>
        <div className="absolute bottom-0 h-[-4233px] left-[calc(50%-161px)] pointer-events-none top-[5124px]" data-node-id="594:884">
          <p className="[word-break:break-word] font-inter font-medium leading-[normal] not-italic pointer-events-auto sticky text-[#6e6e6e] text-[12px] top-0 w-[307px]">{`Parents, kids, grandparents — manage your whole family's health from a single, secure account. No separate logins, no scattered records.`}</p>
        </div>
        <div className="-translate-x-1/2 absolute h-[381px] left-[calc(50%-7px)] top-[5196px] w-[396px]" data-node-id="594:907" data-name="aaf2e3d5-9df7-42e6-9cb4-088821fd7c63 3">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img loading="lazy" alt="" className="absolute h-[137.04%] left-0 max-w-none top-[-12.64%] w-[205.35%]" src={imgAaf2E3D59Df742E69Cb4088821Fd7C633} />
          </div>
        </div>
      </div>
      <div className="absolute contents left-[6px] top-[5962px]" data-node-id="603:915">
        <div className="absolute contents left-[21px] top-[6582px]" data-node-id="594:888">
          <div className="absolute bg-[#f5f5f7] h-[89px] left-[21px] rounded-[10px] shadow-[4px_4px_20px_0px_rgba(0,0,0,0.25)] top-[6582px] w-[359px]" data-node-id="594:889" />
          <p className="[word-break:break-word] absolute font-inter font-black leading-[normal] left-[calc(50%-164px)] not-italic text-[#429ff4] text-[24px] top-[6600px] whitespace-nowrap" data-node-id="594:890">
            LOG
          </p>
          <div className="absolute bottom-0 h-[-6511px] left-[calc(50%-33px)] pointer-events-none top-[6600px]" data-node-id="594:891">
            <p className="[word-break:break-word] font-inter font-medium leading-[normal] not-italic pointer-events-auto sticky text-[14px] text-black top-0 w-[199px]">Record vitals in seconds, right from your phone.</p>
          </div>
        </div>
        <div className="absolute contents left-[21px] top-[6689px]" data-node-id="594:892">
          <div className="absolute bg-[#f5f5f7] h-[89px] left-[21px] rounded-[10px] shadow-[4px_4px_20px_0px_rgba(0,0,0,0.25)] top-[6689px] w-[359px]" data-node-id="594:893" />
          <p className="[word-break:break-word] absolute font-inter font-black leading-[normal] left-[calc(50%-164px)] not-italic text-[#429ff4] text-[24px] top-[6707px] whitespace-nowrap" data-node-id="594:894">
            TREND
          </p>
          <div className="absolute bottom-0 h-[-6618px] left-[calc(50%-33px)] pointer-events-none top-[6707px]" data-node-id="594:895">
            <p className="[word-break:break-word] font-inter font-medium leading-[normal] not-italic pointer-events-auto sticky text-[14px] text-black top-0 w-[199px]">See patterns over time with simple, clear charts.</p>
          </div>
        </div>
        <div className="absolute contents left-[20px] top-[6796px]" data-node-id="594:896">
          <div className="absolute bg-[#f5f5f7] h-[89px] left-[20px] rounded-[10px] shadow-[4px_4px_20px_0px_rgba(0,0,0,0.25)] top-[6796px] w-[359px]" data-node-id="594:897" />
          <p className="[word-break:break-word] absolute font-inter font-black leading-[normal] left-[calc(50%-165px)] not-italic text-[#429ff4] text-[24px] top-[6814px] whitespace-nowrap" data-node-id="594:898">
            SHARE
          </p>
          <div className="absolute bottom-0 h-[-6725px] left-[calc(50%-34px)] pointer-events-none top-[6814px]" data-node-id="594:899">
            <p className="[word-break:break-word] font-inter font-medium leading-[normal] not-italic pointer-events-auto sticky text-[14px] text-black top-0 w-[199px]">Send your vitals history to any doctor before your next visit.</p>
          </div>
        </div>
        <p className="[word-break:break-word] absolute font-raleway font-extrabold leading-[0] left-[calc(50%-161px)] text-[#141414] text-[30px] top-[5980px] w-[307px]" data-node-id="594:900">
          <span className="leading-[normal]">{`Track What Matters. Every `}</span>
          <span className="leading-[normal] text-[#429ff4]">Single Day.</span>
        </p>
        <div className="absolute bottom-0 h-[-5039px] left-[calc(50%-161px)] pointer-events-none top-[5962px]" data-node-id="594:901">
          <p className="[word-break:break-word] font-inter font-bold leading-[normal] not-italic pointer-events-auto sticky text-[#429ff4] text-[11px] top-0 whitespace-nowrap">Daily Vitals</p>
        </div>
        <div className="absolute bottom-0 h-[-5142px] left-[calc(50%-161px)] pointer-events-none top-[6065px]" data-node-id="594:902">
          <p className="[word-break:break-word] font-inter font-medium leading-[normal] not-italic pointer-events-auto sticky text-[#6e6e6e] text-[12px] top-0 w-[307px]">Blood sugar, blood pressure, fever — log the numbers that keep you and your family safe, and spot patterns before they become problems.</p>
        </div>
        <div className="-translate-x-1/2 absolute h-[413px] left-[calc(50%-0.5px)] top-[6137px] w-[389px]" data-node-id="603:911" data-name="aaf2e3d5-9df7-42e6-9cb4-088821fd7c63 3">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img loading="lazy" alt="" className="absolute h-[116.82%] left-[-102.64%] max-w-none top-[-5.92%] w-[202.64%]" src={imgAaf2E3D59Df742E69Cb4088821Fd7C633} />
          </div>
        </div>
      </div>
      <div id="launching-next" className="absolute bg-[#f5f5f7] left-0 overflow-clip top-[7276px] w-[402px]" style={{ height: showAllCards ? 2585 : 1130 }} data-node-id="603:1412">
        <p className="[word-break:break-word] absolute font-raleway font-extrabold leading-[normal] left-[calc(50%-161px)] text-[#141414] text-[35px] top-[50px] whitespace-nowrap" data-node-id="603:982">
          Launching Next
        </p>
        <div className="absolute bottom-0 h-[2487px] left-[calc(50%-161px)] pointer-events-none top-[98px]" data-node-id="603:983">
          <p className="[word-break:break-word] font-inter font-medium leading-[normal] not-italic pointer-events-auto sticky text-[#6e6e6e] text-[12px] top-0 w-[336px]">{`Here's what's coming to your EvoCare dashboard — built with real patients and doctors.`}</p>
        </div>
        <div className="absolute bottom-0 h-[2557px] left-[calc(50%-161px)] pointer-events-none top-[28px]" data-node-id="603:984">
          <p className="[word-break:break-word] font-inter font-medium leading-[normal] not-italic pointer-events-auto sticky text-[#429ff4] text-[12px] top-0 whitespace-nowrap">Upcoming Features</p>
        </div>
        <div className="launching-next-card-group group absolute left-[22px] top-[149px] h-[263px] w-[357px]" data-node-id="603:1403">
          <div className="launching-next-card absolute inset-0 rounded-[20px] bg-[rgba(175,242,251,0.6)]" data-node-id="603:1036" />
          <div className="pointer-events-none absolute left-[171px] top-[74px] h-[189px] w-[183px]" data-node-id="603:1052" data-name="d6b5b3cf-d8d2-4b6a-9d67-c13c7443f4a6 8">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img loading="lazy" alt="" className="absolute h-[388.82%] left-[-388.86%] max-w-none top-[-257.04%] w-[600.33%]" src={imgD6B5B3CfD8D24B6A9D67C13C7443F4A68} />
            </div>
          </div>
          <p className="[word-break:break-word] absolute left-[21px] top-[20px] z-10 font-inter font-black leading-[normal] not-italic text-[#429ff4] text-[24px] uppercase w-[343px]" data-node-id="603:1385">
            Prescription Safety Cross-Checking
          </p>
          <div className="absolute left-[21px] top-[101px] z-10 w-[168px]" data-node-id="603:1386">
            <div className="[word-break:break-word] font-inter font-normal leading-[0] not-italic text-[13px] text-black">
              <p className="leading-[normal] mb-0">Every new prescription is automatically scanned against your history to catch drug</p>
              <p className="leading-[normal]">interactions, allergies, and health risks before they become a problem.</p>
            </div>
          </div>
        </div>
        <div className="launching-next-card-group group absolute left-[22px] top-[437px] h-[231px] w-[357px]" data-node-id="603:1404">
          <div className="launching-next-card absolute inset-0 rounded-[20px] bg-white" data-node-id="603:1054" />
          <div className="pointer-events-none absolute left-[195px] top-[59px] h-[172px] w-[163px] rounded-[20px]" data-node-id="603:1056" data-name="d6b5b3cf-d8d2-4b6a-9d67-c13c7443f4a6 8">
            <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[20px]">
              <img loading="lazy" alt="" className="absolute h-[426.84%] left-[-559.24%] max-w-none top-[-274.38%] w-[674.69%]" src={imgD6B5B3CfD8D24B6A9D67C13C7443F4A68} />
            </div>
          </div>
          <p className="[word-break:break-word] absolute left-[21px] top-[23px] z-10 font-inter font-black leading-[normal] not-italic text-[#429ff4] text-[24px] uppercase w-[271px]" data-node-id="603:1388">
            The Insurance Vault
          </p>
          <div className="absolute left-[21px] top-[104px] z-10 w-[168px]" data-node-id="603:1389">
            <div className="[word-break:break-word] font-inter font-normal leading-[0] not-italic text-[13px] text-black">
              <p className="leading-[normal] mb-0">{`Enter your coverage details once. EvoCare automatically maps what's covered, what`}</p>
              <p className="leading-[normal]">{`isn't, and what to expect before a procedure.`}</p>
            </div>
          </div>
        </div>
        <div className="launching-next-card-group group absolute left-[22px] top-[701px] h-[307px] w-[357px]" data-node-id="603:1405">
          <div className="launching-next-card absolute inset-0 rounded-[20px] bg-[#cbf3f9]" data-node-id="603:1040" />
          <div className="pointer-events-none absolute left-[120px] top-[79px] h-[228px] w-[237px]" data-node-id="603:1058" data-name="d6b5b3cf-d8d2-4b6a-9d67-c13c7443f4a6 8">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img loading="lazy" alt="" className="absolute h-[197.56%] left-[-6.42%] max-w-none top-[0.16%] w-[285.05%]" src={imgD6B5B3CfD8D24B6A9D67C13C7443F4A68} />
            </div>
          </div>
          <p className="[word-break:break-word] absolute left-[21px] top-[26px] z-10 font-inter font-black leading-[normal] not-italic text-[#429ff4] text-[24px] uppercase w-[313px]" data-node-id="603:1391">
            Doctor-Ready Summary Reports
          </p>
          <div className="absolute left-[21px] top-[107px] z-10 w-[178px]" data-node-id="603:1392">
            <p className="[word-break:break-word] font-inter font-normal leading-[normal] not-italic text-[13px] text-black">Log your symptoms before your appointment. EvoCare builds a structured, chronological timeline for your doctor — plus an AI-curated list of questions worth asking.</p>
          </div>
        </div>
        {/* Cards 4–8 — hidden until user taps Load More */}
        {showAllCards && (
          <>
        <div className="launching-next-card-group group absolute left-[22px] top-[1033px] h-[267px] w-[357px]" data-node-id="603:1406">
          <div className="launching-next-card absolute inset-0 rounded-[20px] bg-white" data-node-id="603:1041" />
          <div className="pointer-events-none absolute left-[213px] top-[65px] h-[202px] w-[150px]" data-node-id="603:1060" data-name="d6b5b3cf-d8d2-4b6a-9d67-c13c7443f4a6 8">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img loading="lazy" alt="" className="absolute h-[305.96%] left-[-210.42%] max-w-none top-[-190.41%] w-[618.22%]" src={imgD6B5B3CfD8D24B6A9D67C13C7443F4A68} />
            </div>
          </div>
          <p className="[word-break:break-word] absolute left-[21px] top-[26px] z-10 font-inter font-black leading-[normal] not-italic text-[#429ff4] text-[24px] uppercase w-[304px]" data-node-id="603:1393">{`Personalized Health Education & Coaching`}</p>
          <div className="absolute left-[21px] top-[136px] z-10 w-[191px]" data-node-id="603:1394">
            <p className="[word-break:break-word] font-inter font-normal leading-[normal] not-italic text-[13px] text-black">Curated, disease-specific tips, learning content, and lifestyle suggestions built around your health profile.</p>
          </div>
        </div>
        <div className="launching-next-card-group group absolute left-[22px] top-[1329px] h-[278px] w-[357px]" data-node-id="603:1407">
          <div className="launching-next-card absolute inset-0 rounded-[20px] bg-white" data-node-id="603:1043" />
          <div className="pointer-events-none absolute left-[192px] top-[84px] h-[194px] w-[165px] rounded-[20px]" data-node-id="603:1062" data-name="d6b5b3cf-d8d2-4b6a-9d67-c13c7443f4a6 8">
            <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[20px]">
              <img loading="lazy" alt="" className="absolute h-[478.85%] left-[-159.45%] max-w-none top-[-288.52%] w-[841.41%]" src={imgD6B5B3CfD8D24B6A9D67C13C7443F4A68} />
            </div>
          </div>
          <p className="[word-break:break-word] absolute left-[21px] top-[26px] z-10 font-inter font-black leading-[normal] not-italic text-[#429ff4] text-[24px] uppercase w-[343px]" data-node-id="603:1395">
            Disease-Specific Entry Metrics
          </p>
          <div className="absolute left-[21px] top-[107px] z-10 w-[171px]" data-node-id="603:1396">
            <div className="[word-break:break-word] font-inter font-normal leading-[0] not-italic text-[13px] text-black">
              <p className="leading-[normal] mb-0">Daily tracking fields tailored to your exact condition — giving your doctor high-fidelity</p>
              <p className="leading-[normal]">structured data at every appointment.</p>
            </div>
          </div>
        </div>
        <div className="launching-next-card-group group absolute left-[22px] top-[1632px] h-[270px] w-[357px]" data-node-id="603:1408">
          <div className="launching-next-card absolute inset-0 rounded-[20px] bg-[rgba(175,242,251,0.6)]" data-node-id="603:1044" />
          <div className="pointer-events-none absolute left-[189px] top-[66px] h-[204px] w-[167px] rounded-bl-[20px] rounded-br-[20px] rounded-tl-[20px]" data-node-id="603:1064" data-name="d6b5b3cf-d8d2-4b6a-9d67-c13c7443f4a6 8">
            <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-bl-[20px] rounded-br-[20px] rounded-tl-[20px]">
              <img loading="lazy" alt="" className="absolute h-[432.19%] left-[4.5%] max-w-none top-[-260.03%] w-[790.51%]" src={imgD6B5B3CfD8D24B6A9D67C13C7443F4A68} />
            </div>
          </div>
          <p className="[word-break:break-word] absolute left-[21px] top-[26px] z-10 font-inter font-black leading-[normal] not-italic text-[#429ff4] text-[24px] uppercase w-[343px]" data-node-id="603:1397">
            Unified Health Dashboard
          </p>
          <div className="absolute left-[21px] top-[107px] z-10 w-[178px]" data-node-id="603:1398">
            <p className="[word-break:break-word] font-inter font-normal leading-[normal] not-italic text-[13px] text-black">One command center. Personalized, condition-specific care pipelines for chronic illnesses and ongoing health situations.</p>
          </div>
        </div>
        <div className="launching-next-card-group group absolute left-[22px] top-[1927px] h-[241px] w-[357px]" data-node-id="603:1409">
          <div className="launching-next-card absolute inset-0 rounded-[20px] bg-white" data-node-id="603:1045" />
          <div className="pointer-events-none absolute left-[174px] top-[89px] h-[152px] w-[182px]" data-node-id="603:1066" data-name="d6b5b3cf-d8d2-4b6a-9d67-c13c7443f4a6 8">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img loading="lazy" alt="" className="absolute h-[566.98%] left-[-362.14%] max-w-none top-[-357.42%] w-[710.12%]" src={imgD6B5B3CfD8D24B6A9D67C13C7443F4A68} />
            </div>
          </div>
          <p className="[word-break:break-word] absolute left-[21px] top-[25px] z-10 font-inter font-black leading-[normal] not-italic text-[#429ff4] text-[24px] uppercase w-[343px]" data-node-id="603:1399">
            Predictive Medicine Refill Alerts
          </p>
          <div className="absolute left-[21px] top-[106px] z-10 w-[156px]" data-node-id="603:1400">
            <p className="[word-break:break-word] font-inter font-normal leading-[normal] not-italic text-[13px] text-black">Smarter than a reminder — EvoCare tells you exactly when your physical prescription supply is about to run out</p>
          </div>
        </div>
        <div className="launching-next-card-group group absolute left-[22px] top-[2193px] h-[307px] w-[357px]" data-node-id="603:1410">
          <div className="launching-next-card absolute inset-0 rounded-[20px] bg-[rgba(175,242,251,0.6)]" data-node-id="603:1046" />
          <div className="pointer-events-none absolute left-[139px] top-[89px] h-[222px] w-[234px]" data-node-id="603:1068" data-name="d6b5b3cf-d8d2-4b6a-9d67-c13c7443f4a6 8">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img loading="lazy" alt="" className="absolute h-[191.81%] left-[-149.47%] max-w-none top-[-0.04%] w-[272.34%]" src={imgD6B5B3CfD8D24B6A9D67C13C7443F4A68} />
            </div>
          </div>
          <p className="[word-break:break-word] absolute left-[21px] top-[25px] z-10 font-inter font-black leading-[normal] not-italic text-[#429ff4] text-[24px] uppercase w-[343px]" data-node-id="603:1401">
            Prescription Safety Cross-Checking
          </p>
          <div className="absolute left-[21px] top-[106px] z-10 w-[131px]" data-node-id="603:1402">
            <p className="[word-break:break-word] font-inter font-normal leading-[normal] not-italic text-[13px] text-black">Critical medical details, right on your lock screen. In an emergency, anyone can scan and access life-saving information in seconds — no unlocking required</p>
          </div>
        </div>
        <div className="absolute bottom-0 h-[56px] left-[calc(50%-158px)] pointer-events-none top-[2529px]" data-node-id="603:1383">
          <p className="[word-break:break-word] font-inter font-black leading-[normal] not-italic pointer-events-auto sticky text-[#429ff4] text-[13px] top-0 whitespace-nowrap">More amazing features coming soon. Stay tuned.</p>
        </div>
          </>
        )}
        {/* Load More / Show Less button */}
        <button
          type="button"
          onClick={() => setShowAllCards((v) => !v)}
          className="pointer-events-auto absolute left-[22px] w-[357px] flex items-center justify-center gap-2 rounded-[16px] border-2 border-[#429ff4] bg-white py-[14px] text-[14px] font-bold text-[#429ff4] transition hover:bg-[#f0fbff] active:scale-95"
          style={{ top: showAllCards ? 2528 : 1033 }}
        >
          {showAllCards ? (
            <>
              <span>Show Less</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>
            </>
          ) : (
            <>
              <span>Load More Features</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
            </>
          )}
        </button>
      </div>
      <div id="contact" className="absolute h-[705px] left-px w-[402px]" style={{ top: showAllCards ? 9861 : 8406 }} data-node-id="603:1438">
        <div className="-translate-x-1/2 absolute bg-[#aff2fb] h-[705px] left-1/2 top-0 w-[402px]" data-node-id="603:1413" />
        <div className="-translate-x-1/2 absolute contents left-[calc(50%+1.5px)] top-[208px]" data-node-id="603:1414">
          <div className="-translate-x-1/2 absolute bg-white h-[465px] left-[calc(50%+1.5px)] rounded-[14px] top-[208px] w-[347px]" data-node-id="603:1415" />
          <div className="absolute bottom-0 h-[232px] left-[calc(50%+2px)] pointer-events-none top-[233px]" data-node-id="603:1416">
            <p className="-translate-x-1/2 [word-break:break-word] font-raleway font-extrabold leading-[normal] pointer-events-auto sticky text-[#429ff4] text-[36px] text-center top-0 w-[330px]">Login/Sign Up Now</p>
          </div>
          <div className="absolute bottom-0 h-[138px] left-[calc(50%+2px)] pointer-events-none top-[327px]" data-node-id="603:1417">
            <p className="-translate-x-1/2 [word-break:break-word] font-inter font-medium leading-[normal] not-italic pointer-events-auto sticky text-[#585858] text-[12px] text-center top-0 w-[322px]">Everything you need to know about architecture, security, and clinical integration.</p>
          </div>
          <div className="absolute contents left-[52px] top-[531px]" data-node-id="603:1418">
            <div className="absolute bg-[#429ff4] h-[48px] left-[52px] rounded-[5px] top-[531px] w-[301px]" data-node-id="603:1419" />
            <div className="-translate-x-1/2 -translate-y-1/2 absolute contents left-[calc(50%+1.68px)] top-[555px]" data-node-id="603:1420">
              <div className="-translate-x-1/2 absolute contents left-[calc(50%+1.68px)] top-[547px]" data-node-id="603:1421">
                <p className="[word-break:break-word] absolute font-inter font-bold h-[16px] leading-[normal] left-[calc(50%-89px)] not-italic text-[12px] text-white top-[539px] w-[181.366px]" data-node-id="603:1422">
                  Login now
                </p>
                <div className="absolute h-0 left-[244.53px] top-[555px] w-[34.413px]" data-node-id="603:1423">
                  <div className="absolute inset-[-7.36px_-2.91%_-7.36px_0]">
                    <img loading="lazy" alt="" className="block max-w-none size-full" src={imgLine2} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute contents left-[52px] top-[462px]" data-node-id="603:1426">
            <div className="absolute bg-white border border-[#429ff4] border-solid h-[48px] left-[52px] rounded-[5px] top-[462px] w-[301px]" data-node-id="603:1427" />
          </div>
          <div className="absolute contents left-[52px] top-[393px]" data-node-id="603:1428">
            <div className="absolute bg-white border border-[#429ff4] border-solid h-[48px] left-[52px] rounded-[5px] top-[393px] w-[300.476px]" data-node-id="603:1429" />
          </div>
          <div className="absolute bottom-0 h-[55px] left-[calc(50%-137px)] pointer-events-none top-[410px]" data-node-id="603:1430">
            <p className="[word-break:break-word] font-inter font-normal leading-[0] not-italic pointer-events-auto sticky text-[#a1a1a1] text-[0px] top-0 whitespace-nowrap">
              <span className="leading-[normal] text-[11px]">{`Name `}</span>
              <span className="leading-[normal] text-[11px] text-[rgba(255,0,0,0.5)]">*</span>
            </p>
          </div>
          <div className="absolute bottom-0 h-[-14px] left-[calc(50%-137px)] pointer-events-none top-[479px]" data-node-id="603:1431">
            <p className="[word-break:break-word] font-inter font-normal leading-[0] not-italic pointer-events-auto sticky text-[#a1a1a1] text-[0px] top-0 whitespace-nowrap">
              <span className="leading-[normal] text-[11px]">{`Email `}</span>
              <span className="leading-[normal] text-[11px] text-[rgba(255,0,0,0.5)]">*</span>
            </p>
          </div>
        </div>
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-inter font-medium leading-[24px] left-[calc(50%+4.5px)] not-italic text-[11px] text-black text-center top-[132px] w-[345px]" data-node-id="603:1434">
          Share what works, what doesn’t, and what should change. Every response helps refine the experience.
        </p>
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-raleway font-extrabold leading-[normal] left-[calc(50%+4.5px)] text-[#141414] text-[38px] text-center top-[32px] w-[357px]" data-node-id="603:1435">
          Your Voice Shapes What Comes Next
        </p>
      </div>
      <div className="-translate-x-1/2 absolute bottom-0 h-[433px] left-[calc(50%+0.5px)] w-[405px]" data-node-id="603:1439">
        <div className="absolute bg-[#eee] h-[438px] left-0 top-0 w-[402px]" data-node-id="603:1440" />
        <p className="[word-break:break-word] absolute font-raleway font-extrabold leading-[normal] left-[calc(50%-199.5px)] text-[#d6d6d6] text-[95px] top-[356px] whitespace-nowrap" data-node-id="603:1441">
          Evocare
        </p>
        <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-inter font-normal justify-center leading-[0] left-[calc(50%-171.5px)] not-italic text-[#1b1b1b] text-[13px] top-[43px] w-[344px]" data-node-id="603:1442">
          <p className="leading-[normal]">The next generation of clinical intelligence. Empowering modern physicians with AI-assisted diagnostics and high-fidelity insights.</p>
        </div>
        <button
          type="button"
          aria-label="Instagram"
          className="footer-interactive-icon absolute bg-[#eee] content-stretch flex items-center justify-center left-[31px] rounded-[4px] size-[40px] top-[94px]"
          data-node-id="603:1443"
          data-name="Background"
          onClick={() => openSocial("https://www.instagram.com/Evocare.in/")}
        >
          <div className="relative shrink-0 size-[20px]" data-node-id="603:1444" data-name="SVG">
            <img loading="lazy" alt="" className="absolute block inset-0 max-w-none size-full" src={imgInstagram} />
          </div>
        </button>
        <button
          type="button"
          aria-label="LinkedIn"
          className="footer-interactive-icon absolute bg-[#eee] content-stretch flex items-center justify-center left-[87px] rounded-[4px] size-[40px] top-[94px]"
          data-node-id="603:1446"
          data-name="Background"
          onClick={() => openSocial("https://www.linkedin.com/company/Evocare-in/")}
        >
          <div className="relative shrink-0 size-[20px]" data-node-id="603:1447" data-name="SVG">
            <img loading="lazy" alt="" className="absolute block inset-0 max-w-none size-full" src={imgLinkedIn} />
          </div>
        </button>
        <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-inter font-semibold justify-center leading-[0] left-[31px] not-italic text-[12px] text-black top-[182px] tracking-[0.6px] w-[75px]" data-node-id="603:1449">
          <p className="leading-[12px]">Platform</p>
        </div>
        <button
          type="button"
          className="footer-interactive-link -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-inter font-normal justify-center leading-[0] left-[31px] not-italic text-[12px] text-black text-left top-[214px] tracking-[0.6px] whitespace-nowrap"
          data-node-id="603:1450"
          onClick={() => window.location.assign("/evocare/about")}
        >
          <span className="leading-[12px]">About Us</span>
        </button>
        <button
          type="button"
          className="footer-interactive-link -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-inter font-normal justify-center leading-[0] left-[31px] not-italic text-[12px] text-black text-left top-[246px] tracking-[0.6px] whitespace-nowrap"
          data-node-id="603:1451"
          onClick={footerToast.login}
        >
          <span className="leading-[12px]">Log In</span>
        </button>
        <button
          type="button"
          className="footer-interactive-link -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-inter font-normal justify-center leading-[0] left-[147px] not-italic text-[12px] text-black text-left top-[214px] tracking-[0.6px] whitespace-nowrap"
          data-node-id="603:1452"
          onClick={() => footerGo("contact")}
        >
          <span className="leading-[12px]">About Founder</span>
        </button>
        <button
          type="button"
          className="footer-interactive-link -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-inter font-normal justify-center leading-[0] left-[147px] not-italic text-[12px] text-black text-left top-[246px] tracking-[0.6px] whitespace-nowrap"
          data-node-id="603:1453"
          onClick={() => window.location.assign("/evodoc/contact")}
        >
          <span className="leading-[12px]">Contact Us</span>
        </button>
        <button
          type="button"
          className="footer-interactive-link -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-inter font-normal justify-center leading-[0] left-[147px] not-italic text-[12px] text-black text-left top-[278px] tracking-[0.6px] whitespace-nowrap"
          data-node-id="603:1454"
          onClick={() => footerGo("contact")}
        >
          <span className="leading-[12px]">Feedback</span>
        </button>
        <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-inter font-semibold justify-center leading-[0] left-[147px] not-italic text-[12px] text-black top-[182px] tracking-[0.6px] whitespace-nowrap" data-node-id="603:1455">
          <p className="leading-[12px]">Connect</p>
        </div>
        <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-inter font-semibold justify-center leading-[0] left-[279px] not-italic text-[12px] text-black top-[182px] tracking-[0.6px] whitespace-nowrap" data-node-id="603:1456">
          <p className="leading-[12px]">More Info</p>
        </div>
        <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-inter font-normal justify-center leading-[0] left-[31px] not-italic text-[#636363] text-[12px] top-[344px] whitespace-nowrap" data-node-id="603:1457">
          <p className="leading-[24px]">© 2026 Evocare AI. All rights reserved.</p>
        </div>
        <button
          type="button"
          className="footer-interactive-link -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-inter font-normal justify-center leading-[0] left-[279px] not-italic text-[#636363] text-[12px] text-left top-[214px] whitespace-nowrap"
          data-node-id="603:1458"
          onClick={footerToast.privacy}
        >
          <span className="leading-[24px]">Privacy Policy</span>
        </button>
        <button
          type="button"
          className="footer-interactive-link -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-inter font-normal justify-center leading-[0] left-[279px] not-italic text-[#636363] text-[12px] text-left top-[245px] whitespace-nowrap"
          data-node-id="603:1459"
          onClick={footerToast.terms}
        >
          <span className="leading-[24px]">Terms of Service</span>
        </button>
        <button
          type="button"
          className="footer-interactive-link -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-inter font-normal justify-center leading-[0] left-[279px] not-italic text-[#636363] text-[12px] text-left top-[276px] whitespace-nowrap"
          data-node-id="603:1460"
          onClick={footerToast.cookies}
        >
          <span className="leading-[24px]">Cookies</span>
        </button>
      </div>
      <div className="absolute bg-white h-[110px] left-0 top-0 w-[402px]" data-node-id="444:864" />
      <div className="absolute h-[30px] left-[23px] top-[68px] w-[90px]" data-node-id="444:865" data-name="Untitled design (2) 1">
        <img loading="lazy" alt="EvoCare" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgUntitledDesign21} />
      </div>
      <button type="button" tabIndex={-1} aria-hidden className="absolute block h-[20px] left-[344px] pointer-events-none top-[73px] w-[32.5px]" data-node-id="444:866" data-name="Hamburger">
        <div className="absolute bg-black inset-[0_0_79.17%_0] rounded-[30px]" data-node-id="444:867" />
        <div className="absolute bg-black inset-[37.5%_0] rounded-[30px]" data-node-id="444:868" />
        <div className="absolute bg-black inset-[79.17%_0_0_0] rounded-[30px]" data-node-id="444:869" />
      </button>
    </div>
  );
}
