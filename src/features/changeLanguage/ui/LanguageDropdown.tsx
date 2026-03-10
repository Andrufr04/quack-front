import { languages } from "../../../shared/config/i18n/languages";
import { useTranslation } from "react-i18next";
import styles from "./LanguageDropdown.module.css";
import { SVG_ARROW_DOWN } from "../../../shared/ui/icons/icons";
import { useState } from "react";


export default function LanguageDropdown() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("Українська");

  const toggleDropdown = () => setOpen(!open);
  const selectLanguage = (code: string, label: string) => {
    setSelected(label);
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div className={styles.dropdownWrapper}>
      <div className={styles.dropdown} onClick={toggleDropdown}>
        {selected}
        <div className={styles.arrow}>{SVG_ARROW_DOWN}</div>
      </div>

      {open && (
        <ul className={styles.dropdownList}>
          {Object.entries(languages).map(([code, label]) => (
            <li
              key={code}
              className={styles.dropdownItem}
              onClick={() => selectLanguage(code, label)}
            >
              {label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}