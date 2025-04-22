export interface Document {
  id: string;
  name: string;
  type: 'file' | 'url' | 'text';
  url?: string;
  metadata: {
    created_at_unix_secs: number;
    last_updated_at_unix_secs: number;
    size_bytes: number;
  };
  prompt_injectable: boolean;
  access_info: {
    is_creator: boolean;
    creator_name: string;
    creator_email: string;
    role: string;
  };
  dependent_agents: Array<{
    id: string;
    name: string;
    type: string;
    created_at_unix_secs: number;
    access_level: string;
  }>;
}

export interface DocumentsResponse {
  documents: Document[];
  next_cursor: string;
  has_more: boolean;
}

export interface Agent {
  agent_id: string;
  name: string;
  created_at_unix_secs: number;
  access_info: {
    is_creator: boolean;
    creator_name: string;
    creator_email: string;
    role: string;
  };
}

export interface AgentsResponse {
  agents: Agent[];
  next_cursor: string | null;
  has_more: boolean;
}