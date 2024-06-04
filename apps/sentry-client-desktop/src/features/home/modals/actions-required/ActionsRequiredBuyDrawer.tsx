import { AiOutlineClose } from "react-icons/ai";
import { IoMdCloseCircle } from "react-icons/io";
import { useSetAtom } from "jotai";
import { drawerStateAtom, DrawerView } from "../../../drawer/DrawerManager";
import { WarningIcon } from "../../../../../../../packages/ui/src/rebrand/icons/IconsComponents";
import { PrimaryButton } from "../../../../../../../packages/ui/src/rebrand";

export function ActionsRequiredBuyDrawer() {
  const setDrawerState = useSetAtom(drawerStateAtom);

  return (
    <div className="h-full flex flex-col justify-start items-center">
      <div className="w-full h-[4rem] flex flex-row justify-between items-center border-b border-primaryBorderColor text-lg font-semibold px-8">
        <div className="flex flex-row gap-2 items-center">
          <WarningIcon width={28} height={24} />{" "}
          <span className="text-white text-[24px] font-bold">
            Actions required
          </span>
        </div>
        <div
          className="cursor-pointer z-10"
          onClick={() => setDrawerState(null)}
        >
          <AiOutlineClose color={"white"} />
        </div>
      </div>

      <div className="w-full flex flex-col gap-4 px-6 pt-[1rem]">
        <div className="flex flex-col gap-2 bg-[#FFC53D1A] p-6 global-cta-clip-path">
          <span className="flex flex-row gap-1 items-center text-lg font-bold text-primaryTooltipColor">
            <IoMdCloseCircle size={22} color={"#FFC53D"} /> You do not own a key
          </span>
          <p className="text-lg text-primaryTooltipColor pl-6 mb-[16px] font-medium">
            No Xai Sentry Node Keys found in all added wallets
          </p>

          <div className="pb-2 font-semibold pl-6 mb-[5px]">
          <PrimaryButton
            onClick={() => setDrawerState(DrawerView.BuyKeys)}
            className={`w-[155px] bg-btnPrimaryBgColor text-white hover:text-btnPrimaryBgColor hover:bg-white`}
            btnText="PURCHASE KEY"
            colorStyle="primary"
			size="sm"
            />
          </div>

          <p className="text-lg text-primaryTooltipColor pl-6 font-medium">
            Already own a key?
            <a
              onClick={() => setDrawerState(DrawerView.ViewKeys)}
              className="text-[#F30919] ml-1 cursor-pointer text-lg font-bold"
            >
              Add wallet
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
