import {useAtomValue} from "jotai";
import {chainStateAtom} from "@/hooks/useChainDataWithCallback";
import {useCombinedOwners} from "@/hooks/useCombinedOwners";
import {accruingStateAtom} from "@/hooks/useAccruingInfo";
import {useGetWalletBalance} from "@/hooks/useGetWalletBalance";
import {Tooltip} from "@sentry/ui";
import {AiOutlineInfoCircle} from "react-icons/ai";
import {ethers} from "ethers";
import {BiLoaderAlt} from "react-icons/bi";
import {Card} from "@/features/home/cards/Card";
import {useEffect, useState} from 'react';
import {useOperatorRuntime} from "@/hooks/useOperatorRuntime";
import {FaCircleCheck} from "react-icons/fa6";
import {ReactComponent as XaiLogo} from "@/svgs/xai-logo.svg";
import {MdRefresh} from "react-icons/md";

export function NetworkRewardsCard() {
	const {owners} = useAtomValue(chainStateAtom);
	const {balances, isBalancesLoading, balancesFetchedLast} = useAtomValue(accruingStateAtom);

	const {combinedOwners} = useCombinedOwners(owners);
	const {data: earnedEsxaiBalance} = useGetWalletBalance(combinedOwners);

	const [currentTime, setCurrentTime] = useState(new Date());
	const {sentryRunning} = useOperatorRuntime();

	// Calculate the time difference in minutes
	const calculateTimeDifference = (currentTime: Date, lastUpdateTime: Date) => {
		return Math.floor((currentTime.getTime() - lastUpdateTime.getTime()) / 60000);
	};

	useEffect(() => {
		// Update current time every minute
		const interval = setInterval(() => {
			setCurrentTime(new Date());
		}, 60000); // 60000 milliseconds in a minute

		return () => clearInterval(interval);
	}, []);

	const timeDifference: number | null = !isBalancesLoading && balancesFetchedLast
		? calculateTimeDifference(currentTime, balancesFetchedLast)
		: null;


	return (
		<Card width={"300px"} height={"531px"}>

			<div className="flex flex-row justify-between items-center py-2 px-4 border-b border-[#F5F5F5]">
				<div className="flex flex-row items-center gap-1 text-[#A3A3A3] text-[15px]">
					<h2 className="font-medium">Network Rewards</h2>
					<Tooltip
						header={"Header"}
						body={"Body"}
						position={"end"}
					>
						<AiOutlineInfoCircle size={15} color={"#A3A3A3"}/>
					</Tooltip>
				</div>
			</div>

			<div className="flex flex-col mt-4 py-2 px-4 gap-3">
				<div>
					<div className="flex justify-between items-center text-[#A3A3A3]">

						<div className="flex items-center gap-1 text-[15px]">
							<h3 className="font-medium">esXAI balance</h3>
							<Tooltip
								header={"Claimed esXAI will appear in your wallet balance.\n"}
								body={"Once you pass KYC for a wallet, any accrued esXAI for that wallet will be claimed and reflected in your esXAI balance."}
								position={"end"}
							>
								<AiOutlineInfoCircle size={14} color={"#D4D4D4"}/>
							</Tooltip>
							<p className="flex items-center text-sm text-[#D4D4D4]">
								{!isBalancesLoading && balancesFetchedLast && (
									timeDifference !== null ? `Updated ${timeDifference}m ago` : 'Just now'
								)}
							</p>
						</div>
						{!isBalancesLoading && balancesFetchedLast ? (
							<a onClick={() => alert("not yet")} className="cursor-pointer">
								<MdRefresh/>
							</a>
						) : (
							<BiLoaderAlt className="animate-spin w-[18px]" color={"#D4D4D4"}/>
						)}
					</div>

					<div className="flex items-center font-semibold">
						<div className="flex items-center gap-2">
							<div
								className="w-[32px] h-[32px] flex justify-center items-center bg-[#F5F5F5] rounded-full">
								<XaiLogo className="text-[#A3A3A3] w-[18px] h-[18px]"/>
							</div>
							<p className="text-4xl">
								{!isBalancesLoading && balancesFetchedLast && earnedEsxaiBalance
									? parseFloat(ethers.formatEther(earnedEsxaiBalance.reduce((acc, item) => acc + item.esXaiBalance, BigInt(0)))).toFixed(6) === "0.000000"
										? "0"
										: parseFloat(ethers.formatEther(earnedEsxaiBalance.reduce((acc, item) => acc + item.esXaiBalance, BigInt(0)))).toFixed(6)
									: "0"
								}

							</p>
						</div>
					</div>
				</div>

				<div>
					<div className="flex justify-between items-center text-[#A3A3A3]">
						<div className="flex items-center gap-1 text-[15px]">
							<h3 className="font-medium">Accrued esXAI</h3>
							<Tooltip
								header={"Each key will accrue esXAI. Pass KYC to claim."}
								body={"This value is the sum of all esXAI accrued for the selected wallet. If esXAI has already been claimed, it will appear in esXAI balance."}
								position={"end"}
							>
								<AiOutlineInfoCircle size={14} color={"#D4D4D4"}/>
							</Tooltip>
						</div>
						{!isBalancesLoading && balancesFetchedLast ? (
							<a onClick={() => alert("not yet")} className="cursor-pointer">
								<MdRefresh/>
							</a>
						) : (
							<BiLoaderAlt className="animate-spin w-[18px]" color={"#D4D4D4"}/>
						)}
					</div>
					<div className="flex items-center font-semibold">
						<div className="flex items-center gap-2">
							<div
								className="w-[24px] h-[24px] flex justify-center items-center bg-[#F5F5F5] rounded-full">
								<XaiLogo className="text-[#A3A3A3] w-[14px] h-[14px]"/>
							</div>
							<p className="text-2xl">
								{!isBalancesLoading && balancesFetchedLast && balances
									? Number(ethers.formatEther(Object.values(balances).reduce((acc, value) => acc + value.totalAccruedEsXai, BigInt(0)))).toFixed(6) === "0.000000"
										? "0"
										: Number(ethers.formatEther(Object.values(balances).reduce((acc, value) => acc + value.totalAccruedEsXai, BigInt(0)))).toFixed(6)
									: "0"
								}
							</p>
						</div>
					</div>
				</div>

				<div>
					<div className="flex items-center gap-1 text-[15px] text-[#A3A3A3]">
						<h3 className="font-medium">Am I accruing esXAI?</h3>
						<Tooltip
							header={"Header"}
							body={"Body"}
							position={"end"}
						>
							<AiOutlineInfoCircle size={14} color={"#D4D4D4"}/>
						</Tooltip>
					</div>
					<div className="flex items-center font-semibold">
						<p className="text-2xl font-semibold">
							{sentryRunning ? "Yes" : "No"}
						</p>
					</div>
				</div>

				<div>
					<div className="flex items-center gap-1 text-[15px] text-[#A3A3A3]">
						<h3 className="font-medium">How frequently will I accrue?</h3>
						<Tooltip
							body={"esXAI accrued is probabilistic. You accrue more with more keys"}
							position={"end"}
						>
							<AiOutlineInfoCircle size={14} color={"#D4D4D4"}/>
						</Tooltip>
					</div>
					<div className="flex items-center">
						<div>
							<p className="text-2xl font-semibold">
								84
							</p>
							<p className="text-[12px] text-[#A3A3A3]">
								times per month (on average) (hard-coded)
							</p>
						</div>
					</div>
				</div>

			</div>

			<div
				className="absolute bottom-4 left-0 right-0 m-auto max-w-[268px] h-[40px] flex justify-center items-center gap-1 rounded-lg text-sm text-[#16A34A] bg-[#F0FDF4] p-2">
				<div className="flex justify-center items-center gap-2">
					<FaCircleCheck color={"#16A34A"} size={20}/>
					You are accruing and claiming esXAI
				</div>
			</div>
		</Card>
	);
}
