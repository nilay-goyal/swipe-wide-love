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
    if (!matchId || !user) {
      console.log('fetchMessages: Missing matchId or user', { matchId, userId: user?.id });
      return;
    }

    console.log('fetchMessages: Fetching messages for match', matchId);
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
        console.log('fetchMessages: Successfully fetched messages', data?.length || 0);
        setMessages(data || []);
      }
    } catch (error) {
      console.error('Error in fetchMessages:', error);
    }
    setLoading(false);
  };

  // Send a new message
  const sendMessage = async (content: string) => {
    if (!matchId || !user || !content.trim()) {
      console.log('sendMessage: Missing required data', { matchId, userId: user?.id, content });
      return;
    }

    console.log('sendMessage: Sending message', { matchId, content });
    
    // Create optimistic message
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}-${Math.random()}`, // Temporary ID
      match_id: matchId,
      sender_id: user.id,
      content: content.trim(),
      created_at: new Date().toISOString()
    };

    // Optimistically add to UI immediately
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          match_id: matchId,
          sender_id: user.id,
          content: content.trim()
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        // Remove optimistic message on error
        setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      } else {
        console.log('sendMessage: Message sent successfully', data);
        // Replace optimistic message with real one
        setMessages(prev => prev.map(msg => 
          msg.id === optimisticMessage.id ? data : msg
        ));
        
        // Fallback: Refetch messages after a short delay to ensure sync
        setTimeout(() => {
          fetchMessages();
        }, 1000);
      }
    } catch (error) {
      console.error('Error in sendMessage:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
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
    if (!matchId) {
      console.log('useMessaging: No matchId provided');
      return;
    }

    console.log('useMessaging: Setting up real-time subscription for match', matchId);

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
          console.log('New message received via realtime:', payload);
          const newMessage = payload.new as Message;
          
          // Only add if it's not from the current user (to avoid duplicates)
          if (newMessage.sender_id !== user?.id) {
            setMessages(prev => {
              // Check if message already exists (to avoid duplicates)
              const exists = prev.some(msg => msg.id === newMessage.id);
              if (!exists) {
                return [...prev, newMessage];
              }
              return prev;
            });
          }
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
  }, [matchId, user?.id]);

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
