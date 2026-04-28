import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./ChatsPage.module.css";
import { SVG_SEND, SVG_CLIP, SVG_PLUS, SVG_ADDREACTION, SVG_MIC } from "../../../shared/ui/icons/icons";
import toast from "react-hot-toast";
import { apiRequest } from "../../../shared/api/api";
import RoundButton from "../../../shared/ui/RoundButton/RoundButton";

interface ChatListItem {
    id: string;
    other_user_id: string | null;
    name: string;
    avatar: string | null;
    last_message: string;
    updated_at: string;
    unread_count: number;
    is_group?: boolean;
}

interface ChatMessage {
    id: string;
    sender_id: string;
    sender_name?: string; 
    sender_avatar?: string | null; 
    text: string;
    images: string[];
    voice?: string | null;
    created_at: string;
    reactions?: Record<string, number>;
    my_reaction?: string | null;
    is_system?: boolean;
}

interface GroupParticipant {
    id: string;
    name: string;
    avatar: string | null;
    is_admin: boolean;
}

const renderTextWithLinks = (text: string, isMine: boolean) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, i) => {
        if (part.match(urlRegex)) {
            return (
                <a key={i} href={part} target="_blank" rel="noopener noreferrer"
                    style={{ color: isMine ? '#fff' : 'var(--color-main)', textDecoration: 'underline', wordBreak: 'break-all' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {part}
                </a>
            );
        }
        return <span key={i}>{part}</span>;
    });
};

const getDateSeparator = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return "Сьогодні";
    return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' });
};

const formatSidebarTime = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' });
};

