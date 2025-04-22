<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">{{ $t('database.title') }}</h1>
      <div class="flex space-x-4">
        <button 
          class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
          @click="showAddModal = true"
        >
          Add Document
        </button>
        <button 
          class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
          @click="fetchDocuments"
          :disabled="loading"
        >
          {{ loading ? 'Loading...' : 'Refresh' }}
        </button>
      </div>
    </div>

    <div v-if="error" class="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
      {{ error }}
    </div>

    <!-- Documents List -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div class="p-6">
        <div class="grid gap-4">
          <div v-for="doc in documents" :key="doc.id" 
               class="border dark:border-gray-700 rounded-lg p-4">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ doc.name }}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Type: {{ doc.type }}
                  <span v-if="doc.url" class="ml-2">URL: {{ doc.url }}</span>
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Created: {{ new Date(doc.metadata.created_at_unix_secs * 1000).toLocaleString() }}
                </p>
              </div>
              <div class="flex space-x-2">
                <button 
                  class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  @click="handleViewContent(doc)"
                >
                  View
                </button>
                <button 
                  class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  @click="handleAssignClick(doc)"
                >
                  Assign
                </button>
                <button 
                  class="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  @click="deleteDocument(doc.id)"
                >
                  Delete
                </button>
              </div>
            </div>
            <div v-if="doc.dependent_agents.length > 0" class="mt-2">
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Dependent Agents:</p>
              <div class="flex flex-wrap gap-2 mt-1">
                <div 
                  v-for="agent in doc.dependent_agents" 
                  :key="agent.id"
                  class="flex items-center px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs"
                >
                  <span>{{ agent.name }}</span>
                  <button 
                    class="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                    @click="removeDocumentFromAgent(agent.id, doc.id)"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Document Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">Add Document</h2>
          <button @click="showAddModal = false" class="text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Document Type
            </label>
            <select 
              v-model="addDocumentType"
              class="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-700"
            >
              <option value="url">URL</option>
              <option value="text">Text</option>
              <option value="file">File</option>
            </select>
          </div>

          <div v-if="addDocumentType === 'url'">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL
            </label>
            <input 
              v-model="urlInput"
              type="url" 
              class="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-700"
              placeholder="https://example.com"
            >
          </div>

          <div v-if="addDocumentType === 'text'">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Text Content
            </label>
            <textarea 
              v-model="textInput"
              rows="4"
              class="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-700"
              placeholder="Enter your text here..."
            ></textarea>
          </div>

          <div v-if="addDocumentType === 'file'">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              File
            </label>
            <input 
              type="file" 
              @change="handleFileChange"
              class="w-full"
              accept=".txt,.pdf"
            >
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button 
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
              @click="showAddModal = false"
            >
              Cancel
            </button>
            <button 
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              @click="handleAddDocument"
              :disabled="loading"
            >
              {{ loading ? 'Adding...' : 'Add Document' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Assign Document Modal -->
    <div v-if="showAssignModal && selectedDocument" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">Assign Document</h2>
          <button @click="closeAssignModal" class="text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Agent
            </label>
            <select
              v-model="selectedAgentId"
              class="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-700"
            >
              <option value="">Select an agent...</option>
              <option v-for="agent in agents" :key="agent.agent_id" :value="agent.agent_id">
                {{ agent.name }}
              </option>
            </select>
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button 
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
              @click="closeAssignModal"
            >
              Cancel
            </button>
            <button 
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              @click="handleAssignDocument"
              :disabled="loading || !selectedAgentId"
            >
              {{ loading ? 'Assigning...' : 'Assign' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Document Content Modal -->
    <div v-if="showContentModal && selectedDocument" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">{{ selectedDocument.name }}</h2>
          <button @click="closeContentModal" class="text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-4">
          <div v-if="documentContent" class="mt-4">
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre class="whitespace-pre-wrap font-mono text-sm">{{ documentContent }}</pre>
            </div>
          </div>
          <div v-else-if="documentLoading" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
          </div>
          <div v-else class="text-center py-8 text-gray-500">
            No content available
          </div>

          <div class="flex justify-end mt-6">
            <button 
              class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              @click="closeContentModal"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Document } from '~/types/database';
import { useDatabase } from '~/composables/useDatabase';

const { 
  documents, 
  agents,
  loading, 
  error, 
  fetchDocuments,
  fetchAgents,
  deleteDocument,
  addUrlDocument,
  addTextDocument,
  addFileDocument,
  updateAgentKnowledgeBase,
  getDocumentContent
} = useDatabase();

const showAddModal = ref(false);
const showAssignModal = ref(false);
const showContentModal = ref(false);
const selectedDocument = ref<Document | null>(null);
const selectedAgentId = ref('');
const addDocumentType = ref<'url' | 'text' | 'file'>('url');
const urlInput = ref('');
const textInput = ref('');
const selectedFile = ref<File | null>(null);
const documentContent = ref<string | null>(null);
const documentLoading = ref(false);

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    selectedFile.value = input.files[0];
  }
};

const handleAddDocument = async () => {
  try {
    if (addDocumentType.value === 'url' && urlInput.value) {
      await addUrlDocument(urlInput.value);
    } else if (addDocumentType.value === 'text' && textInput.value) {
      await addTextDocument(textInput.value);
    } else if (addDocumentType.value === 'file' && selectedFile.value) {
      await addFileDocument(selectedFile.value);
    }
    showAddModal.value = false;
    urlInput.value = '';
    textInput.value = '';
    selectedFile.value = null;
  } catch (e) {
    console.error('Error adding document:', e);
  }
};

const handleAssignClick = async (doc: Document) => {
  selectedDocument.value = doc;
  await fetchAgents();
  showAssignModal.value = true;
};

const closeAssignModal = () => {
  showAssignModal.value = false;
  selectedDocument.value = null;
  selectedAgentId.value = '';
};

const handleAssignDocument = async () => {
  if (!selectedDocument.value || !selectedAgentId.value) return;

  try {
    const documentIds = [selectedDocument.value.id];
    await updateAgentKnowledgeBase(selectedAgentId.value, documentIds);
    closeAssignModal();
  } catch (e) {
    console.error('Error assigning document:', e);
  }
};

const handleViewContent = async (doc: Document) => {
  selectedDocument.value = doc;
  showContentModal.value = true;
  documentContent.value = null;
  documentLoading.value = true;

  try {
    const content = await getDocumentContent(doc.id);
    documentContent.value = content;
  } catch (e) {
    console.error('Error fetching document content:', e);
    error.value = e instanceof Error ? e.message : 'Failed to fetch document content';
  } finally {
    documentLoading.value = false;
  }
};

const closeContentModal = () => {
  showContentModal.value = false;
  selectedDocument.value = null;
  documentContent.value = null;
};

const removeDocumentFromAgent = async (agentId: string, documentId: string) => {
  try {
    const agent = documents.value
      .find(doc => doc.id === documentId)
      ?.dependent_agents
      .find(agent => agent.id === agentId);

    if (!agent) return;

    const currentDocuments = documents.value
      .filter(doc => doc.dependent_agents.some(a => a.id === agentId))
      .map(doc => doc.id)
      .filter(id => id !== documentId);

    await updateAgentKnowledgeBase(agentId, currentDocuments);
  } catch (e) {
    console.error('Error removing document from agent:', e);
  }
};

// Fetch documents on mount
onMounted(() => {
  fetchDocuments();
});
</script>
```