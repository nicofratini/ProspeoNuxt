<template>
  <div
    v-if="conversation"
    class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
  >
    <!-- Résumé de la conversation -->
    <div
      v-if="conversation.analysis?.transcript_summary"
      class="mb-8 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-xl p-6 border border-primary-100 dark:border-primary-800"
    >
      <h3 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
        <span class="mr-2">📝</span>
        Résumé de la conversation
      </h3>
      <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
        {{ conversation.analysis.transcript_summary }}
      </p>
      <div
        v-if="conversation.analysis.call_successful"
        class="mt-4 flex items-center"
      >
        <span class="text-sm font-medium mr-2">Statut de l'appel :</span>
        <span
          :class="[
            'px-3 py-1 rounded-full text-sm',
            conversation.analysis.call_successful === 'success'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : conversation.analysis.call_successful === 'failure'
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
          ]"
        >
          {{ translateCallStatus(conversation.analysis.call_successful) }}
        </span>
      </div>
    </div>

    <!-- En-tête -->
    <div class="flex justify-between items-start mb-8">
      <div>
        <h2 class="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
          Conversation avec {{ conversation.agent_id }}
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {{ formatDate(conversation.metadata?.start_time_unix_secs) }}
        </p>
      </div>
      <div class="flex items-center space-x-4">
        <button
          v-if="conversation.audio_url"
          class="flex items-center px-4 py-2 bg-primary-50 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 rounded-full hover:bg-primary-100 dark:hover:bg-primary-800/50 transition-all duration-200"
          @click="$emit('toggleAudio', conversation.audio_url)"
        >
          <span
            v-if="!isPlaying"
            class="flex items-center space-x-2"
          >
            <span>{{ formatDuration(conversation.metadata?.call_duration_secs || 0) }}</span>
            <span class="text-lg">▶️</span>
          </span>
          <span
            v-else
            class="text-lg"
          >⏸️</span>
        </button>
        <button
          class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          @click="$emit('close')"
        >
          <span class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-xl">✕</span>
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Colonne de gauche: Vue d'ensemble et Données -->
      <div class="lg:col-span-1 space-y-8">
        <!-- Vue d'ensemble -->
        <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
          <h3 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Vue d'ensemble
          </h3>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-gray-600 dark:text-gray-400">Statut</span>
              <span
                class="px-3 py-1 rounded-full text-sm"
                :class="getStatusClass(conversation.status || '')"
              >
                {{ translateStatus(conversation.status || '') }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600 dark:text-gray-400">Durée</span>
              <span class="text-gray-900 dark:text-white">
                {{ formatDuration(conversation.metadata?.call_duration_secs || 0) }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600 dark:text-gray-400">Coût</span>
              <span class="text-gray-900 dark:text-white">
                {{ conversation.metadata?.cost || 0 }} crédits
              </span>
            </div>
            <div
              v-if="conversation.metadata?.termination_reason"
              class="flex justify-between items-center"
            >
              <span class="text-gray-600 dark:text-gray-400">Raison de fin</span>
              <span class="text-gray-900 dark:text-white">
                {{ conversation.metadata.termination_reason }}
              </span>
            </div>
          </div>
        </div>

        <!-- Données de l'appel -->
        <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
          <h3 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
            <span class="mr-2">📞</span>
            Données de l'appel
          </h3>
          <div class="space-y-4">
            <div
              v-if="conversation.metadata?.call_direction"
              class="flex justify-between items-center"
            >
              <span class="text-gray-600 dark:text-gray-400">Direction</span>
              <span class="text-gray-900 dark:text-white">
                {{ translateDirection(conversation.metadata.call_direction) }}
              </span>
            </div>
            <div
              v-if="conversation?.conversation_initiation_client_data?.dynamic_variables?.system__caller_id"
              class="flex justify-between items-center"
            >
              <span class="text-gray-600 dark:text-gray-400">Numéro appelant</span>
              <span class="text-gray-900 dark:text-white">
                {{ conversation?.conversation_initiation_client_data?.dynamic_variables?.system__caller_id }}
              </span>
            </div>
            <div
              v-if="conversation?.conversation_initiation_client_data?.dynamic_variables?.system__called_number"
              class="flex justify-between items-center"
            >
              <span class="text-gray-600 dark:text-gray-400">Numéro appelé</span>
              <span class="text-gray-900 dark:text-white">
                {{ conversation?.conversation_initiation_client_data?.dynamic_variables?.system__called_number }}
              </span>
            </div>
            <div
              v-if="conversation?.conversation_initiation_client_data?.dynamic_variables?.system__call_sid"
              class="flex justify-between items-center"
            >
              <span class="text-gray-600 dark:text-gray-400">ID Twilio</span>
              <span
                class="text-gray-900 dark:text-white w-1/2 overflow-ellipsis overflow-hidden"
                :title="conversation?.conversation_initiation_client_data?.dynamic_variables?.system__call_sid"
              >
                {{ conversation?.conversation_initiation_client_data?.dynamic_variables?.system__call_sid }}
              </span>
            </div>
          </div>
        </div>

        <!-- Données Client -->
        <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
          <h3 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
            <span class="mr-2">👤</span>
            Données Client
          </h3>
          <div class="space-y-4">
            <div
              v-if="extractedClientData.first_name || extractedClientData.last_name"
              class="flex items-center space-x-3"
            >
              <span class="text-gray-600 dark:text-gray-400">
                <span class="w-5 h-5 inline-block">🗣️</span>
              </span>
              <span class="text-gray-900 dark:text-white">{{
                `${extractedClientData.first_name} ${extractedClientData.last_name}`.trim()
              }}</span>
            </div>
            <div
              v-if="extractedClientData.email"
              class="flex items-center space-x-3"
            >
              <span class="text-gray-600 dark:text-gray-400">
                <span class="w-5 h-5 inline-block">✉️</span>
              </span>
              <span class="text-gray-900 dark:text-white">{{
                extractedClientData.email
              }}</span>
            </div>
            <div
              v-if="extractedClientData.phone && extractedClientData.phone !== 'None' "
              class="flex items-center space-x-3"
            >
              <span class="text-gray-600 dark:text-gray-400">
                <span class="w-5 h-5 inline-block">📱</span>
              </span>
              <span class="text-gray-900 dark:text-white">{{
                extractedClientData.phone
              }}</span>
            </div>
            <div
              v-if="extractedClientData.city && extractedClientData.city !== 'None'"
              class="flex items-center space-x-3"
            >
              <span class="text-gray-600 dark:text-gray-400">
                <span class="w-5 h-5 inline-block">📍</span>
              </span>
              <span class="text-gray-900 dark:text-white">{{
                extractedClientData.city
              }}</span>
            </div>
            <div
              v-if="extractedClientData.budget && extractedClientData.budget !== 'None'"
              class="flex items-center space-x-3"
            >
              <span class="text-gray-600 dark:text-gray-400">
                <span class="w-5 h-5 inline-block">💲</span>
              </span>
              <span class="text-gray-900 dark:text-white">{{
                extractedClientData.budget
              }}</span>
            </div>
            <div
              v-if="extractedClientData.bedrooms && extractedClientData.bedrooms !== 'None'"
              class="flex items-center space-x-3"
            >
              <span class="text-gray-600 dark:text-gray-400">
                <span class="w-5 h-5 inline-block">🛏️</span>
              </span>
              <span class="text-gray-900 dark:text-white">{{
                extractedClientData.bedrooms
              }} Bedrooms</span>
            </div>
            <div
              v-if="!hasExtractedData"
              class="text-gray-500 dark:text-gray-400 text-center py-2"
            >
              Aucune donnée client disponible
            </div>
          </div>
        </div>
      </div>

      <!-- Colonne de droite: Transcription -->
      <div class="lg:col-span-2 space-y-8">
        <!-- Transcription -->
        <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
          <h3 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Transcription
          </h3>
          <div
            v-if="conversation.transcript && conversation.transcript.length > 0"
            class="space-y-4 flex flex-col"
          >
            <div
              v-for="(message, index) in conversation.transcript"
              :key="index"
              :class="[
                'p-4 rounded-xl transition-all duration-200 max-w-[80%]',
                message.role === 'agent'
                  ? 'self-start bg-primary-50 dark:bg-primary-900/30 ml-4'
                  : 'self-end bg-gray-100 dark:bg-gray-700/50 mr-4',
              ]"
            >
              <div class="flex justify-between items-center mb-2">
                <span class="font-medium text-gray-900 dark:text-white">
                  {{ message.role === 'agent' ? 'Agent' : 'Client' }}
                </span>
                <span class="text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDuration(message.time_in_call_secs || 0) }}
                </span>
              </div>
              <p class="text-gray-700 dark:text-gray-300">
                {{ message.message }}
              </p>

              <!-- LLM Override -->
              <div
                v-if="message.llm_override"
                class="mt-2 text-sm text-gray-500 dark:text-gray-400 italic"
              >
                Remplacement : {{ message.llm_override }}
              </div>

              <!-- Tool Calls -->
              <div
                v-if="message.tool_calls?.length"
                class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600"
              >
                <div
                  v-for="tool in message.tool_calls"
                  :key="tool.request_id"
                  class="text-sm text-gray-600 dark:text-gray-400"
                >
                  <p class="font-medium text-primary-600 dark:text-primary-400">
                    Outil : {{ tool.tool_name }}
                  </p>
                  <pre class="mt-1 text-xs bg-white dark:bg-gray-800 p-2 rounded-lg overflow-x-auto">
                      {{ tool.params_as_json }}
                    </pre>
                </div>
              </div>

              <!-- Tool Results -->
              <div
                v-if="message.tool_results?.length"
                class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600"
              >
                <div
                  v-for="result in message.tool_results"
                  :key="result.request_id"
                  class="text-sm text-gray-600 dark:text-gray-400"
                >
                  <p class="font-medium text-primary-600 dark:text-primary-400">
                    Résultat : {{ result.tool_name }}
                  </p>
                  <pre
                    class="mt-1 text-xs bg-white dark:bg-gray-800 p-2 rounded-lg overflow-x-auto"
                    :class="{ 'text-red-500': result.is_error }"
                  >
                      {{ result.result_value }}
                    </pre>
                </div>
              </div>
            </div>
          </div>
          <div
            v-else
            class="text-gray-500 dark:text-gray-400 text-center py-4"
          >
            Aucune transcription disponible
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ConversationDetails } from '~/types/conversation';

