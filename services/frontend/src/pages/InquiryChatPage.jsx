import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getMyInquiriesApi, createInquiryApi } from '../api/cs';
import { useModal } from '../context/ModalContext';

export default function InquiryChatPage() {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const { showAlert } = useModal();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchInquiries = async () => {
    try {
      const data = await getMyInquiriesApi();
      setInquiries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to load inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [inquiries]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const text = inputText.trim();
    if (!text || sending) return;

    setSending(true);
    try {
      await createInquiryApi('1:1 문의', '고객 1:1 문의', text);
      setInputText('');
      await fetchInquiries();
    } catch (err) {
      showAlert('메시지 전송 실패: ' + err.message, '오류');
    } finally {
      setSending(false);
    }
  };

  // Convert inquiries and replies into chronological chat bubble items
  const chatItems = [];

  inquiries.forEach((inq) => {
    // 1. If it's an operator-initiated notice
    const isOperatorDirect = inq.category === '운영자 1:1 안내';

    if (isOperatorDirect) {
      chatItems.push({
        id: `inq-${inq.id}`,
        isMe: false,
        senderName: '우연한 식탁 운영팀',
        badge: '운영자',
        content: inq.content,
        time: inq.createdAt ? new Date(inq.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        timestamp: inq.createdAt ? new Date(inq.createdAt).getTime() : 0,
        type: 'ADMIN'
      });
    } else {
      // User question
      chatItems.push({
        id: `inq-${inq.id}`,
        isMe: true,
        senderName: currentUser?.nickname || '나',
        content: inq.content,
        time: inq.createdAt ? new Date(inq.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        timestamp: inq.createdAt ? new Date(inq.createdAt).getTime() : 0,
        type: 'USER',
        category: inq.category,
        status: inq.status
      });
    }

    // Replies from admin
    if (inq.replies && inq.replies.length > 0) {
      inq.replies.forEach((rep) => {
        chatItems.push({
          id: `rep-${rep.id}`,
          isMe: false,
          senderName: rep.operatorName || '운영팀',
          badge: 'CS 매니저',
          content: rep.replyContent,
          time: rep.createdAt ? new Date(rep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          timestamp: rep.createdAt ? new Date(rep.createdAt).getTime() : 0,
          type: 'REPLY'
        });
      });
    }
  });

  // Sort by timestamp
  chatItems.sort((a, b) => a.timestamp - b.timestamp);

  return (
    <div className="w-full bg-surface min-h-[calc(100vh-5rem)] flex justify-center py-space-xs sm:py-space-md">
      <div className="w-full max-w-[480px] bg-surface-container-lowest shadow-xl sm:rounded-2xl overflow-hidden flex flex-col relative border border-surface-container">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-surface-container-lowest/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-surface-container">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/chats')}
              className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
              title="채팅 목록으로"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-lg">support_agent</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-headline-sm text-sm font-bold text-on-surface">우연한 식탁 고객센터</h1>
                  <span className="px-1.5 py-0.2 rounded-full bg-secondary-fixed text-secondary text-[10px] font-bold">공식</span>
                </div>
                <p className="font-body-sm text-[11px] text-on-surface-variant">1:1 실시간 문의 및 운영자 안내</p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchInquiries}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface"
            title="새로고침"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
          </button>
        </header>

        {/* Notice Bar */}
        <div className="bg-primary/5 px-4 py-2 border-b border-primary/10 flex items-center gap-2 text-xs text-on-surface">
          <span className="material-symbols-outlined text-primary text-base shrink-0">info</span>
          <span className="text-[11px] text-on-surface-variant">
            평일 10:00~22:00 문의 시 10분 이내 답변을 받아보실 수 있습니다.
          </span>
        </div>

        {/* Chat Stream */}
        <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto bg-surface-bright min-h-[460px] max-h-[620px]">
          {/* Default Welcome System Bubble */}
          <div className="flex justify-center my-2">
            <div className="bg-surface-container rounded-2xl p-3 max-w-sm text-center shadow-xs flex flex-col items-center gap-1">
              <span className="text-xl">💬</span>
              <p className="text-xs font-bold text-primary">우연한 식탁 1:1 고객센터입니다</p>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                매칭 안내, 결제/환불, 건의사항 등 궁금하신 점을 남겨주시면 운영팀에서 친절히 안내해 드립니다.
              </p>
            </div>
          </div>

          {chatItems.map((item) => {
            if (item.isMe) {
              return (
                <div key={item.id} className="flex flex-col items-end self-end max-w-[80%]">
                  {item.category && item.category !== '1:1 문의' && (
                    <span className="text-[10px] text-primary font-bold mb-0.5">[{item.category}]</span>
                  )}
                  <div className="flex items-end gap-1.5 justify-end">
                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                      {item.status === 'WAITING' && (
                        <span className="text-[9px] text-tertiary font-semibold">답변 대기</span>
                      )}
                      {item.status === 'ANSWERED' && (
                        <span className="text-[9px] text-primary font-semibold">답변 완료</span>
                      )}
                      <span className="text-[10px] text-on-surface-variant">{item.time}</span>
                    </div>
                    <div className="bg-primary text-on-primary rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-xs font-medium shadow-xs leading-relaxed whitespace-pre-wrap">
                      {item.content}
                    </div>
                  </div>
                </div>
              );
            }

            // Operator or reply bubble
            return (
              <div key={item.id} className="flex items-start gap-2 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center shrink-0 font-bold text-xs shadow-xs">
                  <span className="material-symbols-outlined text-[16px]">support_agent</span>
                </div>
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs font-bold text-on-surface">{item.senderName}</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-secondary-fixed text-secondary text-[9px] font-bold">
                      {item.badge}
                    </span>
                  </div>
                  <div className="flex items-end gap-1.5">
                    <div className="bg-surface-container rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-on-surface text-xs shadow-xs leading-relaxed whitespace-pre-wrap border border-surface-container-high">
                      {item.content}
                    </div>
                    <span className="text-[10px] text-on-surface-variant shrink-0">{item.time}</span>
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input */}
        <form onSubmit={handleSendMessage} className="p-3 bg-surface-container-lowest border-t border-surface-container flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="문의하실 내용을 입력해주세요..."
            className="flex-1 h-11 px-4 rounded-full bg-surface-container-low text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            className="w-11 h-11 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md hover:bg-primary-container disabled:opacity-40 transition-all shrink-0"
            title="문의 전송"
          >
            <span className="material-symbols-outlined text-lg">send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