export default function ChatsPage() {
    const { chatId } = useParams<{ chatId?: string }>();
    const navigate = useNavigate();

    // 🔥 Стейт для перевірки мобільного екрану 🔥
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedChat, setSelectedChat] = useState<string | null>(chatId || null);

    const selectedChatRef = useRef<string | null>(chatId || null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isLoadingMoreRef = useRef(false);

    const [chats, setChats] = useState<ChatListItem[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    const [hasMore, setHasMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const [firstUnreadId, setFirstUnreadId] = useState<string | null>(null);

    const [messageText, setMessageText] = useState("");
    const [postFiles, setPostFiles] = useState<{ file: File, url: string }[]>([]);
    const postFileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [activeMsgReactionPopup, setActiveMsgReactionPopup] = useState<string | null>(null);
    const emojis = ['👍', '🔥', '❤️', '😂', '🤯'];

    const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");

    const [isManageGroupOpen, setIsManageGroupOpen] = useState(false);
    const [groupParticipants, setGroupParticipants] = useState<GroupParticipant[]>([]);
    const [isAddingUser, setIsAddingUser] = useState(false);

    const [isEditingName, setIsEditingName] = useState(false);
    const [editGroupName, setEditGroupName] = useState("");
    const groupAvatarInputRef = useRef<HTMLInputElement>(null);

    const token = localStorage.getItem('access_token');
    const myUserId = (() => {
        if (!token) return null;
        try { return JSON.parse(atob(token.split('.')[1])).user_id; } catch { return null; }
    })();

    const scrollToBottom = (smooth = false) => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: smooth ? 'smooth' : 'auto'
            });
        }
    };

    const loadChats = async () => {
        const res = await apiRequest(`/profiles/chats/?t=${Date.now()}`);
        if (res?.ok) setChats(await res.json());
    };

    const loadMessages = async (id: string, isLoadMore = false) => {
        if (isLoadMore) isLoadingMoreRef.current = true;
        const currentOffset = isLoadMore ? offset : 0;
        const res = await apiRequest(`/profiles/chats/${id}/?offset=${currentOffset}&t=${Date.now()}`);

        if (res?.ok) {
            const data = await res.json();

            if (isLoadMore) {
                const container = messagesContainerRef.current;
                const oldHeight = container ? container.scrollHeight : 0;
                setMessages(prev => [...data.messages, ...prev]);
                setTimeout(() => {
                    if (container) container.scrollTop = container.scrollHeight - oldHeight;
                    isLoadingMoreRef.current = false;
                }, 0);
            } else {
                setMessages(data.messages);
                setFirstUnreadId(data.first_unread_id);

                setTimeout(() => {
                    if (data.first_unread_id) {
                        const unreadEl = document.getElementById(`msg-${data.first_unread_id}`);
                        if (unreadEl) {
                            unreadEl.scrollIntoView({ behavior: 'auto', block: 'center' }); 
                        } else {
                            scrollToBottom();
                        }
                    } else {
                        scrollToBottom();
                    }
                }, 200);
            }

            setOffset(currentOffset + data.messages.length);
            setHasMore(data.has_more);
        } else {
            if (isLoadMore) isLoadingMoreRef.current = false;
        }
    };

    const handleScroll = () => {
        if (messagesContainerRef.current) {
            if (messagesContainerRef.current.scrollTop <= 50 && hasMore && !isLoadingMoreRef.current) {
                loadMessages(selectedChat!, true);
            }
        }
    };

    useEffect(() => {
        selectedChatRef.current = selectedChat;
        if (selectedChat) {
            setMessageText("");
            setPostFiles([]);
            setIsManageGroupOpen(false);
            localStorage.setItem('activeChatId', selectedChat);
            if (textareaRef.current) textareaRef.current.style.height = 'auto';
        } else {
            localStorage.removeItem('activeChatId');
        }
        return () => localStorage.removeItem('activeChatId');
    }, [selectedChat]);

    useEffect(() => {
        if (!selectedChat) return;
        if (!firstUnreadId) {
            setChats(prev => prev.map(c => c.id === selectedChat ? { ...c, unread_count: 0 } : c));
            return;
        }

        const unreadEl = document.getElementById('unread-indicator');
        if (!unreadEl) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setChats(prev => prev.map(c => c.id === selectedChat ? { ...c, unread_count: 0 } : c));
                observer.disconnect();
            }
        }, { threshold: 0.1 });

        observer.observe(unreadEl);
        return () => observer.disconnect();
    }, [firstUnreadId, selectedChat, messages]);

    useEffect(() => {
        loadChats();

        const handleNewNotif = async (e: any) => {
            const notif = e.detail;

            if (notif.type === 'reaction_update' && String(notif.chat_id) === String(selectedChatRef.current)) {
                setMessages(prev => prev.map(m =>
                    m.id === notif.message_id ? { ...m, reactions: notif.reactions } : m
                ));
                return;
            }

            const isChatNotification = (notif.category === 'social' && notif.title === 'Нове повідомлення') || notif.type === 'new_message';

            if (isChatNotification) {
                loadChats();
                const targetChatId = notif.chat_id || notif.related_object_id || selectedChatRef.current;

                if (selectedChatRef.current && String(targetChatId) === String(selectedChatRef.current)) {
                    const res = await apiRequest(`/profiles/chats/${selectedChatRef.current}/?offset=0&t=${Date.now()}`);
                    if (res?.ok) {
                        const data = await res.json();
                        let hasNewMsgs = false; 
                        
                        setMessages(prev => {
                            const existingIds = new Set(prev.map(m => m.id));
                            const newMsgs = data.messages.filter((m: any) => !existingIds.has(m.id));

                            if (newMsgs.length > 0) {
                                hasNewMsgs = true;
                                return [...prev, ...newMsgs];
                            }
                            return prev;
                        });

                        if (hasNewMsgs) {
                            setTimeout(() => scrollToBottom(true), 150);
                        }
                    }
                }
            }
        };

        window.addEventListener('new_notification', handleNewNotif);
        return () => window.removeEventListener('new_notification', handleNewNotif);
    }, []);
    

    useEffect(() => {
        if (chatId) {
            setSelectedChat(chatId);
            loadMessages(chatId);
        } else {
            setSelectedChat(null);
            setMessages([]);
        }
    }, [chatId]);

    const filteredChats = chats.filter(chat => chat.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleChatSelect = (id: string) => {
        setSelectedChat(id);
        navigate(`/chats/${id}`);
    };

    const handleMsgReaction = async (msgId: string, emoji: string) => {
        setMessages(prev => prev.map(m => {
            if (m.id === msgId) {
                const currentReaction = m.my_reaction;
                const newReactions = { ...(m.reactions || {}) };

                if (currentReaction === emoji) {
                    newReactions[emoji] = Math.max(0, (newReactions[emoji] || 1) - 1);
                    return { ...m, my_reaction: null, reactions: newReactions };
                } else {
                    if (currentReaction) {
                        newReactions[currentReaction] = Math.max(0, (newReactions[currentReaction] || 1) - 1);
                    }
                    newReactions[emoji] = (newReactions[emoji] || 0) + 1;
                    return { ...m, my_reaction: emoji, reactions: newReactions };
                }
            }
            return m;
        }));

        try {
            await apiRequest(`/profiles/messages/${msgId}/react/`, {
                method: 'POST',
                body: JSON.stringify({ emoji })
            });
        } catch (e) {
            console.error("Помилка реакції", e);
        }
    };

    const handleSendMessage = async () => {
        const text = messageText.trim();
        if (!text && postFiles.length === 0) return;
        if (!selectedChat) return;

        const tempId = "temp-" + Date.now().toString();
        const tempImages = postFiles.map(f => f.url);
        const tempMsg: ChatMessage = {
            id: tempId, sender_id: myUserId || "", text: text,
            images: tempImages, created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, tempMsg]);
        setTimeout(() => scrollToBottom(true), 50);

        const formData = new FormData();
        formData.append('text', text);
        postFiles.forEach(f => formData.append('images', f.file));

        setMessageText("");
        setPostFiles([]);
        if (textareaRef.current) textareaRef.current.style.height = 'auto';

        try {
            const res = await apiRequest(`/profiles/chats/${selectedChat}/send/`, {
                method: 'POST',
                body: formData
            });

            if (res?.ok) {
                const fetchRes = await apiRequest(`/profiles/chats/${selectedChat}/?offset=0`);
                if (fetchRes?.ok) {
                    const data = await fetchRes.json();
                    setMessages(prev => {
                        const noTemp = prev.filter(m => m.id !== tempId);
                        const existingIds = new Set(noTemp.map(m => m.id));
                        const newMsgs = data.messages.filter((m: any) => !existingIds.has(m.id));
                        return [...noTemp, ...newMsgs];
                    });
                }
                loadChats();
            } else {
                setMessages(prev => prev.filter(m => m.id !== tempId));
                toast.error("Помилка відправки");
            }
        } catch (e) {
            setMessages(prev => prev.filter(m => m.id !== tempId));
            toast.error("Помилка сервера");
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                stream.getTracks().forEach(track => track.stop());
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                
                // Якщо запис був менше секунди - ігноруємо (можливо це був випадковий клік)
                if (audioBlob.size > 1000) {
                    await handleSendVoiceMessage(audioBlob);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            toast.error("Помилка доступу до мікрофона");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleSendVoiceMessage = async (audioBlob: Blob) => {
        if (!selectedChat) return;

        const tempId = "temp-" + Date.now().toString();
        const tempUrl = URL.createObjectURL(audioBlob);
        const tempMsg: ChatMessage = {
            id: tempId, sender_id: myUserId || "", text: "",
            images: [], voice: tempUrl, created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, tempMsg]);
        setTimeout(() => scrollToBottom(true), 50);

        const formData = new FormData();
        formData.append('voice', audioBlob, 'voice.webm'); // Django за замовчуванням прийме webm

        try {
            const res = await apiRequest(`/profiles/chats/${selectedChat}/send/`, {
                method: 'POST',
                body: formData
            });

            if (res?.ok) {
                const fetchRes = await apiRequest(`/profiles/chats/${selectedChat}/?offset=0`);
                if (fetchRes?.ok) {
                    const data = await fetchRes.json();
                    setMessages(prev => {
                        const noTemp = prev.filter(m => m.id !== tempId);
                        const existingIds = new Set(noTemp.map(m => m.id));
                        const newMsgs = data.messages.filter((m: any) => !existingIds.has(m.id));
                        return [...noTemp, ...newMsgs];
                    });
                }
                loadChats();
            } else {
                setMessages(prev => prev.filter(m => m.id !== tempId));
                toast.error("Помилка відправки");
            }
        } catch (e) {
            setMessages(prev => prev.filter(m => m.id !== tempId));
            toast.error("Помилка сервера");
        }
    };

    const handleCreateGroup = async () => {
        if (!newGroupName.trim()) return toast.error("Введіть назву групи");
        if (newGroupName.trim().length > 64) return toast.error("Назва групи не може перевищувати 64 символи");

        try {
            const res = await apiRequest('/profiles/chats/group/create/', {
                method: 'POST',
                body: JSON.stringify({ name: newGroupName.trim() })
            });
            if (res?.ok) {
                const data = await res.json();
                toast.success("Групу створено!");
                setIsCreateGroupOpen(false);
                setNewGroupName("");
                loadChats();
                handleChatSelect(data.chat_id);
            }
        } catch {
            toast.error("Помилка створення групи");
        }
    };

    const openManageGroup = async () => {
        const chatInfo = chats.find(c => c.id === selectedChat);
        if (chatInfo) setEditGroupName(chatInfo.name);
        setIsEditingName(false);
        setIsManageGroupOpen(true);
        setIsAddingUser(false);
        const res = await apiRequest(`/profiles/chats/group/${selectedChat}/manage/`);
        if (res?.ok) {
            const data = await res.json();
            setGroupParticipants(data.participants);
        }
    };

    const handleUpdateGroupName = async () => {
        const name = editGroupName.trim();
        if (!name || name === activeChatData?.name) {
            setIsEditingName(false);
            return;
        }
        if (name.length > 64) return toast.error("Максимальна довжина 64 символи");

        try {
            const res = await apiRequest(`/profiles/chats/group/${selectedChat}/manage/`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            if (res?.ok) {
                toast.success("Назву оновлено");
                setIsEditingName(false);
                loadChats();
                if (selectedChat) loadMessages(selectedChat); 
            }
        } catch { toast.error("Помилка сервера"); }
    };

    const handleUpdateGroupAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) return toast.error("Виберіть зображення");
        if (file.size > 5 * 1024 * 1024) return toast.error("Зображення завелике (макс 5 МБ)");

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const res = await apiRequest(`/profiles/chats/group/${selectedChat}/manage/`, {
                method: 'PATCH',
                body: formData
            });
            if (res?.ok) {
                toast.success("Фото оновлено");
                loadChats();
            }
        } catch { toast.error("Помилка сервера"); }
    };

    const handleTransferAdmin = async (userId: string) => {
        try {
            const res = await apiRequest(`/profiles/chats/group/${selectedChat}/transfer-admin/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId })
            });
            if (res?.ok) {
                toast.success("Права адміністратора передано");
                openManageGroup();
                if (selectedChat) loadMessages(selectedChat); 
            } else {
                toast.error("Не вдалося передати права");
            }
        } catch { toast.error("Помилка сервера"); }
    };

    const handleAddUserToGroup = async (userId: string) => {
        try {
            const res = await apiRequest(`/profiles/chats/group/${selectedChat}/manage/`, {
                method: 'POST',
                body: JSON.stringify({ user_id: userId })
            });
            if (res?.ok) {
                toast.success("Користувача додано");
                setIsAddingUser(false);
                openManageGroup();
                if (selectedChat) loadMessages(selectedChat); 
            } else {
                toast.error("Помилка (можливо користувач вже в групі)");
            }
        } catch { toast.error("Помилка сервера"); }
    };

    const handleRemoveUserFromGroup = async (userId: string) => {
        try {
            const res = await apiRequest(`/profiles/chats/group/${selectedChat}/manage/`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId })
            });
            if (res?.ok) {
                toast.success("Вилучено");
                setGroupParticipants(prev => prev.filter(p => p.id !== userId));
                if (selectedChat) loadMessages(selectedChat); 
            }
        } catch { toast.error("Помилка вилучення"); }
    };

    const handleLeaveGroup = async () => {
        const iAmAdmin = groupParticipants.find(p => p.id === myUserId)?.is_admin;
        if (iAmAdmin && groupParticipants.length > 1) {
            return toast.error("Ви адміністратор. Спочатку передайте права іншому учаснику.");
        }

        try {
            const res = await apiRequest(`/profiles/chats/group/${selectedChat}/manage/`, {
                method: 'DELETE'
            });
            if (res?.ok) {
                toast.success("Ви покинули групу");
                setIsManageGroupOpen(false);
                setSelectedChat(null);
                navigate('/chats');
                loadChats();
            }
        } catch { toast.error("Помилка"); }
    };

    const groupedMessages: { dateStr: string, messages: ChatMessage[] }[] = [];
    messages.forEach(msg => {
        const dateStr = new Date(msg.created_at).toDateString();
        const lastGroup = groupedMessages[groupedMessages.length - 1];
        if (lastGroup && lastGroup.dateStr === dateStr) {
            lastGroup.messages.push(msg);
        } else {
            groupedMessages.push({ dateStr, messages: [msg] });
        }
    });

    const activeChatData = chats.find(c => c.id === selectedChat);
    const iAmAdmin = groupParticipants.find(p => p.id === myUserId)?.is_admin;
    const availableUsersToAdd = chats.filter(c => !c.is_group && c.other_user_id && !groupParticipants.find(p => p.id === c.other_user_id));

    return (<>
        <div className={styles.chatPage}>
            <title>Quack | Чати</title>

            {/* 🔥 Умовний рендер для мобілки: якщо чат обрано - ховаємо список 🔥 */}
            {(!isMobile || !selectedChat) && (
                <div className={styles.sidebar}>
                    <div className={styles.searchWrapper}>
                        <input type="text" className={styles.searchInput} placeholder="Пошук користувачів..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        <div className={styles.iconPlus} onClick={() => setIsCreateGroupOpen(true)}>
                            <RoundButton button={{ icon: SVG_PLUS, text: "Створити групу" }} />
                        </div>
                    </div>

                    <div className={styles.chatList}>
                        {filteredChats.length === 0 ? (
                            <div style={{ padding: '1.25em', textAlign: 'center', opacity: 0.5, color: 'var(--color-text)' }}>Чатів не знайдено</div>
                        ) : (
                            filteredChats.map(chat => (
                                <div key={chat.id} className={`${styles.chatItem} ${selectedChat === chat.id ? styles.activeChat : ""}`} onClick={() => handleChatSelect(chat.id)}>
                                    <div className={styles.avatar} style={{ backgroundImage: `url(${chat.avatar || '/images/no-image.png'})` }}>
                                        {chat.unread_count > 0 && (
                                            <div className={styles.unreadBadge}>{chat.unread_count <= 99 ? chat.unread_count : '99+'}</div>
                                        )}
                                    </div>
                                    <div className={styles.chatPreview}>
                                        <div className={styles.chatHeader}>
                                            <span className={styles.chatName}>{chat.name}</span>
                                            <span className={styles.chatTime}>{formatSidebarTime(chat.updated_at)}</span>
                                        </div>
                                        <div className={styles.lastMessage}>{chat.last_message}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* 🔥 Умовний рендер для мобілки: якщо чат не обрано - ховаємо поле чату 🔥 */}
            {(!isMobile || selectedChat) && (
                <div className={styles.chatArea}>
                    {selectedChat ? (
                        <>
                            <div className={styles.activeChatHeader}>
                                {/* 🔥 Кнопка Назад для мобільних 🔥 */}
                                {isMobile && (
                                    <div 
                                        className={styles.backButton} 
                                        onClick={() => { setSelectedChat(null); navigate('/chats'); }}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="15 18 9 12 15 6"></polyline>
                                        </svg>
                                    </div>
                                )}
                                
                                {activeChatData && (
                                    <>
                                        <div
                                            className={styles.avatar}
                                            style={{ backgroundImage: `url(${activeChatData.avatar || '/images/no-image.png'})`, cursor: 'pointer' }}
                                            onClick={() => {
                                                if (activeChatData.is_group) {
                                                    openManageGroup();
                                                } else {
                                                    navigate(`/profile/${activeChatData.other_user_id}`);
                                                }
                                            }}
                                        ></div>
                                        <div style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onClick={() => {
                                            if (activeChatData.is_group) {
                                                openManageGroup();
                                            } else {
                                                navigate(`/profile/${activeChatData.other_user_id}`);
                                            }
                                        }}>
                                            <span className={styles.activeChatName}>{activeChatData.name}</span>
                                            {activeChatData.is_group && (
                                                <span style={{ fontSize: '0.6875em', color: 'var(--color-grey)' }}>Натисніть для керування групою</span>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className={styles.messagesContainer} ref={messagesContainerRef} onScroll={handleScroll}>
                                {hasMore && (
                                    <div style={{ textAlign: 'center', margin: '0.625em 0', opacity: 0.5, fontSize: '0.75em' }}>
                                        Завантаження історії...
                                    </div>
                                )}

                                {messages.length === 0 ? (
                                    <div className={styles.emptyChat}>Немає повідомлень</div>
                                ) : (
                                    groupedMessages.map(group => {
                                        const dateText = getDateSeparator(group.messages[0].created_at);
                                        const isToday = dateText === "Сьогодні";

                                        return (
                                            <div key={group.dateStr} className={styles.dayGroup}>
                                                <div className={`${styles.dateSeparator} ${!isToday ? styles.stickyDate : ''}`}>
                                                    {dateText}
                                                </div>

                                                {group.messages.map(msg => {
                                                    if (msg.is_system) {
                                                        return (
                                                            <div key={msg.id} className={styles.systemMessage}>
                                                                {msg.text}
                                                            </div>
                                                        );
                                                    }

                                                    const isMine = msg.sender_id === myUserId;
                                                    const isGroup = activeChatData?.is_group;

                                                    return (
                                                        <React.Fragment key={msg.id}>
                                                            {msg.id === firstUnreadId && (
                                                                <div id="unread-indicator" style={{
                                                                    alignSelf: 'center', margin: '0.9375em 0', padding: '0.25em 0.75em',
                                                                    background: 'var(--color-opaque-secondary)', borderRadius: '0.75em',
                                                                    color: 'var(--color-main)', fontSize: '0.75em', fontWeight: 'bold'
                                                                }}>
                                                                    Нові повідомлення
                                                                </div>
                                                            )}

                                                            <div id={`msg-${msg.id}`}
                                                                className={`${styles.messageWrapper} ${isMine ? styles.myMessage : styles.otherMessage}`}
                                                                onMouseLeave={() => setActiveMsgReactionPopup(null)}
                                                                // 🔥 Мобільний лонг-прес для реакції 🔥
                                                                onContextMenu={(e) => {
                                                                    if (isMobile) {
                                                                        e.preventDefault();
                                                                        setActiveMsgReactionPopup(activeMsgReactionPopup === msg.id ? null : msg.id);
                                                                    }
                                                                }}
                                                            >
                                                                {!isMine && isGroup && (
                                                                    <div
                                                                        className={styles.msgAvatar}
                                                                        style={{ backgroundImage: `url(${msg.sender_avatar || '/images/no-image.png'})` }}
                                                                        onClick={() => navigate(`/profile/${msg.sender_id}`)}
                                                                    />
                                                                )}

                                                                {isMine && (
                                                                    <div className={`${styles.msgActionBtn} ${activeMsgReactionPopup === msg.id ? styles.activeBtn : ''}`} onClick={() => setActiveMsgReactionPopup(activeMsgReactionPopup === msg.id ? null : msg.id)}>
                                                                        {SVG_ADDREACTION}
                                                                        {activeMsgReactionPopup === msg.id && (
                                                                            <div className={styles.msgReactionPopup}>
                                                                                {emojis.map(e => (
                                                                                    <div key={e} className={styles.msgReactionCircle} onClick={(ev) => { ev.stopPropagation(); handleMsgReaction(msg.id, e); setActiveMsgReactionPopup(null); }}>{e}</div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '70%' }}>
                                                                    {!isMine && isGroup && (
                                                                        <span className={styles.msgSenderName} onClick={() => navigate(`/profile/${msg.sender_id}`)}>
                                                                            {msg.sender_name}
                                                                        </span>
                                                                    )}

                                                                    <div className={styles.messageBubble}>
                                                                        {msg.text && <div className={styles.messageText}>{renderTextWithLinks(msg.text, isMine)}</div>}
                                                                        
                                                                        {msg.voice && (
                                                                            <div className={styles.voiceMessageWrapper}>
                                                                                <audio controls src={msg.voice} className={styles.audioPlayer} />
                                                                            </div>
                                                                        )}
                                                                        
                                                                        {msg.images && msg.images.length > 0 && (
                                                                            <div className={styles.msgImagesGrid}>
                                                                                {msg.images.map((imgUrl, i) => (
                                                                                    <img key={i} src={imgUrl} alt="attachment" className={styles.msgImage} onClick={() => setPreviewImage(imgUrl)} />
                                                                                ))}
                                                                            </div>
                                                                        )}

                                                                        <div className={styles.messageFooter}>
                                                                            {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                                                                                <div className={styles.msgReactionsContainer}>
                                                                                    {Object.entries(msg.reactions).map(([emoji, count]) => count > 0 && (
                                                                                        <div key={emoji} onClick={() => handleMsgReaction(msg.id, emoji)} className={`${styles.msgReaction} ${msg.my_reaction === emoji ? styles.msgReactionActive : ''}`}>
                                                                                            <span>{emoji}</span>
                                                                                            {count > 1 && <span style={{ fontSize: '0.6875em', fontWeight: 'bold' }}>{count}</span>}
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                            <div className={styles.messageTime}>{formatTime(msg.created_at)}</div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {!isMine && (
                                                                    <div className={`${styles.msgActionBtn} ${activeMsgReactionPopup === msg.id ? styles.activeBtn : ''}`} onClick={() => setActiveMsgReactionPopup(activeMsgReactionPopup === msg.id ? null : msg.id)}>
                                                                        {SVG_ADDREACTION}
                                                                        {activeMsgReactionPopup === msg.id && (
                                                                            <div className={styles.msgReactionPopup}>
                                                                                {emojis.map(e => (
                                                                                    <div key={e} className={styles.msgReactionCircle} onClick={(ev) => { ev.stopPropagation(); handleMsgReaction(msg.id, e); setActiveMsgReactionPopup(null); }}>{e}</div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className={styles.inputContainerContainer}>
                                <div className={styles.superInputContainer}>
                                    {postFiles.length > 0 && (
                                        <div className={styles.attachments}>
                                            {postFiles.map((f, i) => (
                                                <div key={i} className={styles.attachedImg} style={{ backgroundImage: `url(${f.url})`, backgroundSize: 'cover' }}>
                                                    <div className={styles.deleteImg} onClick={() => setPostFiles(prev => prev.filter((_, idx) => idx !== i))}>{SVG_PLUS}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className={styles.inputContainer}>
                                        {!isRecording && (
                                            <div className={styles.inputIcon} onClick={() => postFileInputRef.current?.click()}>{SVG_CLIP}</div>
                                        )}
                                        
                                        <input
                                            type="file" multiple hidden ref={postFileInputRef} accept="image/*"
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
                                                        const newFilesWithUrls = validFiles.map(f => ({ file: f, url: URL.createObjectURL(f) }));
                                                        setPostFiles(prev => {
                                                            const combined = [...prev, ...newFilesWithUrls];
                                                            if (combined.length > 5) toast.error("Можна додати максимум 5 фото.");
                                                            return combined.slice(0, 5);
                                                        });
                                                    }
                                                    if (postFileInputRef.current) postFileInputRef.current.value = '';
                                                });
                                            }}
                                        />

                                        {/* 🔥 ПОЛЕ ВВОДУ АБО ІНДИКАТОР ЗАПИСУ 🔥 */}
                                        {isRecording ? (
                                            <div className={styles.recordingIndicator}>
                                                <div className={styles.redDot}></div>
                                                Запис аудіо... Відпустіть мікрофон для відправки
                                            </div>
                                        ) : (
                                            <textarea
                                                ref={textareaRef} className={styles.input} placeholder="Написати повідомлення..."
                                                value={messageText} maxLength={4096} rows={1} style={{ resize: 'none', maxHeight: "12.5em", overflow: 'auto' }}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if ((val.match(/\n/g) || []).length <= 100) setMessageText(val);
                                                    else toast.error("Досягнуто ліміт переносів рядка (100).");
                                                }}
                                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                                                onInput={(e) => {
                                                    const t = e.target as HTMLTextAreaElement;
                                                    t.style.height = 'auto'; t.style.height = `${t.scrollHeight}px`;
                                                }}
                                            />
                                        )}

                                        {/* 🔥 КНОПКА ВІДПРАВКИ / МІКРОФОН 🔥 */}
                                        {messageText.trim() || postFiles.length > 0 ? (
                                            <div className={styles.inputIcon} onClick={handleSendMessage}>{SVG_SEND}</div>
                                        ) : (
                                            <div 
                                                className={`${styles.inputIcon} ${isRecording ? styles.recordingPulse : ''}`} 
                                                onPointerDown={startRecording}
                                                onPointerUp={stopRecording}
                                                onPointerCancel={stopRecording}
                                                onContextMenu={(e) => e.preventDefault()} // Забороняємо контекстне меню на мобілках
                                            >
                                                {SVG_MIC}
                                            </div>
                                        )}

                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className={styles.emptyChat}>Оберіть чат для початку спілкування</div>
                    )}
                </div>
            )}
        </div>

        {/* 🔥 МОДАЛКИ ЗАЛИШАЮТЬСЯ БЕЗ ЗМІН У ЛОГІЦІ 🔥 */}
        {isCreateGroupOpen && (
            <div className={styles.modalOverlay} onClick={() => setIsCreateGroupOpen(false)}>
                <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                    <div className={styles.modalHeader}>
                        <h3 className={styles.modalTitle}>Нова група</h3>
                        <span className={styles.closeModal} onClick={() => setIsCreateGroupOpen(false)}>✕</span>
                    </div>
                    <input
                        type="text"
                        value={newGroupName}
                        maxLength={64}
                        onChange={e => setNewGroupName(e.target.value)}
                        placeholder="Введіть назву групи..."
                        className={styles.modalInput}
                    />
                    <button onClick={handleCreateGroup} className={styles.modalBtnSubmit}>Створити</button>
                </div>
            </div>
        )}

        {isManageGroupOpen && activeChatData && (
            <div className={styles.modalOverlay} onClick={() => setIsManageGroupOpen(false)}>
                <div className={styles.modalContent} onClick={e => e.stopPropagation()} style={{ width: '23.75em' }}>
                    <div className={styles.modalHeader}>
                        <h3 className={styles.modalTitle}>Керування групою</h3>
                        <span className={styles.closeModal} onClick={() => setIsManageGroupOpen(false)}>✕</span>
                    </div>

                    {!isAddingUser ? (
                        <>
                            <div className={styles.groupEditSection}>
                                <div className={styles.groupAvatarWrapper} style={{ cursor: iAmAdmin ? "pointer" : "" }} onClick={() => iAmAdmin && groupAvatarInputRef.current?.click()}>
                                    <div className={styles.groupAvatarLarge} style={{ backgroundImage: `url(${activeChatData.avatar || '/images/no-image.png'})` }}>
                                        {iAmAdmin && <div className={styles.groupAvatarOverlay}>{SVG_CLIP}</div>}
                                    </div>
                                    <input type="file" hidden ref={groupAvatarInputRef} accept="image/*" onChange={handleUpdateGroupAvatar} />
                                </div>

                                <div className={styles.groupNameWrapper}>
                                    {isEditingName ? (
                                        <input
                                            autoFocus
                                            type="text"
                                            className={styles.modalInput}
                                            style={{ marginBottom: 0, textAlign: 'center' }}
                                            value={editGroupName}
                                            maxLength={64}
                                            onChange={(e) => setEditGroupName(e.target.value)}
                                            onBlur={handleUpdateGroupName}
                                            onKeyDown={(e) => e.key === 'Enter' && handleUpdateGroupName()}
                                        />
                                    ) : (
                                        <div className={styles.groupNameDisplay} style={{ cursor: iAmAdmin ? "pointer" : "" }} onClick={() => iAmAdmin && setIsEditingName(true)}>
                                            <span className={styles.modalTitle} style={{ fontSize: '1.125em' }}>{activeChatData.name}</span>
                                            {iAmAdmin && <span className={styles.editIcon}>✎</span>}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={styles.participantList}>
                                {groupParticipants.map(p => (
                                    <div key={p.id} className={styles.participantItem}>
                                        <div
                                            className={styles.clickableProfile}
                                            onClick={() => { setIsManageGroupOpen(false); navigate(`/profile/${p.id}`); }}
                                        >
                                            <div className={styles.avatarSmall} style={{ backgroundImage: `url(${p.avatar || '/images/no-image.png'})` }}></div>
                                            <div className={styles.participantInfo}>
                                                <span className={styles.participantName}>{p.name}</span>
                                                {p.is_admin && <span className={styles.adminBadge}>Адмін</span>}
                                            </div>
                                        </div>

                                        <div className={styles.participantActions}>
                                            {iAmAdmin && !p.is_admin && (
                                                <span className={styles.transferAdminBtn} onClick={() => handleTransferAdmin(p.id)}>
                                                    Зробити адміном
                                                </span>
                                            )}
                                            {iAmAdmin && p.id !== myUserId && (
                                                <span className={styles.removeUserBtn} onClick={() => handleRemoveUserFromGroup(p.id)}>Вилучити</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {iAmAdmin && (
                                <button onClick={() => setIsAddingUser(true)} className={styles.modalBtnAdd} style={{ marginTop: '0.625em' }}>
                                    Додати користувача
                                </button>
                            )}

                            <button onClick={handleLeaveGroup} className={styles.leaveBtn} style={{ marginTop: '0.9375em' }}>
                                Вийти з групи
                            </button>
                        </>
                    ) : (
                        <>
                            <h4 style={{ margin: '0 0 0.625em 0', color: 'var(--color-text)', fontSize: '0.875em', fontWeight: '500' }}>Виберіть користувача з ваших чатів:</h4>
                            <div className={styles.participantList}>
                                {availableUsersToAdd.length === 0 ? (
                                    <div style={{ textAlign: 'center', opacity: 0.5, padding: '1.25em', color: 'var(--color-text)' }}>Немає кого додати</div>
                                ) : (
                                    availableUsersToAdd.map(chat => (
                                        <div key={chat.id} className={styles.participantItem} style={{ cursor: 'pointer' }} onClick={() => chat.other_user_id && handleAddUserToGroup(chat.other_user_id)}>
                                            <div className={styles.avatarSmall} style={{ backgroundImage: `url(${chat.avatar || '/images/no-image.png'})` }}></div>
                                            <span className={styles.participantName} style={{ flex: 1 }}>{chat.name}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                            <button onClick={() => setIsAddingUser(false)} className={styles.modalBtnCancel} style={{ marginTop: '0.625em', width: '100%' }}>
                                Назад
                            </button>
                        </>
                    )}
                </div>
            </div>
        )}

        {previewImage && (
            <div className={styles.imageModalOverlay} onClick={() => setPreviewImage(null)}>
                <div className={styles.imageModalContent}>
                    <img src={previewImage} alt="Full screen" className={styles.fullScreenImage} />
                </div>
            </div>
        )}
    </>
    );
}