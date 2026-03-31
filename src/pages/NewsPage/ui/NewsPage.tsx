import styles from "./NewsPage.module.css"

import { useState, useEffect } from "react";


interface NewsItem {
    id: string;
    title: string;
    text: string;
    image?: string;
    created_at: string; // Формат "2026-03-31T12:00:00"
}

// Приклад даних
const DUMMY_DATA: NewsItem[] = [
    { 
        id: "1", 
        title: "Технологічний прорив: ШІ навчився розуміти емоції", 
        text: "Сьогодні дослідники оголосили про створення нової моделі нейромережі, яка здатна розпізнавати мікроміміку обличчя з точністю до 99%. Це відкриває нові можливості для медицини та психології.", 
        image: "https://picsum.photos/400/600", 
        created_at: "2026-03-31T18:30:00" 
    },
    { 
        id: "2", 
        title: "Новий парк у центрі міста", 
        text: "Відкриття відбудеться вже цієї суботи. На території облаштували зони для йоги, сучасний скейт-парк та фонтани з підсвіткою. Мерія обіцяє безкоштовний Wi-Fi по всій території.", 
        image: "https://picsum.photos/500/350", 
        created_at: "2026-03-31T17:15:00" 
    },
    { 
        id: "3", 
        title: "Коротко про погоду", 
        text: "Завтра очікується сонячна погода без опадів. Температура повітря прогріється до +22 градусів.", 
        created_at: "2026-03-31T16:00:00" 
    },
    { 
        id: "4", 
        title: "Дослідження космосу: місія на Марс готується до старту", 
        text: "Перший екіпаж вже пройшов фінальне тестування в умовах ізоляції. Вчені впевнені, що запуск відбудеться вчасно. Космічний корабель нового покоління здатний долетіти до червоної планети за рекордно короткий термін, використовуючи новітні плазмові двигуни. Це великий крок для всього людства, який змінить наше уявлення про колонізацію інших планет.", 
        image: "https://picsum.photos/400/700", 
        created_at: "2026-03-31T15:45:00" 
    },
    { 
        id: "5", 
        title: "Рецепт ідеальної кави від бариста", 
        text: "Секрет полягає у температурі води та свіжості обсмаження зерен. Спробуйте додати дрібку солі для балансу смаку.", 
        image: "https://picsum.photos/400/400", 
        created_at: "2026-03-31T14:20:00" 
    },
    { 
        id: "6", 
        title: "Музичний фестиваль повертається!", 
        text: "Після дворічної перерви організатори анонсували список хедлайнерів. Квитки з'являться у продажу вже завтра. Очікується понад 50 тисяч глядачів з усього світу.", 
        image: "https://picsum.photos/600/400", 
        created_at: "2026-03-31T13:00:00" 
    },
    { 
        id: "7", 
        title: "Економічні новини: курс стабільний", 
        text: "Аналітики прогнозують спокійний фінансовий місяць для інвесторів.", 
        created_at: "2026-03-31T12:10:00" 
    },
    { 
        id: "8", 
        title: "Мистецтво майбутнього: виставка NFT у Києві", 
        text: "Сучасні художники презентували свої роботи, які існують лише у цифровому просторі. Відвідувачі можуть взаємодіяти з картинами за допомогою окулярів віртуальної реальності. Деякі лоти були продані за лічені хвилини після відкриття експозиції.", 
        image: "https://picsum.photos/400/550", 
        created_at: "2026-03-31T11:00:00" 
    },
    { 
        id: "9", 
        title: "Спорт: перемога у фіналі", 
        text: "Наша збірна здобула золото у драматичному поєдинку, який завершився серією пенальті.", 
        image: "https://picsum.photos/450/300", 
        created_at: "2026-03-31T10:30:00" 
    }
];

export default function NewsPage() {
    const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
    const [news, setNews] = useState<NewsItem[]>([]);

    useEffect(() => {
        // Сортуємо: нові (велика дата) спочатку
        const sorted = [...DUMMY_DATA].sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setNews(sorted);
    }, []);

    return (
        <div className={styles.newsContainer}>
            <div className={styles.masonryGrid}>
                {news.map((item) => (
                    <div 
                        key={item.id} 
                        className={styles.newsCard} 
                        onClick={() => setSelectedNews(item)}
                    >
                        {item.image && (
                            <img src={item.image} alt="" className={styles.cardImg} />
                        )}
                        <div className={styles.cardContent}>
                            <span className={styles.date}>
                                {new Date(item.created_at).toLocaleDateString()}
                            </span>
                            <h2 className={styles.title}>{item.title}</h2>
                            <p className={styles.text}>{item.text}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Модалка */}
            {selectedNews && (
                <div className={styles.modalOverlay} onClick={() => setSelectedNews(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        {selectedNews.image && <img src={selectedNews.image} className={styles.modalImg} />}
                        <div className={styles.modalBody}>
                            <span className={styles.date}>{new Date(selectedNews.created_at).toLocaleString()}</span>
                            <h1>{selectedNews.title}</h1>
                            <p>{selectedNews.text}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}