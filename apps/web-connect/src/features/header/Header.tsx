import {useNavigate} from "react-router-dom";
import {ConnectButton, ExternalLink} from "@sentry/ui";
import {useWeb3Modal} from "@web3modal/wagmi/react";
import {useAccount} from "wagmi";
import {DiscordIcon, XaiLogo} from "@sentry/ui/src/rebrand/icons/IconsComponents";
import Burger from "@/features/header/Burger";
import MobileNavbar from "@/features/header/MobileNavbar";
import {useState} from "react";

export function Header() {
	const navigate = useNavigate();
	const {open} = useWeb3Modal();
	const {address} = useAccount()
	const [isNavbarOpened, setIsNavbarOpened] = useState(false)
	return (
		<div className="w-full">
			<div className="fixed flex w-full justify-between items-center bg-transparent z-[10]">
				<div
					className="w-full md:max-w-[108px] md:min-h-[108px] min-h-[64px] max-w-[64px] flex items-center bg-hornetSting justify-center"
					onClick={() => navigate("/")}
				>
					<XaiLogo width={26} height={23}/>
				</div>
				<div className="font-bold text-xl items-center gap-[20px] uppercase text-white hidden md:flex">
					<ExternalLink
						content={"DOCS"}
						link={""}
						customClass={"no-underline !font-bold text-xl hover:text-elementalGrey"}/>
					<span className="block uppercase text-foggyLondon">|</span>
					<ExternalLink
						content={"BUILD WITH US"}
						link={""}
						customClass={"no-underline !font-bold text-xl hover:text-elementalGrey"}/>
					<span className="block uppercase text-foggyLondon">|</span>

					<div className="flex gap-[16px]">
						<ExternalLink
							content={
								<DiscordIcon className={"hover:fill-elementalGrey fill-white duration-200 ease-in"} />
							}
							link={""}
							customClass={"no-underline !font-bold text-xl "}
						/>

						<ExternalLink
							content={
								<DiscordIcon className={"hover:fill-elementalGrey fill-white duration-200 ease-in"} />
							}
							link={""}
							customClass={"no-underline !font-bold text-xl "}
						/>

						<ExternalLink
							content={
								<DiscordIcon className={"hover:fill-elementalGrey fill-white duration-200 ease-in"} />
							}
							link={""}
							customClass={"no-underline !font-bold text-xl "}
						/>

					</div>

					<ConnectButton onOpen={open} address={address} className="!bg-hornetSting"/>
				</div>
				{/* Burger menu for mobile */}
				<Burger openNavbar={() => setIsNavbarOpened(true)} />
				<MobileNavbar isOpened={isNavbarOpened} closeNavbar={() => setIsNavbarOpened(false)} />
			</div>
		</div>
	);
}
