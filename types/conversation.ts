export interface Conversation {
  agent_id: string;
  agent_name: string;
  conversation_id: string;
  start_time_unix_secs: number;
  call_duration_secs: number;
  message_count: number;
  status: 'done' | 'failed';
  call_successful: 'success' | 'failure' | 'unknown';
}

export interface ConversationDetails {
  agent_id: string;
  conversation_id: string;
  status: string;
  conversation_initiation_client_data: {
    dynamic_variables: {
      system__agent_id: string;
      system__call_duration_secs: string;
      system__call_sid: string;
      system__called_number: string;
      system__caller_id: string;
      system__conversation_id: string;
      system__time_utc: string;
    };
  };
  transcript: Array<{
    role: 'agent' | 'user';
    message: string;
    time_in_call_secs: number;
    llm_override?: string;
    tool_calls?: Array<{
      request_id: string;
      tool_name: string;
      params_as_json: string;
      tool_has_been_called: boolean;
    }>;
    tool_results?: Array<{
      request_id: string;
      tool_name: string;
      result_value: string;
      is_error: boolean;
    }>;
  }>;
  metadata: {
    start_time_unix_secs: number;
    call_duration_secs: number;
    cost: number;
    client_name?: string;
    client_email?: string;
    client_phone?: string;
    client_location?: string;
    call_direction?: 'inbound' | 'outbound';
    caller_number?: string;
    receiver_number?: string;
    call_sid?: string;
    summary?: string;
    termination_reason?: string;
  };
  analysis?: {
    call_successful: 'success' | 'failure' | 'unknown';
    transcript_summary: string;
    data_collection_results: Record<string, {
      data_collection_id: string;
      rationale: string;
      value: string;
    }>;
  };
  audio_url?: string;
}

export interface ConversationsResponse {
  conversations: Conversation[];
  next_cursor: string;
  has_more: boolean;
}
