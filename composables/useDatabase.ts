import { ref } from 'vue';
import type { Document, DocumentsResponse, Agent, AgentsResponse } from '~/types/database';

export function useDatabase() {
  const documents = ref<Document[]>([]);
  const agents = ref<Agent[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchAgents = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/convai/agents', {
        headers: {
          'xi-api-key': useRuntimeConfig().public.ELEVENLABS_API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch agents');
      }

      const data: AgentsResponse = await response.json();
      agents.value = data.agents;
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
    }
    finally {
      loading.value = false;
    }
  };

  const fetchDocuments = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/convai/knowledge-base', {
        headers: {
          'xi-api-key': useRuntimeConfig().public.ELEVENLABS_API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      const data: DocumentsResponse = await response.json();
      documents.value = data.documents;
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
    }
    finally {
      loading.value = false;
    }
  };

  const getDocumentContent = async (documentId: string) => {
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/convai/knowledge-base/${documentId}/content`, {
        headers: {
          'xi-api-key': useRuntimeConfig().public.ELEVENLABS_API_KEY,
          'Accept': 'text/plain', // Request plain text instead of JSON
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch document content');
      }

      // Get the response as text instead of trying to parse as JSON
      const content = await response.text();
      return content;
    }
    catch (e) {
      throw new Error(e instanceof Error ? e.message : 'Failed to fetch document content');
    }
  };

  const deleteDocument = async (documentId: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/convai/knowledge-base/${documentId}`, {
        method: 'DELETE',
        headers: {
          'xi-api-key': useRuntimeConfig().public.ELEVENLABS_API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      documents.value = documents.value.filter(doc => doc.id !== documentId);
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
    }
    finally {
      loading.value = false;
    }
  };

  const addUrlDocument = async (url: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/convai/knowledge-base/url', {
        method: 'POST',
        headers: {
          'xi-api-key': useRuntimeConfig().public.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Failed to add URL document');
      }

      await fetchDocuments();
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
    }
    finally {
      loading.value = false;
    }
  };

  const addTextDocument = async (text: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/convai/knowledge-base/text', {
        method: 'POST',
        headers: {
          'xi-api-key': useRuntimeConfig().public.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to add text document');
      }

      await fetchDocuments();
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
    }
    finally {
      loading.value = false;
    }
  };

  const addFileDocument = async (file: File) => {
    loading.value = true;
    error.value = null;
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('https://api.elevenlabs.io/v1/convai/knowledge-base/file', {
        method: 'POST',
        headers: {
          'xi-api-key': useRuntimeConfig().public.ELEVENLABS_API_KEY,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to add file document');
      }

      await fetchDocuments();
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
    }
    finally {
      loading.value = false;
    }
  };

  const updateAgentKnowledgeBase = async (agentId: string, documentIds: string[]) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
        method: 'PUT',
        headers: {
          'xi-api-key': useRuntimeConfig().public.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_config: {
            agent: {
              prompt: {
                knowledge_base: documentIds,
              },
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update agent knowledge base');
      }

      await fetchDocuments();
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
    }
    finally {
      loading.value = false;
    }
  };

  return {
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
    getDocumentContent,
  };
}
