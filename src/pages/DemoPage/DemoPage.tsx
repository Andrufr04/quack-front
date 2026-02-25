import ActionButton from "../../shared/ui/ActionButton/ui/ActionButton";

export default function DemoPage() {
    return <>
        <title>Quack | Demo</title>

        <ActionButton actionButton={{text: "Початок роботи", onClick: () => console.log('clicked'), enabled: true}}/>
    </>
}