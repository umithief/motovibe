import React, { useState, useEffect } from 'react';
import { MessageSquare, Heart, Eye, Plus, User, Hash, Calendar, ArrowLeft, Send, Lock } from 'lucide-react';
import { ForumTopic, User as UserType } from '../types';
import { Button } from './Button';
import { forumService } from '../services/forumService';

interface ForumProps {
  user: UserType | null;
  onOpenAuth: () => void;
}

export const Forum: React.FC<ForumProps> = ({ user, onOpenAuth }) => {
  const [view, setView] = useState<'list' | 'detail' | 'create'>('list');
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Create form states
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<ForumTopic['category']>('Genel');
  
  // Comment state
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    setIsLoading(true);
    try {
      const data = await forumService.getTopics();
      setTopics(data);
    } catch (error) {
      console.error("Forum yüklenemedi", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await forumService.createTopic(user, newTitle, newContent, newCategory, ['Yeni']);
      setNewTitle('');
      setNewContent('');
      setView('list');
      loadTopics();
    } catch (error) {
      console.error("Konu açılamadı", error);
    }
  };

  const handleTopicClick = (topic: ForumTopic) => {
    setSelectedTopic(topic);
    setView('detail');
  };

  const handleAddComment = async () => {
    if (!user || !selectedTopic || !commentText.trim()) return;

    try {
      const newComment = await forumService.addComment(selectedTopic.id, user, commentText);
      // UI'ı güncelle
      const updatedTopic = {
        ...selectedTopic,
        comments: [...selectedTopic.comments, newComment]
      };
      setSelectedTopic(updatedTopic);
      setCommentText('');
      
      // Listeyi de arka planda güncelle
      const updatedTopics = topics.map(t => t.id === selectedTopic.id ? updatedTopic : t);
      setTopics(updatedTopics);
    } catch (error) {
      console.error("Yorum yapılamadı", error);
    }
  };

  const handleLike = async (e: React.MouseEvent, topicId: string) => {
    e.stopPropagation();
    await forumService.toggleLike(topicId);
    // Optimistic UI update
    setTopics(prev => prev.map(t => t.id === topicId ? { ...t, likes: t.likes + 1 } : t));
    if (selectedTopic && selectedTopic.id === topicId) {
      setSelectedTopic(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
    }
  };

  // Render Functions
  
  const renderTopicList = () => (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-white mb-2">TOPLULUK FORUMU</h1>
          <p className="text-gray-400">Deneyimlerini paylaş, sorular sor ve topluluğa katıl.</p>
        </div>
        {user ? (
          <Button variant="primary" onClick={() => setView('create')}>
            <Plus className="w-4 h-4 mr-2" /> YENİ KONU AÇ
          </Button>
        ) : (
           <Button variant="outline" onClick={onOpenAuth} className="border-moto-accent text-moto-accent hover:bg-moto-accent hover:text-white">
             <User className="w-4 h-4 mr-2" /> GİRİŞ YAP VE KATIL
           </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
           <div className="w-10 h-10 border-2 border-moto-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {topics.map((topic) => (
            <div 
              key={topic.id}
              onClick={() => handleTopicClick(topic)}
              className="group bg-gray-900/50 border border-white/10 p-6 rounded-xl hover:border-moto-accent/50 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-moto-accent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                   <div className="px-2 py-1 bg-white/5 rounded text-[10px] font-bold uppercase text-moto-accent border border-white/5">
                     {topic.category}
                   </div>
                   <span className="text-xs text-gray-500 font-mono">{topic.date}</span>
                </div>
                <div className="flex items-center gap-4 text-gray-500 text-xs">
                  <div className="flex items-center gap-1"><Eye className="w-3 h-3" /> {topic.views}</div>
                  <div className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {topic.comments.length}</div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-moto-accent transition-colors">{topic.title}</h3>
              <p className="text-gray-400 text-sm line-clamp-2 mb-4">{topic.content}</p>

              <div className="flex justify-between items-center border-t border-white/5 pt-4">
                 <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold text-white">
                      {topic.authorName.charAt(0)}
                    </div>
                    <span className="text-xs text-gray-300">{topic.authorName}</span>
                 </div>
                 <button 
                    onClick={(e) => handleLike(e, topic.id)}
                    className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors text-sm group/like"
                 >
                    <Heart className="w-4 h-4 group-hover/like:fill-red-500" /> {topic.likes}
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderDetail = () => {
    if (!selectedTopic) return null;
    return (
      <div className="animate-in slide-in-from-right duration-300">
        <Button variant="ghost" onClick={() => setView('list')} className="mb-6 pl-0 hover:text-moto-accent">
          <ArrowLeft className="w-4 h-4 mr-2" /> FORUMA DÖN
        </Button>

        <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden mb-8">
          {/* Header */}
          <div className="p-6 border-b border-white/10 bg-white/5">
            <div className="flex flex-wrap gap-2 mb-4">
               <span className="px-3 py-1 bg-moto-accent text-white text-xs font-bold rounded">{selectedTopic.category}</span>
               {selectedTopic.tags.map(tag => (
                 <span key={tag} className="px-3 py-1 bg-gray-800 text-gray-400 text-xs rounded flex items-center"><Hash className="w-3 h-3 mr-1"/>{tag}</span>
               ))}
            </div>
            <h1 className="text-3xl font-display font-bold text-white mb-4">{selectedTopic.title}</h1>
            <div className="flex items-center justify-between text-sm text-gray-400">
               <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-moto-accent to-red-900 flex items-center justify-center text-white font-bold">
                    {selectedTopic.authorName.charAt(0)}
                  </div>
                  <span className="text-white font-medium">{selectedTopic.authorName}</span>
                  <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                  <span>{selectedTopic.date}</span>
               </div>
               <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1"><Eye className="w-4 h-4"/> {selectedTopic.views}</span>
                  <button onClick={(e) => handleLike(e, selectedTopic.id)} className="flex items-center gap-1 hover:text-red-500"><Heart className="w-4 h-4"/> {selectedTopic.likes}</button>
               </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-8 text-gray-200 leading-relaxed text-lg border-b border-white/10 min-h-[200px]">
            {selectedTopic.content}
          </div>

          {/* Comments Section */}
          <div className="p-6 md:p-8 bg-[#050505]">
             <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
               <MessageSquare className="w-5 h-5 text-moto-accent"/> Yorumlar ({selectedTopic.comments.length})
             </h3>
             
             <div className="space-y-6 mb-8">
                {selectedTopic.comments.length === 0 && (
                  <p className="text-gray-500 italic text-center py-4">Henüz yorum yapılmamış. İlk yorumu sen yap!</p>
                )}
                {selectedTopic.comments.map(comment => (
                  <div key={comment.id} className="flex gap-4">
                     <div className="w-10 h-10 rounded-full bg-gray-800 flex-shrink-0 flex items-center justify-center text-gray-400 border border-white/10">
                        {comment.authorName.charAt(0)}
                     </div>
                     <div className="flex-1 bg-gray-900 p-4 rounded-xl rounded-tl-none border border-white/5">
                        <div className="flex justify-between items-center mb-2">
                           <span className="font-bold text-white text-sm">{comment.authorName}</span>
                           <span className="text-xs text-gray-500">{comment.date}</span>
                        </div>
                        <p className="text-gray-300 text-sm">{comment.content}</p>
                     </div>
                  </div>
                ))}
             </div>

             {/* Add Comment Form */}
             {user ? (
               <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-moto-accent flex-shrink-0 flex items-center justify-center text-white font-bold">
                     {user.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                     <textarea 
                       value={commentText}
                       onChange={(e) => setCommentText(e.target.value)}
                       placeholder="Bu konu hakkında ne düşünüyorsun?"
                       className="w-full bg-gray-800 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-moto-accent transition-colors min-h-[100px]"
                     />
                     <div className="mt-2 flex justify-end">
                        <Button size="sm" onClick={handleAddComment} disabled={!commentText.trim()}>
                           <Send className="w-4 h-4 mr-2" /> GÖNDER
                        </Button>
                     </div>
                  </div>
               </div>
             ) : (
               <div className="bg-gray-800/50 p-4 rounded-xl text-center border border-white/5">
                  <Lock className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm mb-3">Yorum yapabilmek için giriş yapmalısın.</p>
                  <Button variant="outline" size="sm" onClick={onOpenAuth}>GİRİŞ YAP</Button>
               </div>
             )}
          </div>
        </div>
      </div>
    );
  };

  const renderCreate = () => (
    <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom duration-300">
      <Button variant="ghost" onClick={() => setView('list')} className="mb-6 pl-0 hover:text-moto-accent">
         <ArrowLeft className="w-4 h-4 mr-2" /> İPTAL ET
      </Button>
      
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-8 shadow-2xl">
         <h2 className="text-2xl font-display font-bold text-white mb-6 border-b border-white/10 pb-4">YENİ KONU OLUŞTUR</h2>
         
         <form onSubmit={handleCreateTopic} className="space-y-6">
            <div>
               <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Konu Başlığı</label>
               <input 
                 type="text" 
                 required
                 value={newTitle}
                 onChange={(e) => setNewTitle(e.target.value)}
                 placeholder="Örn: Kask seçiminde dikkat edilmesi gerekenler"
                 className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-moto-accent focus:ring-1 focus:ring-moto-accent outline-none"
               />
            </div>

            <div>
               <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Kategori</label>
               <div className="flex flex-wrap gap-2">
                  {['Genel', 'Teknik', 'Gezi', 'Ekipman', 'Etkinlik'].map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setNewCategory(cat as any)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                        newCategory === cat 
                          ? 'bg-moto-accent border-moto-accent text-white' 
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
               </div>
            </div>

            <div>
               <label className="block text-xs font-bold text-gray-400 uppercase mb-2">İçerik</label>
               <textarea 
                 required
                 value={newContent}
                 onChange={(e) => setNewContent(e.target.value)}
                 placeholder="Düşüncelerini detaylıca paylaş..."
                 className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-moto-accent focus:ring-1 focus:ring-moto-accent outline-none min-h-[200px]"
               />
            </div>

            <Button type="submit" variant="primary" className="w-full py-4">
               KONUYU YAYINLA
            </Button>
         </form>
      </div>
    </div>
  );

  return (
    <div className="pt-32 pb-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {view === 'list' && renderTopicList()}
      {view === 'detail' && renderDetail()}
      {view === 'create' && renderCreate()}
    </div>
  );
};