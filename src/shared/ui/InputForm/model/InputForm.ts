type InputFormProps = {
    type: string,
    id: string,
    title: string,
    placeholder: string,
    value?: string,
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void,
    error?: boolean,
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void; // ловим Enter
}

export type { InputFormProps }