const props = defineProps<{
  conversation: ConversationDetails | null;
  isPlaying: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'toggleAudio', url: string): void;
}>();

// Extract client data from transcript
const extractedClientData = computed(() => {
  if (!props.conversation?.analysis?.data_collection_results) return {};

  const data: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    city?: string;
    budget?: string;
    bedrooms?: string;
  } = {};

  data.first_name = props.conversation.analysis.data_collection_results?.first_name?.value;
  data.last_name = props.conversation.analysis.data_collection_results?.last_name?.value;
  data.email = props.conversation.analysis.data_collection_results?.email?.value;
  data.phone = props.conversation.analysis.data_collection_results?.phone_number?.value;
  data.city = props.conversation.analysis.data_collection_results?.city?.value;
  data.budget = props.conversation.analysis.data_collection_results?.budget?.value;
  data.bedrooms = props.conversation.analysis.data_collection_results?.bedrooms?.value;

  return data;
});

const hasExtractedData = computed(() => {
  return !!(
    extractedClientData.value.first_name
    || extractedClientData.value.last_name
    || extractedClientData.value.email
    || extractedClientData.value.phone
    || extractedClientData.value.city
    || extractedClientData.value.budget
    || extractedClientData.value.bedrooms
  );
});

const translateStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'done': 'Terminé',
    'failed': 'Échoué',
    'in-progress': 'En cours',
    'processing': 'En traitement',
  };
  return statusMap[status] || status;
};

const translateCallStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    success: 'Réussi',
    failure: 'Échoué',
    unknown: 'Inconnu',
  };
  return statusMap[status] || status;
};

const translateDirection = (direction: string): string => {
  const directionMap: Record<string, string> = {
    inbound: 'Entrant',
    outbound: 'Sortant',
  };
  return directionMap[direction] || direction;
};

const getStatusClass = (status: string) => {
  switch (status) {
    case 'done':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'failed':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'in-progress':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  });
};

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
</script>
