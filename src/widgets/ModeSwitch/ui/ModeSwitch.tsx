import { useContext } from "react";
import { AppContext } from "../../../app/providers/AppProvider/model/AppContext";
import { SVG_MOON, SVG_SUN } from "../../../shared/ui/icons/icons";
import RoundButton from "../../../shared/ui/RoundButton/RoundButton";

export default function ModeSwitch() {
    const { mode, switchMode } = useContext(AppContext);

    return <RoundButton
        button={{
            icon: mode === "light" ? SVG_MOON : SVG_SUN,
            text: mode === "light" ? "Темна тема" : "Світла тема",
            onClick: switchMode,
        }}
    />
}