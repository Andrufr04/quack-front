import { useContext, useEffect, useRef, useState } from "react"
import { SVG_A, SVG_ADDREACTION, SVG_ARROW_DOWN, SVG_CHATS, SVG_CLIP, SVG_COMMENT, SVG_INVISIBLE, SVG_PLUS, SVG_SEND, SVG_SHARE, SVG_TRASH } from "../../../shared/ui/icons/icons"
import RoundButton from "../../../shared/ui/RoundButton/RoundButton"
import styles from "./ProfilePage.module.css"
import { apiRequest } from "../../../shared/api/api";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { AppContext } from "../../../app/providers/AppProvider/model/AppContext";
import { getSessionInfo } from "../../../entities/session/lib/jwt";
import ConfirmModal from "../../../shared/ui/ConfirmModal/ConfirmModal";

interface Post {
    id: string;
    title: string | null;
    text: string | null;
    images: string[];
    created_at: string;
    reactions: Record<string, number>;
    my_reaction: string | null;
    comments_count: number;
}

interface ProfileData {
    id: string;
    name: string;
    surname: string;
    description: string;
    profile_picture: string | null;
    banner_picture: string | null;
}

interface PostComment {
    id: string;
    parent_id: string | null;
    text: string;
    author_id: string;
    author_name: string;
    author_avatar: string | null;
    author_profile_id: string;
    created_at: string;
}

