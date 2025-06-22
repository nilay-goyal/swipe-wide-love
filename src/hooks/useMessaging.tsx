
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export const useMessaging = (matchId: string | null) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const channelRef = useRef<any>(null);

  // Fetch messages for a specific match
  const fetchMessages = async () => {
    if (!matchId || !user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        setMessages(data || []);
      }
    } catch (error) {
      console.error('Error in fetchMessages:', error);
    }
    setLoading(false);
  };

  // Send a new message
  const sendMessage = async (content: string) => {
    if (!matchId || !user || !content.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          match_id: matchId,
          sender_id: user.id,
          content: content.trim()
        });

      if (error) {
        console.error('Error sending message:', error);
      }
    } catch (error) {
      console.error('Error in sendMessage:', error);
    }
  };

  // Clean up subscription helper
  const cleanupSubscription = () => {
    if (channelRef.current) {
      console.log('Cleaning up messages channel');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  };

  // Listen for new messages in real-time
  useEffect(() => {
    if (!matchId) return;

    // Clean up existing subscription first
    cleanupSubscription();

    // Create new channel with unique name
    const channelName = `messages-${matchId}-${Date.now()}`;
    console.log('Creating messages channel:', channelName);
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`
        },
        (payload) => {
          console.log('New message received:', payload);
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe((status) => {
        console.log('Messages subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to messages channel');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn('Messages subscription error:', status);
        }
      });

    channelRef.current = channel;

    return cleanupSubscription;
  }, [matchId]);

  useEffect(() => {
    fetchMessages();
  }, [matchId]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanupSubscription;
  }, []);

  return {
    messages,
    loading,
    sendMessage
  };
};
