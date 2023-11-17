import {AiOutlineCheck, AiOutlineInfoCircle, AiOutlineMinus, AiOutlinePlus} from "react-icons/ai";
import {IoIosArrowDown} from "react-icons/io";
import {PiCopy} from "react-icons/pi";
import {ReactComponent as XaiLogo} from "@/svgs/xai-logo.svg";
import {useState} from "react";
import {YellowPulse} from "@/features/keys/StatusPulse.js";
import {BlockPassKYC} from "@/components/blockpass/Blockpass";
import {getLicensesList, LicenseList, LicenseMap} from "@/hooks/useListNodeLicensesWithCallback";
import {config} from "@sentry/core";
import {StatusMap} from "@/hooks/useKycStatusesWithCallback";
import {Tooltip} from "@/features/keys/Tooltip";
import {drawerStateAtom, DrawerView} from "@/features/drawer/DrawerManager";
import {useSetAtom} from "jotai";
import {RemoveWalletModal} from "@/features/home/modals/RemoveWalletModal";
import {WalletAssignedMap} from "@/features/keys/Keys";
import {FaRegCircle} from "react-icons/fa";
import {modalStateAtom, ModalView} from "@/features/modal/ModalManager";
import {useOperator} from "@/features/operator";

interface HasKeysProps {
	licensesMap: LicenseMap,
	statusMap: StatusMap,
	isWalletAssignedMap: WalletAssignedMap,
}

