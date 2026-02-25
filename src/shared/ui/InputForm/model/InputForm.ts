type InputFormProps = {
    type: string,
    id: string,
    title: string,
    placeholder: string,
    value?: string,
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void,
    error?: boolean
}

export type { InputFormProps }