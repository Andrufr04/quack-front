import type { ReactNode } from "react"

type RoundButtonProps = {
    icon: ReactNode,
    text: string,
    onClick?: () => void,
    slug?: string
}

export type { RoundButtonProps }