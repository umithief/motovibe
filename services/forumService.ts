import { ForumTopic, ForumComment, User } from '../types';
import { DB, getStorage, setStorage, delay } from './db';

// Başlangıç için örnek veriler
const MOCK_TOPICS: ForumTopic[] = [
  {
    id: 'TOPIC-001',
    authorId: 'system',
    authorName: 'MotoVibe Admin',
    title: 'MotoVibe Topluluğuna Hoş Geldiniz!',
    content: 'Merhaba arkadaşlar, burası motosiklet tutkunlarının buluşma noktası. Deneyimlerinizi paylaşabilir, teknik sorular sorabilir veya gezi planlarınızı duyurabilirsiniz. Saygı çerçevesinde keyifli forumlar!',
    category: 'Genel',
    date: new Date().toLocaleDateString('tr-TR'),
    likes: 42,
    views: 1250,
    comments: [
      {
        id: 'CMT-001',
        authorId: 'u1',
        authorName: 'Ahmet Yılmaz',
        content: 'Harika bir platform olmuş, elinize sağlık!',
        date: new Date().toLocaleDateString('tr-TR'),
        likes: 5
      }
    ],
    tags: ['Duyuru', 'Kurallar']
  },
  {
    id: 'TOPIC-002',
    authorId: 'u2',
    authorName: 'Caner Erkin',
    title: 'Yamaha MT-07 mi Honda CB650R mı?',
    content: 'Arkadaşlar yeni sezonda naked bir makineye geçmeyi düşünüyorum. İkisi arasında kaldım. Şehir içi ağırlıklı kullanıyorum ama hafta sonu viraj da yaparım. Sizce hangisi?',
    category: 'Teknik',
    date: new Date().toLocaleDateString('tr-TR'),
    likes: 15,
    views: 340,
    comments: [],
    tags: ['Tavsiye', 'Naked', 'Karşılaştırma']
  },
  {
    id: 'TOPIC-003',
    authorId: 'u3',
    authorName: 'Elif Demir',
    title: 'Ege Turu Rotası Önerisi',
    content: 'Önümüzdeki ay İstanbul çıkışlı bir Ege turu planlıyorum. Mutlaka görmen lazım dediğiniz virajlı yollar ve kamp alanları var mı?',
    category: 'Gezi',
    date: new Date().toLocaleDateString('tr-TR'),
    likes: 28,
    views: 560,
    comments: [],
    tags: ['Rota', 'Kamp', 'Ege']
  }
];

export const forumService = {
  async getTopics(): Promise<ForumTopic[]> {
    await delay(500);
    const topics = getStorage<ForumTopic[]>(DB.FORUM_TOPICS, []);
    
    // Eğer hiç konu yoksa mock datayı yükle
    if (topics.length === 0) {
      setStorage(DB.FORUM_TOPICS, MOCK_TOPICS);
      return MOCK_TOPICS;
    }
    
    return topics;
  },

  async getTopicById(id: string): Promise<ForumTopic | undefined> {
    await delay(300);
    const topics = getStorage<ForumTopic[]>(DB.FORUM_TOPICS, []);
    return topics.find(t => t.id === id);
  },

  async createTopic(user: User, title: string, content: string, category: ForumTopic['category'], tags: string[]): Promise<ForumTopic> {
    await delay(800);
    const topics = getStorage<ForumTopic[]>(DB.FORUM_TOPICS, []);
    
    const newTopic: ForumTopic = {
      id: `TOPIC-${Date.now()}`,
      authorId: user.id,
      authorName: user.name,
      title,
      content,
      category,
      date: new Date().toLocaleDateString('tr-TR'),
      likes: 0,
      views: 0,
      comments: [],
      tags
    };

    topics.unshift(newTopic);
    setStorage(DB.FORUM_TOPICS, topics);
    return newTopic;
  },

  async addComment(topicId: string, user: User, content: string): Promise<ForumComment> {
    await delay(500);
    const topics = getStorage<ForumTopic[]>(DB.FORUM_TOPICS, []);
    const topicIndex = topics.findIndex(t => t.id === topicId);

    if (topicIndex === -1) throw new Error('Konu bulunamadı');

    const newComment: ForumComment = {
      id: `CMT-${Date.now()}`,
      authorId: user.id,
      authorName: user.name,
      content,
      date: new Date().toLocaleDateString('tr-TR'),
      likes: 0
    };

    topics[topicIndex].comments.push(newComment);
    setStorage(DB.FORUM_TOPICS, topics);
    return newComment;
  },

  async toggleLike(topicId: string): Promise<void> {
    // Gerçek bir uygulamada user ID ile kontrol edilir ama burada basit tutuyoruz
    const topics = getStorage<ForumTopic[]>(DB.FORUM_TOPICS, []);
    const topic = topics.find(t => t.id === topicId);
    if (topic) {
      topic.likes += 1;
      setStorage(DB.FORUM_TOPICS, topics);
    }
  }
};