export default function ProfilePage() {
    const { id } = useParams<{ id: string }>();
    const { mode } = useContext(AppContext)
    const isOwnProfile = !id || id === getSessionInfo()?.userId;
    const [profile, setProfile] = useState<ProfileData | null>(null)
    const navigate = useNavigate();

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [expanded, setExpanded] = useState(false)
    const [isLongText, setIsLongText] = useState(true);
    const textRef = useRef<HTMLDivElement>(null);

    const [posts, setPosts] = useState<Post[]>([]);
    const [newPostText, setNewPostText] = useState("");
    const [postFiles, setPostFiles] = useState<File[]>([]);
    const postFileInputRef = useRef<HTMLInputElement>(null);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [filePreviews, setFilePreviews] = useState<string[]>([]);

    const [activeReactionPopup, setActiveReactionPopup] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null)
    const token = localStorage.getItem('access_token')

    const myUserId = (() => {
        if (!token) return null;
        try { return JSON.parse(atob(token.split('.')[1])).user_id; } catch { return null; }
    })();

    const [deleteTarget, setDeleteTarget] = useState<{ type: 'post' | 'comment', id: string } | null>(null);

    useEffect(() => {
        if (!token) return

        const fetchData = async () => {
            try {
                const profileEndpoint = isOwnProfile ? '/profiles/my/' : `/profiles/${id}/`;
                const profRes = await apiRequest(profileEndpoint);
                if (profRes?.ok) {
                    const profData = await profRes.json();
                    setProfile(profData);

                    if (profData.id) {
                        const postsRes = await apiRequest(`/profiles/posts/user/${profData.id}/`);
                        if (postsRes?.ok) {
                            const postsData = await postsRes.json();
                            setPosts(postsData);
                        }
                    } else {
                        console.error("Бекенд не повернув ID профілю!");
                        navigate("/")
                    }
                }
                else {
                    toast.error("Помилка при завантаженні профілю!")
                    navigate("/")
                }
            } catch (err) {
                console.error("Failed to load profile", err)
                navigate("/")
            }
        };
        fetchData()
    }, [token, id, isOwnProfile])

    const executeDelete = async () => {
        if (!deleteTarget) return;

        try {
            if (deleteTarget.type === 'post') {
                const res = await apiRequest(`/profiles/posts/${deleteTarget.id}/delete/`, { method: 'DELETE' });
                if (res?.ok) {
                    setPosts(prevPosts => prevPosts.filter(p => p.id !== deleteTarget.id));
                    toast.success("Пост видалено");
                }
            } else if (deleteTarget.type === 'comment') {
                const res = await apiRequest(`/profiles/comments/${deleteTarget.id}/delete/`, { method: 'DELETE' });
                if (res?.ok) {
                    setComments(prev => prev.filter(c => c.id !== deleteTarget.id));
                    toast.success("Коментар видалено");
                }
            }
        } catch (e) {
            toast.error("Помилка видалення");
        } finally {
            setDeleteTarget(null);
        }
    };

    useEffect(() => {
        if (posts.length > 0) {
            const params = new URLSearchParams(location.search);
            const targetPostId = params.get('post');

            if (targetPostId) {
                const postElement = document.getElementById(`post-${targetPostId}`);
                if (postElement) {
                    postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    const originalOutline = postElement.style.outline;
                    const originalTransition = postElement.style.transition;
                    const originalBoxShadow = postElement.style.boxShadow;

                    postElement.style.transition = 'all 0.5s ease-in-out';
                    postElement.style.outline = '2px solid var(--color-main)';
                    postElement.style.boxShadow = '0 0 10px var(--color-main)';

                    setTimeout(() => {
                        postElement.style.outline = originalOutline;
                        postElement.style.boxShadow = originalBoxShadow;
                        setTimeout(() => {
                            postElement.style.transition = originalTransition;
                        }, 500);
                    }, 2500);
                }
            }
        }
    }, [posts, location.search]);

    useEffect(() => {
        const urls = postFiles.map(file => URL.createObjectURL(file));
        setFilePreviews(urls);
        return () => {
            urls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [postFiles]);

    const handleCreatePost = async () => {
        const trimmedText = newPostText.trim();
        if (!trimmedText && postFiles.length === 0) {
            toast.error("Пост не може бути порожнім!");
            return;
        }

        const formData = new FormData();
        formData.append('text', newPostText);
        postFiles.forEach(file => formData.append('image', file));

        try {
            const res = await apiRequest('/profiles/posts/create/', {
                method: 'POST',
                body: formData
            });
            if (res?.ok) {
                setNewPostText("");
                setPostFiles([]);
                toast.success("Опубліковано!");

                if (textareaRef.current) {
                    textareaRef.current.style.height = 'auto';
                }

                if (profile?.id) {
                    const postsRes = await apiRequest(`/profiles/posts/user/${profile.id}/`);
                    if (postsRes?.ok) {
                        const postsData = await postsRes.json();
                        setPosts(postsData);
                    }
                }
            } else {
                const errorData = await res?.json();
                toast.error(errorData?.error || "Помилка при публікації");
            }
        } catch (e) {
            toast.error("Помилка при публікації");
        }
    };

    const handleReaction = async (postId: string, emoji: string) => {
        try {
            const res = await apiRequest(`/profiles/posts/${postId}/react/`, {
                method: 'POST',
                body: JSON.stringify({ emoji })
            });
            if (res?.ok) {
                const updatedPosts = await apiRequest(`/profiles/posts/user/${profile?.id}/`).then(r => r?.json());
                setPosts(updatedPosts);
            }
        } catch (e) {
            console.error(e);
        }
    };

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

        const maxSize = 5 * 1024 * 1024;
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
            if (response.ok) {
                const updatedData = await response.json()
                toast.success("Фото профіля завантажено")
                setProfile(prev => {
                    if (!prev) return null
                    return {
                        ...prev,
                        profile_picture: getAvatarUrl(updatedData.profile_picture)
                    }
                })
            } else {
                toast.error("Помилка при завантаженні фото профіля!")
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

    useEffect(() => {
        const checkTextLength = () => {
            if (textRef.current) {
                const computedStyle = window.getComputedStyle(textRef.current);
                const lineHeight = parseFloat(computedStyle.lineHeight);

                if (textRef.current.scrollHeight > lineHeight * 2.1) {
                    setIsLongText(true);
                } else {
                    setIsLongText(false);
                }
            }
        };

        checkTextLength();
        window.addEventListener('resize', checkTextLength);
        return () => window.removeEventListener('resize', checkTextLength);
    }, [profile?.description]);

    useEffect(() => {
        const bannerUrl = profile?.banner_picture
            ? getAvatarUrl(profile.banner_picture)
            : mode === "dark" ? "/images/bg-dark-mode.PNG" : "/images/bg-light-mode.PNG";

        const gradientAndImage = `linear-gradient(360deg, var(--color-bg) 33.78%, rgba(255, 255, 255, 0) 75.49%), url("${bannerUrl}")`;
        document.documentElement.style.setProperty('--bg-img', gradientAndImage);

        return () => {
            document.documentElement.style.removeProperty('--bg-img');
        };
    }, [profile?.banner_picture, mode]);

    const emojis = ['👍', '🔥', '❤️', '😂', '🤯'];

    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    useEffect(() => {
        if (selectedPost) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [selectedPost]);

    const [comments, setComments] = useState<PostComment[]>([]);
    const [commentText, setCommentText] = useState("");
    const [replyTo, setReplyTo] = useState<{ id: string, name: string } | null>(null);
    const [collapsedComments, setCollapsedComments] = useState<string[]>([]);

    const commentInputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (selectedPost) {
            document.body.style.overflow = 'hidden';
            loadComments(selectedPost.id);
        } else {
            document.body.style.overflow = 'unset';
            setComments([]);
            setReplyTo(null);
            setCommentText("");
            setCollapsedComments([]);
        }
    }, [selectedPost]);

    const loadComments = async (postId: string) => {
        const res = await apiRequest(`/profiles/posts/${postId}/comments/`);
        if (res?.ok) setComments(await res.json());
    };

    const [currentImgIndex, setCurrentImgIndex] = useState(0);

    useEffect(() => {
        if (selectedPost) setCurrentImgIndex(0);
    }, [selectedPost]);

    const [isFullScreen, setIsFullScreen] = useState(false);
    const [modalPostExpanded, setModalPostExpanded] = useState(false);
    const [isModalPostLong, setIsModalPostLong] = useState(false);
    const modalPostRef = useRef<HTMLDivElement>(null);
    const [fullScreenMode, setFullScreenMode] = useState(false);

    useEffect(() => {
        if (selectedPost && modalPostRef.current) {
            const check = () => {
                if (modalPostRef.current) {
                    const lineHeight = parseFloat(window.getComputedStyle(modalPostRef.current).lineHeight) || 24;
                    setIsModalPostLong(modalPostRef.current.scrollHeight > lineHeight * 10.5);
                }
            };
            setTimeout(check, 50);
        } else {
            setModalPostExpanded(false);
        }
    }, [selectedPost]);

    const handleDeletePost = async (postId: string) => {
        if (!postId || !isOwnProfile) return;

        const prevPosts = posts;
        setPosts(prev => prev.filter(p => p.id !== postId));

        try {
            const res = await apiRequest(`/profiles/posts/${postId}/delete/`, {
                method: 'DELETE'
            });
            if (res?.ok) {
                toast.success("Пост видалено");
            } else {
                toast.error("Не вдалося видалити пост");
                setPosts(prevPosts);
            }
        } catch (e) {
            toast.error("Помилка сервера");
            setPosts(prevPosts);
        }
    };

    const handleSendComment = async () => {
        const text = commentText.trim();
        if (!text || !selectedPost) return;

        if (text.length > 512) return toast.error("Коментар задовгий (макс 512 символів)");
        if ((text.match(/\n/g) || []).length > 8) return toast.error("Забагато переносів (макс 8)");

        const res = await apiRequest(`/profiles/posts/${selectedPost.id}/comments/`, {
            method: 'POST',
            body: JSON.stringify({ text, parent_id: replyTo?.id || null })
        });

        if (res?.ok) {
            setCommentText("");
            setReplyTo(null);
            loadComments(selectedPost.id);

            if (commentInputRef.current) {
                commentInputRef.current.style.height = 'auto';
            }

            setPosts(prev => prev.map(p => p.id === selectedPost.id ? { ...p, comments_count: (p.comments_count || 0) + 1 } : p));
            setSelectedPost(prev => prev ? { ...prev, comments_count: (prev.comments_count || 0) + 1 } : null);
        } else {
            const data = await res?.json();
            toast.error(data?.error || "Помилка");
        }
    };

    const renderCommentsTree = (parentId: string | null = null) => {
        const childComments = comments.filter(c => c.parent_id === parentId);
        if (childComments.length === 0) return null;

        return childComments.map(c => {
            const isCollapsed = collapsedComments.includes(c.id);
            const hasChildren = comments.some(child => child.parent_id === c.id);
            const canDelete = isOwnProfile || myUserId === c.author_id;

            return (
                <div 
                    key={c.id} 
                    className={styles.commentRow} 
                    style={{ marginTop: parentId ? '0.625em' : '1em' }}
                    onContextMenu={(e) => {
                        if (isMobile && canDelete) {
                            e.preventDefault();
                            setDeleteTarget({ type: 'comment', id: c.id });
                        }
                    }}
                >
                    <div className={styles.commentAvatarSection}>
                        <Link to={`/profile/${c.author_profile_id}`} onClick={() => setSelectedPost(null)}>
                            <div
                                style={{
                                    width: '2em', height: '2em', borderRadius: '50%', flexShrink: 0,
                                    backgroundImage: `url(${getAvatarUrl(c.author_avatar)})`,
                                    backgroundSize: 'cover', backgroundPosition: 'center',
                                    cursor: 'pointer', zIndex: 2
                                }}>
                            </div>
                        </Link>
                        {!isCollapsed && hasChildren && (
                            <div className={styles.hideLineWrap} onClick={() => setCollapsedComments(prev => isCollapsed ? prev.filter(id => id !== c.id) : [...prev, c.id])}>
                                <div className={styles.hideLine} />
                            </div>
                        )}
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                            <Link to={`/profile/${c.author_profile_id}`} onClick={() => setSelectedPost(null)} style={{ textDecoration: 'none' }}>
                                <span style={{ fontWeight: '600', color: 'var(--color-text)' }}>{c.author_name}</span>
                            </Link>

                            {!isCollapsed && (
                                <span
                                    style={{ fontSize: '0.75em', color: 'var(--color-text-second)', cursor: 'pointer' }}
                                    onClick={() => {
                                        setReplyTo({ id: c.id, name: c.author_name });
                                        setTimeout(() => {
                                            if (commentInputRef.current) {
                                                commentInputRef.current.focus();
                                                commentInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                                            }
                                        }, 50);
                                    }}
                                >
                                    Відповісти
                                </span>
                            )}

                            {canDelete && !isCollapsed && (
                                <div
                                    className={styles.deleteCommentBtn}
                                    onClick={() => setDeleteTarget({ type: 'comment', id: c.id })}
                                >
                                    {SVG_TRASH}
                                </div>
                            )}
                        </div>

                        {!isCollapsed ? (
                            <>
                                <div style={{ color: 'var(--color-text)', marginTop: '0.125em', wordBreak: 'break-word', whiteSpace: 'pre-wrap', lineHeight: 1.4, opacity: 0.9 }}>
                                    {c.text}
                                </div>
                                {renderCommentsTree(c.id)}
                            </>
                        ) : (
                            <div style={{ fontSize: '0.625em', color: 'var(--color-grey)', marginTop: '0.125em', cursor: 'pointer' }} onClick={() => setCollapsedComments(prev => prev.filter(id => id !== c.id))}>
                                Гілку приховано... натисніть, щоб розгорнути
                            </div>
                        )}
                    </div>
                </div>
            );
        });
    };

    return (
        <div className={styles.profile}>
            <title>Quack | Профіль</title>

            {isOwnProfile && <><div className={styles.newPostGradient}></div>
                <div className={styles.newPostContainer}>
                    <div className={styles.attachments}>
                        {filePreviews.map((f, i) => (
                            <div key={i} className={styles.attachedImg} style={{ backgroundImage: `url(${f})`, backgroundSize: 'cover' }}>
                                <div className={styles.deleteImg} onClick={() => setPostFiles(prev => prev.filter((_, idx) => idx !== i))}>
                                    {SVG_PLUS}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className={styles.inputContainer}>
                        <div className={styles.inputIcon} onClick={() => postFileInputRef.current?.click()}>
                            {SVG_CLIP}
                        </div>
                        <input
                            type="file"
                            multiple
                            hidden
                            ref={postFileInputRef}
                            accept="image/*"
                            onChange={(e) => {
                                const files = Array.from(e.target.files || []);
                                const sizeLimit = 10 * 1024 * 1024;
                                const resLimit = 4096;

                                const validFiles: File[] = [];
                                let errors: string[] = [];

                                const checks = files.map(file => {
                                    return new Promise<void>((resolve) => {
                                        if (!file.type.startsWith('image/')) {
                                            errors.push(`Файл ${file.name} не є зображенням.`);
                                            return resolve();
                                        }
                                        if (file.size > sizeLimit) {
                                            errors.push(`Файл ${file.name} завеликий (макс 10 МБ).`);
                                            return resolve();
                                        }

                                        const img = new Image();
                                        img.src = URL.createObjectURL(file);

                                        img.onload = () => {
                                            URL.revokeObjectURL(img.src);
                                            if (img.width > resLimit || img.height > resLimit) {
                                                errors.push(`Зображення ${file.name} завелике (макс ${resLimit}x${resLimit}px).`);
                                            } else {
                                                validFiles.push(file);
                                            }
                                            resolve();
                                        };

                                        img.onerror = () => {
                                            URL.revokeObjectURL(img.src);
                                            errors.push(`Помилка при читанні файлу ${file.name}.`);
                                            resolve();
                                        };
                                    });
                                });

                                Promise.all(checks).then(() => {
                                    if (errors.length > 0) toast.error(errors[0]);

                                    if (validFiles.length > 0) {
                                        setPostFiles(prev => {
                                            const combined = [...prev, ...validFiles];
                                            if (combined.length > 5) {
                                                toast.error("Можна додати максимум 5 фото.");
                                            }
                                            return combined.slice(0, 5);
                                        });
                                    }

                                    if (postFileInputRef.current) {
                                        postFileInputRef.current.value = '';
                                    }
                                });
                            }}
                        />
                        <textarea
                            ref={textareaRef}
                            className={styles.input}
                            placeholder="Створити нову публікацію"
                            value={newPostText}
                            maxLength={4096}
                            onChange={(e) => {
                                const val = e.target.value;
                                const lineBreaks = (val.match(/\n/g) || []).length;
                                if (lineBreaks <= 100) setNewPostText(val);
                                else toast.error("Досягнуто ліміт переносів рядка (100).");
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleCreatePost();
                                }
                            }}
                            rows={1}
                            style={{
                                resize: 'none',
                                maxHeight: "12.5em",
                                overflow: 'auto',
                            }}
                            onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = 'auto';
                                target.style.height = `${target.scrollHeight}px`;
                            }}
                        />
                        <div className={styles.inputIcon} onClick={handleCreatePost}>{SVG_SEND}</div>
                    </div>
                </div>
            </>}

            <div className={styles.info}>
                <div className={styles.infoAvatarSection}>
                    {isOwnProfile && <>
                        <div className={styles.iconPlus} onClick={handleUploadClick}>
                            <RoundButton button={{ icon: SVG_PLUS, text: "Додати картинку профілю" }} />
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
                    </>}

                    <div className={styles.profileImgActions}>
                        <div className={styles.profileImg} style={{
                            backgroundImage: `url(${profile ? getAvatarUrl(profile.profile_picture) : "/images/no-image.png"})`,
                        }}></div>
                        {!isOwnProfile && profile?.id &&
                            <div className={styles.iconMessage} onClick={async () => {
                                const res = await apiRequest(`/profiles/chats/start/${profile.id}/`, { method: 'POST' });
                                if (res?.ok) {
                                    const data = await res.json();
                                    navigate(`/chats/${data.chat_id}`);
                                }
                            }}>
                                <RoundButton button={{ icon: SVG_CHATS, text: "Написати повідомлення" }} />
                            </div>}
                    </div>
                </div>

                <div className={styles.infoTextSection}>
                    <div className={styles.name}>{profile ? profile.name : "Ім'я"}</div>

                    <div className={styles.descriptionWrapper}>
                        <div
                            ref={textRef}
                            className={`${styles.text} ${isLongText && !expanded ? styles.collapsed : styles.expanded}`}
                        >
                            {isLongText && !expanded && (
                                <span className={styles.showMore} onClick={() => setExpanded(true)}>... Показати більше</span>
                            )}
                            {profile?.description}
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.posts}>
                {posts.map(post => (
                    <PostItem
                        key={post.id}
                        post={post}
                        profile={profile}
                        isOwnProfile={isOwnProfile}
                        handleDeletePost={handleDeletePost}
                        getAvatarUrl={getAvatarUrl}
                        handleReaction={handleReaction}
                        activeReactionPopup={activeReactionPopup}
                        setActiveReactionPopup={setActiveReactionPopup}
                        emojis={emojis}
                        setDeleteTarget={setDeleteTarget}
                        onOpenModal={setSelectedPost}
                        isMobile={isMobile}
                    />
                ))}
                <div className={styles.block}></div>
            </div>

            {selectedPost && (
                <div className={styles.modalOverlay} onClick={() => setSelectedPost(null)}>
                    {fullScreenMode && (
                        <div className={styles.lightBox} onClick={(e) => { e.stopPropagation(); setFullScreenMode(false); }}>
                            <img src={selectedPost.images[currentImgIndex]} alt="Full view" className={styles.fullImage} />
                            <div className={styles.closeLightBox}>{SVG_PLUS}</div>
                        </div>
                    )}

                    <div className={styles.unifiedModal} onClick={(e) => e.stopPropagation()}>
                        {selectedPost.images && selectedPost.images.length > 0 && (
                            <div className={styles.modalGallerySection}>
                                <div className={styles.modalMainView}>
                                    {selectedPost.images.length > 1 && (
                                        <>
                                            <div className={styles.arrowLeft} onClick={() => setCurrentImgIndex(prev => prev > 0 ? prev - 1 : selectedPost.images.length - 1)}>
                                                <div style={{ transform: 'rotate(90deg)', display: 'flex' }}>{SVG_ARROW_DOWN}</div>
                                            </div>
                                            <div className={styles.arrowRight} onClick={() => setCurrentImgIndex(prev => prev < selectedPost.images.length - 1 ? prev + 1 : 0)}>
                                                <div style={{ transform: 'rotate(-90deg)', display: 'flex' }}>{SVG_ARROW_DOWN}</div>
                                            </div>
                                        </>
                                    )}
                                    <div
                                        className={styles.modalLargeImage}
                                        style={{ backgroundImage: `url(${selectedPost.images[currentImgIndex]})` }}
                                        onClick={() => setFullScreenMode(true)}
                                    />
                                </div>
                                {selectedPost.images.length > 1 && (
                                    <div className={styles.bottomThumbs}>
                                        {selectedPost.images.map((img, idx) => (
                                            <div
                                                key={idx}
                                                className={`${styles.bottomThumbItem} ${currentImgIndex === idx ? styles.activeThumb : ''}`}
                                                style={{ backgroundImage: `url(${img})` }}
                                                onClick={() => setCurrentImgIndex(idx)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className={styles.modalInfoSection}>
                            <div className={styles.postHeaderModal}>
                                <div className={styles.postHeader}>
                                    <div className={styles.postProfileImg} style={{ backgroundImage: `url(${getAvatarUrl(profile?.profile_picture || null)})` }}></div>
                                    <div className={styles.postName}>{profile?.name} {profile?.surname}</div>
                                </div>
                            </div>

                            <div className={styles.modalTextContent}>
                                <div
                                    ref={modalPostRef}
                                    className={`${styles.text} ${isModalPostLong && !modalPostExpanded ? styles.postCollapsed : styles.postExpanded}`}
                                >
                                    {isModalPostLong && !modalPostExpanded && (
                                        <span className={styles.showMore} onClick={() => setModalPostExpanded(true)}>
                                            ... Показати більше
                                        </span>
                                    )}
                                    {selectedPost.text}
                                </div>
                            </div>
                            
                            <div className={styles.commentsModal}>Коментарі</div>

                            <div className={styles.modalCommentInputWrapper}>
                                {replyTo && (
                                    <div style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '0.375em 0.75em', backgroundColor: 'var(--color-bg-second, rgba(255,255,255,0.05))',
                                        borderRadius: '0.5em', margin: '0.5em 0', fontSize: '0.8125em', color: 'var(--color-text)'
                                    }}>
                                        <span>Відповідь для <b>{replyTo.name}</b></span>
                                        <span style={{ cursor: 'pointer', fontWeight: 'bold', padding: '0 0.3125em' }} onClick={() => setReplyTo(null)}>✕</span>
                                    </div>
                                )}
                                <div className={styles.inputContainer} style={{ marginTop: '0.375em' }}>
                                    <textarea
                                        ref={commentInputRef}
                                        className={styles.input}
                                        placeholder="Написати коментар..."
                                        value={commentText}
                                        maxLength={512}
                                        rows={1}
                                        style={{ resize: 'none', maxHeight: "9.375em", overflow: 'auto' }}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if ((val.match(/\n/g) || []).length <= 8) setCommentText(val);
                                            else toast.error("Досягнуто ліміт переносів рядка (8).");
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendComment(); }
                                        }}
                                        onInput={(e) => {
                                            const target = e.target as HTMLTextAreaElement;
                                            target.style.height = 'auto'; target.style.height = `${target.scrollHeight}px`;
                                        }}
                                    />
                                    <div className={styles.inputIcon} onClick={handleSendComment}>
                                        {SVG_SEND}
                                    </div>
                                </div>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.3125em', marginBottom: '0.9375em' }}>
                                {comments.length === 0 ? (
                                    <div style={{ opacity: 0.5, textAlign: 'center', marginTop: '1.25em' }}>Ще немає коментарів</div>
                                ) : (
                                    renderCommentsTree(null)
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <ConfirmModal
                isOpen={deleteTarget !== null}
                onClose={() => setDeleteTarget(null)}
                onConfirm={executeDelete}
                title={deleteTarget?.type === 'post' ? "Видалення поста" : "Видалення коментаря"}
                text={deleteTarget?.type === 'post' 
                    ? "Ви дійсно хочете видалити цей пост? Всі коментарі та реакції також будуть видалені. Цю дію неможливо скасувати." 
                    : "Ви дійсно хочете видалити цей коментар?"
                }
            />
        </div>
    )
}

function PostItem({
    post, profile, getAvatarUrl, handleReaction,
    activeReactionPopup, setActiveReactionPopup, emojis,
    onOpenModal, isOwnProfile, setDeleteTarget, isMobile
}: any) {
    const postRef = useRef<HTMLDivElement>(null);
    const [isPostLong, setIsPostLong] = useState(false);
    const [postExpanded, setPostExpanded] = useState(false);

    const totalReactionsCount = Object.values(post.reactions).reduce((acc: number, val: any) => acc + val, 0) as number;

    useEffect(() => {
        const checkPostLength = () => {
            if (postRef.current) {
                const computedStyle = window.getComputedStyle(postRef.current);
                const lineHeight = parseFloat(computedStyle.lineHeight) || 24; 

                if (postRef.current.scrollHeight > lineHeight * 10.5) {
                    setIsPostLong(true);
                } else {
                    setIsPostLong(false);
                }
            }
        };

        setTimeout(checkPostLength, 50);

        window.addEventListener('resize', checkPostLength);
        return () => window.removeEventListener('resize', checkPostLength);
    }, [post.text]); 

    const getLayoutClass = (count: number) => {
        if (count === 1) return styles.layout1;
        if (count === 2) return styles.layout2;
        if (count === 3) return styles.layout3;
        if (count === 4) return styles.layout4;
        return styles.layout5; 
    };

    return (
        <div className={styles.postContainer}>
            <div 
                className={styles.post} 
                id={`post-${post.id}`}
                // 🔥 Мобільний лонг-прес для видалення поста 🔥
                onContextMenu={(e) => {
                    if (isMobile && isOwnProfile) {
                        e.preventDefault();
                        setDeleteTarget({ type: 'post', id: post.id });
                    }
                }}
            >
                {isOwnProfile && (
                    <div
                        className={styles.deletePostBtn}
                        onClick={() => setDeleteTarget({ type: 'post', id: post.id })}
                        title="Видалити пост"
                    >
                        {SVG_TRASH}
                    </div>
                )}
                <div className={styles.postHeader}>
                    <div className={styles.postProfileImg} style={{ backgroundImage: `url(${getAvatarUrl(profile?.profile_picture || null)})` }}></div>
                    <div className={styles.postName}>{profile?.name} {profile?.surname}</div>
                </div>

                {post.title && <div className={styles.title}>{post.title}</div>}

                {post.images && post.images.length > 0 && (
                    <div className={`${styles.postImgs} ${getLayoutClass(post.images.length)}`}>
                        {post.images.map((imgUrl: string, index: number) => (
                            <div
                                key={index}
                                className={styles.imgPlaceholder}
                                style={{ backgroundImage: `url(${imgUrl})`, backgroundSize: 'cover' }}
                            ></div>
                        ))}
                    </div>
                )}

                <div className={styles.postTextWrapper}>
                    <div
                        ref={postRef}
                        className={`${styles.text} ${isPostLong && !postExpanded ? styles.postCollapsed : styles.postExpanded}`}
                    >
                        {isPostLong && !postExpanded && (
                            <span
                                className={styles.showMore}
                                onClick={() => setPostExpanded(true)}
                            >
                                ... Показати більше
                            </span>
                        )}
                        {post.text}
                    </div>
                </div>
            </div>

            <div className={styles.postFooter}>
                <div className={styles.reactionsContainer}>
                    {Object.entries(post.reactions).map(([emoji, count]: any) => (
                        count > 0 && (
                            <div key={emoji} onClick={() => handleReaction(post.id, emoji)} className={`${styles.reaction} ${post.my_reaction === emoji ? styles.activeReaction : ''}`}>
                                <div className={styles.emoji} >{emoji}</div>
                                <div>{count}</div>
                            </div>
                        )
                    ))}
                </div>

                <div className={styles.postActions}>
                    <div className={styles.postActionIcons}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.375em' }}>
                            {activeReactionPopup === post.id && (
                                <div className={styles.reactionPopup}>
                                    {emojis.map((emoji: string) => (
                                        <div
                                            key={emoji}
                                            className={styles.reactionCircle}
                                            onClick={() => {
                                                handleReaction(post.id, emoji);
                                                setActiveReactionPopup(null);
                                            }}
                                        >
                                            {emoji}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div
                                className={styles.postActionIcon}
                                onClick={() => setActiveReactionPopup(activeReactionPopup === post.id ? null : post.id)}
                                // 🔥 Мобільний лонг-прес для реакції 🔥
                                onContextMenu={(e) => {
                                    if (isMobile) {
                                        e.preventDefault();
                                        setActiveReactionPopup(activeReactionPopup === post.id ? null : post.id);
                                    }
                                }}
                                style={{ color: post.my_reaction ? 'var(--color-main)' : 'inherit' }}
                            >
                                {SVG_ADDREACTION}
                            </div>
                            {totalReactionsCount > 0 && (
                                <div style={{
                                    color: 'inherit',
                                    fontSize: '0.875em',
                                    marginBottom: '0.1875em'
                                }}>
                                    {totalReactionsCount}
                                </div>
                            )}
                        </div>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.375em', marginLeft: '.3em' }}>
                            <div
                                className={styles.postActionIcon}
                                style={{ cursor: 'pointer' }}
                                onClick={() => onOpenModal(post)}
                            >
                                {SVG_COMMENT}
                            </div>
                            {post.comments_count > 0 && (
                                <div style={{
                                    color: 'inherit',
                                    fontSize: '0.875em',
                                    marginBottom: '0.1875em'
                                }}>
                                    {post.comments_count}
                                </div>
                            )}
                        </div>
                    </div>
                    <div 
                        className={styles.postActionIcon}
                        onClick={() => {
                            const url = `${window.location.origin}/profile/${profile?.id}?post=${post.id}`;
                            navigator.clipboard.writeText(url);
                            toast.success("Посилання на пост скопійовано!");
                        }}
                    >
                        {SVG_SHARE}
                    </div>
                </div>
            </div>
        </div>
    );
}