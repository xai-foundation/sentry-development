import {AiOutlineClose} from "react-icons/ai";
import {Dispatch, SetStateAction, useState} from "react";
import {BuyKeySuccess} from "./BuyKeySuccess.tsx";
import {BuyKeysFlow} from "./BuyKeysFlow.tsx";

interface BuyKeysModalProps {
	number: number;
	setNumber: Dispatch<SetStateAction<number>>;
	setShowModal: Dispatch<SetStateAction<boolean>>;
}

export function BuyKeysModal({number, setNumber, setShowModal}: BuyKeysModalProps) {
	const [purchaseSuccess, setPurchaseSuccess] = useState<boolean>(false);

	return (
		<div
			className="absolute top-0 right-0 w-[30rem] h-screen flex flex-col justify-start items-center border border-gray-200 z-20 bg-white">
			<div
				className="absolute top-0 w-full h-16 flex flex-row justify-between items-center border-b border-gray-200 text-lg font-semibold px-8">
				<span>Purchase key</span>
				<div className="cursor-pointer z-10" onClick={() => setShowModal(false)}>
					<AiOutlineClose/>
				</div>
			</div>

			{purchaseSuccess ? (
				<BuyKeySuccess
					number={number}
					setNumber={setNumber}
					setShowModal={setShowModal}
				/>
			) : (
				<BuyKeysFlow
					setPurchaseSuccess={setPurchaseSuccess}
				/>
			)}
		</div>
	)
}