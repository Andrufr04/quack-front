import { useEffect, useRef, useState } from "react"
import { SVG_PLUS } from "../../../shared/ui/icons/icons"
import RoundButton from "../../../shared/ui/RoundButton/RoundButton"
import styles from "./ProfilePage.module.css"
import { apiRequest } from "../../../shared/api/api";

interface ProfileData {
    name: string;
    surname: string;
    description: string;
    profile_picture: string | null;
}

export default function ProfilePage() {
    const [expanded, setExpanded] = useState(false)
    const [profile, setProfile] = useState<ProfileData | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const token = localStorage.getItem('access_token')

    useEffect(() => {
        if (!token) {
            return
        }

        const fetchProfile = async () => {
            try {
                const response = await apiRequest('/profiles/my/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response) return
                if (response.ok) {
                    const data = await response.json()
                    setProfile(data)
                }
            } catch (err) {
                console.error("Failed to load profile", err)
            }
        };
        fetchProfile()
    }, [token])

    const handleUploadClick = () => {
        fileInputRef.current?.click()
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            event.target.value = "";
            return;
        }

        const maxSize = 5 * 1024 * 1024; // 5 MB
        if (file.size > maxSize) {
            event.target.value = "";
            return;
        }

        const formData = new FormData()
        formData.append('profile_picture', file)

        try {
            const response = await apiRequest('/profiles/my/', {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            })
            if (!response) return
            if (response.ok) {
                const updatedData = await response.json()
                setProfile(prev => {
                    if (!prev) return null
                    return {
                        ...prev,
                        profile_picture: getAvatarUrl(updatedData.profile_picture)
                    }
                })
            } else {
                //const errorData = await response.json();
                //console.log(`Помилка: ${errorData.error || "Не вдалося завантажити"}`);
                //TODO: Error
            }
        } catch (err) {
            console.error("Upload failed", err)
        }
    };

    const getAvatarUrl = (path: string | null) => {
        if (!path) return '/images/no-image.png'
        if (path.startsWith('http')) {
            try {
                const url = new URL(path)
                return url.pathname
            } catch (e) {
                return path
            }
        }
        return path
    };

    return (
        <>
            <title>Quack | Профіль</title>

            <div className={styles.info}>
                <div>
                    <div className={styles.iconPlus} onClick={handleUploadClick}>
                        <RoundButton button={{ icon: SVG_PLUS, text: "Додати картинку профілю" }} />
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        accept="image/*"
                    />

                    <div className={styles.profileImg} style={{
                        backgroundImage: `url(${profile ? getAvatarUrl(profile.profile_picture) : "/images/no-image.png"})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}></div>
                </div>

                <div className={styles.name}>{profile ? profile.name : "Ім'я"}</div>

                <div className={styles.description}>
                    {expanded ? (
                        profile?.description
                    ) : (
                        <>
                            {profile?.description.slice(0, 85)}...
                            <span
                                className={styles.showMore}
                                onClick={() => setExpanded(true)}
                            >
                                {" "}Показати більше
                            </span>
                        </>
                    )}
                </div>
            </div>
        </>
    )
}