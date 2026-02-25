import { useState } from "react"
import { SVG_INVISIBLE, SVG_VISIBLE } from "../../icons/icons"
import type { InputFormProps } from "../model/InputForm"
import styles from "./InputForm.module.css"

export default function InputForm({ input }: { input: InputFormProps }) {
    const [isVisible, setVisible] = useState(false)

    return <div className={styles.input}>
        <div className={styles.title + " bold"}>{input.title}</div>
        <input
            name={input.id}
            id={input.id}
            className={styles.field}
            type={isVisible ? "text" : input.type }
            value={input.value}
            onChange={input.onChange}
            placeholder={input.placeholder} 
            autoComplete={input.type}/>
        {input.type == "password" && 
            <div className={styles.show} onClick={() => setVisible(!isVisible)}>{isVisible ? SVG_VISIBLE : SVG_INVISIBLE}</div>}
    </div>
}