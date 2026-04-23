import styles from './ConfirmModal.module.css';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    text: string;
}

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, text }: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <>
            {/* Затемнення фону */}
            <div className={styles.overlay} onClick={onClose} />
            
            {/* Само вікно */}
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h3 className={styles.title}>{title}</h3>
                </div>
                
                <p className={styles.text}>{text}</p>
                
                <div className={styles.buttons}>
                    <div className={styles.cancelBtn} onClick={onClose}>
                        Скасувати
                    </div>
                    <div 
                        className={styles.confirmBtn} 
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        Видалити
                    </div>
                </div>
            </div>
        </>
    );
}