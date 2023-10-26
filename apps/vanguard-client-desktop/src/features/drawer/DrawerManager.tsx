import classNames from "classnames";
import {atom, useAtomValue} from "jotai";
import {ActionsRequiredBuyModal} from "../home/modals/actions-required/ActionsRequiredBuyModal";
import {BuyKeysModal} from "../keys/modals/buy-keys/BuyKeysModal";
import {ViewKeysModal} from "../home/modals/view-keys/ViewKeysModal";
import {ActionsRequiredNotAccruingModal} from "../home/modals/actions-required/ActionsRequiredNotAccruingModal";

export enum DrawerView {
	ActionsRequiredBuy,
	ActionsRequiredNotAccruing,
	BuyKeys,
	ViewKeys,
}

export const drawerStateAtom = atom<DrawerView | null>(null);

export function DrawerManager() {
	const drawerState = useAtomValue(drawerStateAtom);

	return (
		<div
			className={classNames("w-[28rem] min-w-[28rem] h-screen relative z-10", {
				"hidden": drawerState === null,
			})}
		>
			{drawerState === DrawerView.ActionsRequiredBuy && (
				<ActionsRequiredBuyModal/>
			)}

			{drawerState === DrawerView.ActionsRequiredNotAccruing && (
				<ActionsRequiredNotAccruingModal/>
			)}

			{drawerState === DrawerView.BuyKeys && (
				<BuyKeysModal/>
			)}

			{drawerState === DrawerView.ViewKeys && (
				<ViewKeysModal/>
			)}
		</div>
	);
}