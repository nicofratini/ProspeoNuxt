import { ref } from 'vue';
import type { Conversation, ConversationDetails, ConversationsResponse } from '~/types/conversation';

export function useConversations() {
  const conversations = ref<Conversation[]>([]);
  const selectedConversation = ref<ConversationDetails | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const audioPlayer = ref<HTMLAudioElement | null>(null);
  const isPlaying = ref(false);
  const currentAudioUrl = ref<string | null>(null);

  const fetchConversations = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/convai/conversations', {
        headers: {
          'xi-api-key': useRuntimeConfig().public.ELEVENLABS_API_KEY
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data: ConversationsResponse = await response.json();
      conversations.value = data.conversations;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
    } finally {
      loading.value = false;
    }
  };

  const fetchConversationDetails = async (conversationId: string) => {
    loading.value = true;
    error.value = null;
    try {
      const [detailsResponse, audioResponse] = await Promise.all([
        fetch(`https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`, {
          headers: {
            'xi-api-key': useRuntimeConfig().public.ELEVENLABS_API_KEY
          }
        }),
        fetch(`https://api.elevenlabs.io/v1/convai/conversations/${conversationId}/audio`, {
          headers: {
            'xi-api-key': useRuntimeConfig().public.ELEVENLABS_API_KEY
          }
        })
      ]);
      
      if (!detailsResponse.ok) {
        throw new Error('Failed to fetch conversation details');
      }

      const data: ConversationDetails = await detailsResponse.json();
      
      // Add default values for new metadata fields if they don't exist
      data.metadata = {
        ...data.metadata,
        client_name: data.metadata.client_name || null,
        client_email: data.metadata.client_email || null,
        client_phone: data.metadata.client_phone || null,
        client_location: data.metadata.client_location || null,
        call_direction: data.metadata.call_direction || null,
        caller_number: data.metadata.caller_number || null,
        receiver_number: data.metadata.receiver_number || null,
        call_sid: data.metadata.call_sid || null,
        summary: data.metadata.summary || null
      };

      if (audioResponse.ok) {
        const audioBlob = await audioResponse.blob();
        data.audio_url = URL.createObjectURL(audioBlob);
      }

      selectedConversation.value = data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
    } finally {
      loading.value = false;
    }
  };

  const toggleAudio = (url: string) => {
    if (!audioPlayer.value) return;

    if (currentAudioUrl.value !== url) {
      // New audio file
      audioPlayer.value.src = url;
      currentAudioUrl.value = url;
      audioPlayer.value.play();
      isPlaying.value = true;
    } else {
      // Same audio file - toggle play/pause
      if (isPlaying.value) {
        audioPlayer.value.pause();
      } else {
        audioPlayer.value.play();
      }
      isPlaying.value = !isPlaying.value;
    }
  };

  const stopAudio = () => {
    if (audioPlayer.value) {
      audioPlayer.value.pause();
      audioPlayer.value.currentTime = 0;
      isPlaying.value = false;
      currentAudioUrl.value = null;
    }
  };

  // Store the event listener function to properly remove it later
  const handleAudioEnded = () => {
    isPlaying.value = false;
    currentAudioUrl.value = null;
  };

  onMounted(() => {
    audioPlayer.value = new Audio();
    audioPlayer.value.addEventListener('ended', handleAudioEnded);
  });

  onUnmounted(() => {
    if (selectedConversation.value?.audio_url) {
      URL.revokeObjectURL(selectedConversation.value.audio_url);
    }
    if (audioPlayer.value) {
      audioPlayer.value.removeEventListener('ended', handleAudioEnded);
      stopAudio();
    }
  });

  return {
    conversations,
    selectedConversation,
    loading,
    error,
    isPlaying,
    fetchConversations,
    fetchConversationDetails,
    toggleAudio,
    stopAudio
  };
}