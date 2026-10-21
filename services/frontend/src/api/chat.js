import { apiFetch } from './client';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export async function getRoomMessagesApi(roomId) {
  return await apiFetch(`/chat/rooms/${roomId}/messages`);
}

export function createStompChatClient({ roomId, onMessageReceived, onConnect, onError }) {
  const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
  const socketUrl = `${protocol}//${window.location.host}/ws-chat`;

  const stompClient = new Client({
    webSocketFactory: () => new SockJS(socketUrl),
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: (frame) => {
      // 방 메시지 구독
      stompClient.subscribe(`/sub/chat/room/${roomId}`, (message) => {
        try {
          const body = JSON.parse(message.body);
          if (onMessageReceived) {
            onMessageReceived(body);
          }
        } catch (e) {
          console.error('Failed to parse STOMP message:', e);
        }
      });

      if (onConnect) {
        onConnect(frame);
      }
    },
    onStompError: (frame) => {
      console.error('STOMP Broker error:', frame.headers['message'], frame.body);
      if (onError) onError(frame);
    },
    onWebSocketClose: () => {
      // closed
    }
  });

  return stompClient;
}

export function publishChatMessage(stompClient, { roomId, senderId, senderRole = 'USER', messageType = 'TALK', content = '', payload = null }) {
  if (!stompClient || !stompClient.connected) {
    console.warn('STOMP client is not connected.');
    return;
  }

  stompClient.publish({
    destination: '/pub/chat/message',
    body: JSON.stringify({
      roomId,
      senderId,
      senderRole,
      messageType,
      content,
      payload: typeof payload === 'object' && payload !== null ? JSON.stringify(payload) : payload
    })
  });
}

export async function sendChatMessageApi(roomId, messageData) {
  return await apiFetch(`/chat/rooms/${roomId}/messages`, {
    method: 'POST',
    body: JSON.stringify(messageData)
  });
}

export async function broadcastRoomNoticeApi(region, title, content) {
  return await apiFetch('/chat/broadcast-notice', {
    method: 'POST',
    body: JSON.stringify({ region, title, content })
  });
}