export function HasKeys({licensesMap, statusMap, isWalletAssignedMap}: HasKeysProps) {
	const setDrawerState = useSetAtom(drawerStateAtom);
	const setModalState = useSetAtom(modalStateAtom);
	const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
	const [copiedSelectedWallet, setCopiedSelectedWallet] = useState<boolean>(false);
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [isRemoveWalletOpen, setIsRemoveWalletOpen] = useState<boolean>(false);
	const {isLoading: isOperatorLoading, publicKey: operatorAddress} = useOperator();

	function startAssignment() {
		if (!isOperatorLoading) {
			setModalState(ModalView.TransactionInProgress);
			window.electron.openExternal(`http://localhost:7555/assign-wallet/${operatorAddress}`);
		}
	}

	function renderKeys() {
		let licenses: LicenseList = [];
		if (!selectedWallet) {
			licenses = getLicensesList(licensesMap);
		} else {
			if (licensesMap[selectedWallet]) {
				licenses = licensesMap[selectedWallet].map((license) => {
					return {owner: selectedWallet, key: license};
				});
			}
		}

		return licenses.sort((a, b) => Number(a.key) - Number(b.key)).map((keyWithOwner, i) => {
			const isEven = i % 2 === 0;
			const keyString = keyWithOwner.key.toString();
			const owner = keyWithOwner.owner.toString();
			const status = statusMap[owner];
			const isAssigned = isWalletAssignedMap[owner];

			console.log(isAssigned)

			return (
				<tr className={`${isEven ? "bg-[#FAFAFA]" : "bg-white"} flex px-8 text-sm`} key={`license-${i}`}>
					<td className="w-full max-w-[70px] px-4 py-2">{keyString}</td>
					<td className="w-full max-w-[360px] px-4 py-2">{owner}</td>
					<td className="w-full max-w-[360px] px-4 py-2 text-[#A3A3A3]">

						{!isAssigned ? (
							<div className="flex items-center gap-2">
								<FaRegCircle size={8}/>
								Wallet not assigned
								<a
									onClick={() => startAssignment()}
									className="text-[#F30919] cursor-pointer"
								>
									Assign
								</a>
							</div>
						) : (
							!status ? (
								<div className="flex items-center gap-2">
									<YellowPulse/>
									KYC required
									<BlockPassKYC/>
								</div>
							) : (
								<span>KYC GOOD</span>
							)
						)}
					</td>
					<td className="w-full max-w-[150px] px-4 py-2 text-right">ACCRUED ESXAI</td>
					<td className="w-full max-w-[150px] px-4 py-2 text-[#F30919]">
						<span
							className="cursor-pointer"
							onClick={() => window.electron.openExternal(`https://testnets.opensea.io/assets/arbitrum-goerli/${config.nodeLicenseAddress}/${keyString}`)}
						>
							View
						</span>
					</td>
				</tr>
			);
		});
	}

	function getDropdownItems() {
		return Object.keys(statusMap).map((wallet, i) => (
			<p
				onClick={() => {
					setSelectedWallet(wallet);
					setIsOpen(false);
				}}
				className="p-2 cursor-pointer hover:bg-gray-100"
				key={`sentry-item-${i}`}
			>
				{wallet}
			</p>
		));
	}

	function copySelectedWallet() {
		if (selectedWallet && navigator.clipboard) {
			navigator.clipboard.writeText(selectedWallet)
				.then(() => {
					setCopiedSelectedWallet(true);
					setTimeout(() => {
						setCopiedSelectedWallet(false);
					}, 1500);
				})
				.catch(err => {
					console.error('Unable to copy to clipboard: ', err);
				});
		} else {
			console.error('Clipboard API not available, unable to copy to clipboard');
		}
	}

	return (
		<>
			{isRemoveWalletOpen && (
				<RemoveWalletModal
					onClose={() => setIsRemoveWalletOpen(false)}
					selectedWallet={selectedWallet}
				/>
			)}
			<div className="w-full flex flex-col gap-4">
				<div className="w-full h-auto flex flex-col py-3 pl-10">
					<p className="text-sm uppercase text-[#A3A3A3] mb-1 mt-2">
						View Wallet
					</p>
					<div className="flex flex-row gap-2">
						<div>
							<div
								onClick={() => setIsOpen(!isOpen)}
								className={`flex items-center justify-between w-[538px] border-[#A3A3A3] border-r border-l border-t ${!isOpen ? "border-b" : null} border-[#A3A3A3] p-2`}
							>
								<p>{selectedWallet || `All wallets (${Object.keys(statusMap).length})`}</p>
								<IoIosArrowDown
									className={`h-[15px] transform ${isOpen ? "rotate-180 transition-transform ease-in-out duration-300" : "transition-transform ease-in-out duration-300"}`}
								/>
							</div>

							{isOpen && (
								<div
									className="absolute flex flex-col w-[538px] border-r border-l border-b border-[#A3A3A3] bg-white z-10">
									<p
										onClick={() => {
											setSelectedWallet(null);
											setIsOpen(false);
										}}
										className="p-2 cursor-pointer hover:bg-gray-100"
									>
										All
									</p>
									{getDropdownItems()}
								</div>
							)}
						</div>

						<button
							disabled={selectedWallet === null}
							onClick={copySelectedWallet}
							className={`flex flex-row justify-center items-center gap-2 text-[15px] border border-[#E5E5E5] ${selectedWallet === null ? 'text-[#D4D4D4] cursor-not-allowed' : ""} px-4 py-2`}
						>

							{copiedSelectedWallet
								? (<AiOutlineCheck className="h-[15px]"/>)
								: (<PiCopy className="h-[15px]"/>)
							}
							Copy address
						</button>

						<button
							onClick={() => setDrawerState(DrawerView.ViewKeys)}
							className="flex flex-row justify-center items-center gap-2 text-[15px] border border-[#E5E5E5] px-4 py-2"
						>
							<AiOutlinePlus className="h-[15px]"/>
							Add wallet
						</button>

						<button
							disabled={selectedWallet === null}
							onClick={() => setIsRemoveWalletOpen(true)}
							className={`flex flex-row justify-center items-center gap-2 text-[15px] border border-[#E5E5E5] ${selectedWallet === null ? 'text-[#D4D4D4] cursor-not-allowed' : ""} px-4 py-2`}
						>
							<AiOutlineMinus className="h-[15px]"/>
							Remove wallet
						</button>
					</div>
				</div>

				<div className="flex flex-col pl-10">
					<div className="flex items-center gap-1 text-[15px] text-[#525252]">
						<p>Accrued network esXAI</p>
						<Tooltip
							header={"Each key will accrue esXAI"}
							body={"This value is the sum of all esXAI accrued for the selected wallet. If esXAI has already been claimed, it will not be reflected in this value."}
						>
							<AiOutlineInfoCircle size={16} color={"#A3A3A3"}/>
						</Tooltip>
					</div>
					<div className="flex items-center gap-2 font-semibold">
						<XaiLogo/>
						<p className="text-3xl">
							SOME esXAI
						</p>
					</div>
				</div>

				<div className="w-full">
					<table className="w-full bg-white">
						<thead className="text-[#A3A3A3]">
						<tr className="flex text-left text-[12px] px-8">
							<th className="w-full max-w-[70px] px-4 py-2">KEY ID</th>
							<th className="w-full max-w-[360px] px-4 py-2">OWNER ADDRESS</th>
							<th className="w-full max-w-[360px] px-4 py-2">STATUS</th>
							<th className="w-full max-w-[150px] px-4 py-2 text-right">ACCRUED esXAI</th>
							<th className="w-full max-w-[150px] px-4 py-2">OPENSEA URL</th>
						</tr>
						</thead>
						<tbody>
						{renderKeys()}
						</tbody>
					</table>
				</div>
			</div>
		</>
	)
}