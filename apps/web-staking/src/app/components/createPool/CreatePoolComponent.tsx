"use client";

import MainTitle from "@/app/components/titles/MainTitle";
import PoolDetailsComponent from "@/app/components/createPool/PoolDetailsComponent";
import SocialLinksComponent from "@/app/components/createPool/SocialLinksComponent";
import RewardComponent, { Rewards } from "@/app/components/createPool/RewardComponent";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ButtonBack,
} from "@/app/components/buttons/ButtonsComponent";
import { useRouter } from "next/navigation";
import { useAccount, useSwitchChain, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { loadingNotification, updateNotification } from "../notifications/NotificationsComponent";
import { WriteFunctions, executeContractWrite } from "@/services/web3.writes";
import { POOL_SHARES_BASE, getNetwork, getUnstakedKeysOfUser, mapWeb3Error, ZERO_ADDRESS, getPoolAddressOfUserAtIndex, getPoolsOfUserCount } from "@/services/web3.service";
import StakePoolKeyComponent from "./StakePoolKeyComponent";
import DelegateAddressComponent from "./DelegateAddressComponent";
import { Id } from "react-toastify";
import { PrimaryButton } from "../ui";


const CreatePoolComponent = ({ bannedWords }: { bannedWords: string[] }) => {
  const router = useRouter();
  const [errorValidationDetails, setErrorValidationDetails] = useState({
    name: true,
    description: true,
    logoUrl: false,
    trackerName: false,
    trackerTicker: false,
  });
  const [errorValidationRewards, setErrorValidationRewards] = useState(false);
  const [errorValidationAddress, setErrorValidationAddress] = useState(false);
  const [receipt, setReceipt] = useState<`0x${string}` | undefined>();
  const [showStakePoolKey, setShowStakePoolKey] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [currentPoolCount, setCurrentPoolCount] = useState(0);

  const { address, chainId } = useAccount();

  const { switchChain } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  // Substitute Timeouts with useWaitForTransaction
  const { isError, isLoading, isSuccess, status } = useWaitForTransactionReceipt({
    hash: receipt,
  });

  const [poolDetailsValues, setPoolDetailsValues] = useState({
    name: "",
    description: "",
    logoUrl: "",
    trackerName: "",
    trackerTicker: "",
  });
  const [rewardsValues, setRewardsValues] = useState<Rewards>({
    owner: "",
    keyholder: "",
    staker: "",
  });
  const [socialLinks, setSocialLinks] = useState({
    website: "",
    discord: "",
    telegram: "",
    twitter: "",
    instagram: "",
    youTube: "",
    tiktok: "",
  });

  const [delegateAddress, setDelegateAddress] = useState("");
  const ref = useRef<null | HTMLDivElement>(null);
  const toastId = useRef<Id>();

  const onConfirm = async (numKeys: number) => {

    toastId.current = loadingNotification("Transaction pending...");

    try {

      const keyIds = await getUnstakedKeysOfUser(getNetwork(chainId), address as string, numKeys);
      setCurrentPoolCount(await getPoolsOfUserCount(getNetwork(chainId), address as string));
      setReceipt(await executeContractWrite(
        WriteFunctions.createPool,
        [
          delegateAddress || ZERO_ADDRESS,
          keyIds,
          [
            BigInt((Number(rewardsValues.owner) * POOL_SHARES_BASE).toFixed(0)),
            BigInt((Number(rewardsValues.keyholder) * POOL_SHARES_BASE).toFixed(0)),
            BigInt((Number(rewardsValues.staker) * POOL_SHARES_BASE).toFixed(0))
          ],
          [
            poolDetailsValues.name,
            poolDetailsValues.description,
            poolDetailsValues.logoUrl
          ],
          [socialLinks.website, socialLinks.discord, socialLinks.telegram, socialLinks.twitter, socialLinks.instagram, socialLinks.youTube, socialLinks.tiktok],
          [
            [poolDetailsValues.trackerName, poolDetailsValues.trackerTicker + "-K",],
            [poolDetailsValues.trackerName, poolDetailsValues.trackerTicker + "-X"]
          ],
        ],
        chainId,
        writeContractAsync,
        switchChain
      ) as `0x${string}`);

    } catch (ex: any) {
      const error = mapWeb3Error(ex);
      updateNotification(error, toastId.current as Id, true);
    }
  };

  const searchDetailsErrors = () => {
    return Object.values(errorValidationDetails).some((item) => item === true);
  }

  const handleClick = () => {
    setShowErrors(true);
    if (errorValidationAddress || searchDetailsErrors() || errorValidationRewards
    ) { window && window.scrollTo(0, ref.current?.offsetTop!); }

    if (!errorValidationAddress && !searchDetailsErrors() && !errorValidationRewards) {
      setShowStakePoolKey(true);
    }
  }

  const updateOnSuccess = useCallback(async () => {
    try {
      const newPoolAddress = await getPoolAddressOfUserAtIndex(getNetwork(chainId), address as string, currentPoolCount as number);
      updateNotification("Pool created", toastId.current as Id, false, receipt, chainId);
      router.push(`/pool/${newPoolAddress}/summary`);
    } catch (ex: any) {
      console.error('Error getting new Pool Address', ex);
    }
  }, [chainId, receipt, router])


  const updateOnError = useCallback(() => {
    const error = mapWeb3Error(status);
    updateNotification(error, toastId.current as Id, true);
  }, [status])

  useEffect(() => {

    if (isSuccess) {
      updateOnSuccess()
    }
    if (isError) {
      updateOnError()
    }
  }, [isSuccess, isError, updateOnSuccess, updateOnError]);


  return (
    <>
      {showStakePoolKey ? (
        <div className="flex w-full flex-col items-center xl:px-[350px]">
          <StakePoolKeyComponent
            onConfirm={onConfirm}
            poolName={poolDetailsValues.name}
            poolLogoUrl={poolDetailsValues.logoUrl}
            onBack={() => setShowStakePoolKey(false)}
            address={address}
            transactionLoading={isLoading}
            stakeKey={true}
          />
        </div>
      ) : (
        <div className="flex w-full flex-col items-center md:w-2/3">
          <div className="sm:py-5 sm:pb-0 sm:px-0 lg:flex sm:grid sm:flex-col sm:items-center lg:items-start min-w-full">
            <ButtonBack onClick={() => router.push('/pool')} btnText="BACK TO MY POOLS" extraClasses="text-lg text-white font-bold mb-4 sm:pl-5 lg:px-0" />
            <MainTitle title={"Create new pool"} classNames="!mb-0 sm:pl-5 lg:px-0" />
          </div>
          <div ref={ref} className="sm:py-5 sm:px-0 lg:flex sm:grid sm:flex-col sm:items-center lg:items-start min-w-full">
            <PoolDetailsComponent
              poolDetailsValues={poolDetailsValues}
              setPoolDetailsValues={setPoolDetailsValues}
              setError={setErrorValidationDetails}
              bannedWords={bannedWords}
              showErrors={showErrors}
            />

            <RewardComponent
              rewardsValues={rewardsValues}
              setRewardsValues={setRewardsValues}
              setError={setErrorValidationRewards}
              showErrors={showErrors}
            />

            <DelegateAddressComponent
              ownerAddress={address}
              delegateAddress={delegateAddress}
              setDelegateAddress={setDelegateAddress}
              error={errorValidationAddress}
              setError={setErrorValidationAddress}
              showErrors={showErrors}
            />

            <SocialLinksComponent
              socialLinks={socialLinks}
              setSocialLinks={setSocialLinks}
            />

            <div
              className="flex sm:flex-col-reverse lg:flex-row justify-between xl:gap-0 lg:gap-[5px] gal-0 w-full py-5 px-6 bg-nulnOilBackground shadow-default">
              <PrimaryButton btnText="Cancel" onClick={() => router.back()} colorStyle="outline" className="sm:w-full lg:w-[205px] uppercase" wrapperClassName="" />
              <PrimaryButton
                btnText="Save and continue"
                onClick={handleClick}
                className="font-semibold uppercase sm:w-full lg:w-[305px] sm:mb-5 lg:mb-0"
                isDisabled={
                  showErrors &&
                  (searchDetailsErrors() ||
                    errorValidationRewards ||
                    errorValidationAddress)
                }
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreatePoolComponent;
