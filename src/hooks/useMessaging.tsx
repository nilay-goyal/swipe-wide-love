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
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<any>(null);

  console.log('useMessaging hook initialized with matchId:', matchId, 'user:', user?.id);

  // Fetch messages for a specific match
  const fetchMessages = async () => {
    if (!matchId || !user) {
      console.log('Cannot fetch messages - missing matchId or user:', { matchId, userId: user?.id });
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching messages for match:', matchId);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        setError(error.message);
      } else {
        console.log('Successfully fetched messages:', data?.length || 0, 'messages');
        setMessages(data || []);
      }
    } catch (error) {
      console.error('Error in fetchMessages:', error);
      setError('Failed to fetch messages');
    }
    setLoading(false);
  };

  // Send a new message
  const sendMessage = async (content: string) => {
    if (!matchId || !user || !content.trim()) {
      console.log('Cannot send message - missing data:', { matchId, userId: user?.id, content: content.trim() });
      return;
    }

    try {
      console.log('Sending message:', { matchId, content: content.trim() });
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
        setError(error.message);
        throw error;
      } else {
        console.log('Message sent successfully:', data);
        // Don't add to local state here - let the real-time subscription handle it
      }
    } catch (error) {
      console.error('Error in sendMessage:', error);
      setError('Failed to send message');
      throw error;
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
    if (!matchId || !user) {
      console.log('Cannot set up subscription - missing matchId or user');
      return;
    }

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
          const newMessage = payload.new as Message;
          setMessages(prev => {
            // Check if message already exists to avoid duplicates
            const exists = prev.some(msg => msg.id === newMessage.id);
            if (exists) {
              console.log('Message already exists, not adding duplicate');
              return prev;
            }
            console.log('Adding new message to state');
            return [...prev, newMessage];
          });
        }
      )
      .subscribe((status) => {
        console.log('Messages subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to messages channel');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn('Messages subscription error:', status);
          setError('Connection error - messages may not update in real-time');
        }
      });

    channelRef.current = channel;

    return cleanupSubscription;
  }, [matchId, user]);

  useEffect(() => {
    fetchMessages();
  }, [matchId, user]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanupSubscription;
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage
  };
};
