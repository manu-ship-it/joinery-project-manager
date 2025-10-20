import OpenAI from 'openai'
import { supabase } from './supabase'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// In-memory session storage (in production, use Redis or database)
const sessionMemory = new Map<string, {
  context: any,
  conversationHistory: Array<{role: string, content: string}>,
  lastActivity: number
}>()

// Clean up old sessions (older than 30 minutes)
setInterval(() => {
  const now = Date.now()
  for (const [sessionId, session] of sessionMemory.entries()) {
    if (now - session.lastActivity > 30 * 60 * 1000) { // 30 minutes
      sessionMemory.delete(sessionId)
    }
  }
}, 5 * 60 * 1000) // Clean up every 5 minutes

export interface VoiceCommand {
  action: 'create_project' | 'get_project' | 'add_task' | 'update_material' | 'get_status' | 'list_projects' | 'unknown'
  parameters: Record<string, any>
  response: string
}

export async function processVoiceCommand(speech: string, callSid?: string): Promise<string> {
  try {
    console.log('Processing speech:', speech)
    
    // Get or create session
    const sessionId = callSid || 'default'
    let session = sessionMemory.get(sessionId)
    
    if (!session) {
      session = {
        context: {},
        conversationHistory: [],
        lastActivity: Date.now()
      }
      sessionMemory.set(sessionId, session)
    }
    
    // Update last activity
    session.lastActivity = Date.now()
    
    // Add current speech to conversation history
    session.conversationHistory.push({ role: 'user', content: speech })
    
    // Keep only last 10 messages to avoid token limits
    if (session.conversationHistory.length > 10) {
      session.conversationHistory = session.conversationHistory.slice(-10)
    }
    
    // Build conversation context for AI
    const messages = [
      {
        role: 'system',
        content: `You are a voice assistant for a custom joinery business project manager. 
        
        You can help with:
        - Creating new projects
        - Getting project information
        - Adding tasks to projects
        - Updating material order status
        - Getting project status
        - Listing projects
        
        IMPORTANT: You have conversation memory. You can reference previous parts of the conversation.
        Current context: ${JSON.stringify(session.context)}
        
        CONTEXT RULES:
        - ALWAYS extract and store client names, project names, and project numbers in updateContext
        - If user says "ABC Construction" - store {client: "ABC Construction"} in updateContext
        - If user says "Kitchen Renovation" - store {project_name: "Kitchen Renovation"} in updateContext
        - If user says "project 2024-001" - store {project_number: "2024-001"} in updateContext
        - ALWAYS use context to fill missing parameters
        - If user says "add a task" and context has project info, use that project
        - If user says "what's the status" and context has project info, use that project
        
        Respond with a JSON object containing:
        {
          "action": "create_project" | "get_project" | "add_task" | "update_material" | "get_status" | "list_projects" | "unknown",
          "parameters": { relevant data - USE CONTEXT TO FILL MISSING INFO },
          "response": "What to say back to the user",
          "updateContext": { 
            "client": "extract client name if mentioned",
            "project_name": "extract project name if mentioned", 
            "project_number": "extract project number if mentioned"
          }
        }
        
        EXAMPLES:
        - User says "ABC Construction" → updateContext: {"client": "ABC Construction"}
        - User says "Kitchen Renovation" → updateContext: {"project_name": "Kitchen Renovation"}
        - User says "project 2024-001" → updateContext: {"project_number": "2024-001"}
        
        Be helpful and conversational. If you need clarification, ask for it.
        You can reference previous information from the conversation.`
      },
      ...session.conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))
    ]
    
    // Use GPT-4 to understand the command with conversation context
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
      temperature: 0.7
    })
    
    const aiResponse = completion.choices[0]?.message?.content
    if (!aiResponse) {
      return 'Sorry, I had trouble understanding that. Could you please repeat?'
    }
    
    try {
      const command: VoiceCommand & { updateContext?: any } = JSON.parse(aiResponse)
      console.log('=== VOICE ASSISTANT DEBUG ===')
      console.log('Original speech:', speech)
      console.log('AI response:', aiResponse)
      console.log('Parsed command:', command)
      console.log('Session context BEFORE update:', session.context)
      
    // Update session context if provided
    if (command.updateContext) {
      session.context = { ...session.context, ...command.updateContext }
      console.log('Updated session context:', session.context)
    } else {
      console.log('No context update provided by AI')
    }
    
    console.log('Final session context:', session.context)
    console.log('Command parameters:', command.parameters)
    console.log('=== END DEBUG ===')
      
      // Execute the command
      const result = await executeCommand(command, session.context)
      
      // Add AI response to conversation history
      session.conversationHistory.push({ role: 'assistant', content: result })
      
      return result
      
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      return aiResponse // Return the raw response if JSON parsing fails
    }
    
  } catch (error) {
    console.error('Error processing voice command:', error)
    return 'Sorry, I encountered an error processing your request. Please try again.'
  }
}

async function executeCommand(command: VoiceCommand, context: any): Promise<string> {
  try {
    // Merge context with command parameters
    const mergedParams = { ...context, ...command.parameters }
    
    switch (command.action) {
      case 'create_project':
        return await createProject(mergedParams)
      
      case 'get_project':
        return await getProject(mergedParams)
      
      case 'add_task':
        return await addTask(mergedParams)
      
      case 'update_material':
        return await updateMaterial(mergedParams)
      
      case 'get_status':
        return await getStatus(mergedParams)
      
      case 'list_projects':
        return await listProjects(mergedParams)
      
      default:
        return command.response || 'I understand you want help, but I need more specific information. What would you like me to do?'
    }
  } catch (error) {
    console.error('Error executing command:', error)
    return 'Sorry, I had trouble completing that action. Please try again.'
  }
}

async function createProject(params: any): Promise<string> {
  try {
    const { client, project_name, project_address, budget } = params
    
    console.log('createProject called with params:', params)
    
    if (!client) {
      return 'I need the client name to create a new project. Could you provide the client name?'
    }
    
    if (!project_name) {
      return 'I need the project name to create a new project. Could you provide the project name?'
    }
    
    // Generate project number
    const projectNumber = `2024-${Date.now().toString().slice(-3)}`
    
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        project_number: projectNumber,
        client: client,
        project_name: project_name,
        project_address: project_address || '',
        project_status: 'planning',
        overall_project_budget: budget || 0,
        priority_level: 'medium',
        date_created: new Date().toISOString().split('T')[0]
      }])
      .select()
      .single()
    
    if (error) throw error
    
    return `Great! I've created a new project for ${client} called "${project_name}" with project number ${projectNumber}. The project is now in planning status.`
    
  } catch (error) {
    console.error('Error creating project:', error)
    return 'Sorry, I had trouble creating the project. Please try again.'
  }
}

async function getProject(params: any): Promise<string> {
  try {
    const { project_number, project_name } = params
    
    let query = supabase.from('projects').select('*')
    
    if (project_number) {
      query = query.eq('project_number', project_number)
    } else if (project_name) {
      query = query.ilike('project_name', `%${project_name}%`)
    } else {
      return 'I need either a project number or project name to look up the project.'
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    if (!data || data.length === 0) {
      return 'I couldn\'t find that project. Could you check the project number or name?'
    }
    
    const project = data[0]
    return `I found project ${project.project_number} for ${project.client}. It's called "${project.project_name}" and is currently ${project.project_status.replace('_', ' ')}. The budget is $${project.overall_project_budget} and it has a ${project.priority_level} priority.`
    
  } catch (error) {
    console.error('Error getting project:', error)
    return 'Sorry, I had trouble finding that project. Please try again.'
  }
}

async function addTask(params: any): Promise<string> {
  try {
    const { project_number, task_description, project_name, client } = params
    
    if (!task_description) {
      return 'I need the task description to add a task.'
    }
    
    let projectId: string | null = null
    let foundProject: any = null
    
    // Try to find project by number, name, or client
    if (project_number) {
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id, project_name, client')
        .eq('project_number', project_number)
        .single()
      
      if (!projectError && project) {
        projectId = project.id
        foundProject = project
      }
    } else if (project_name) {
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id, project_name, client')
        .ilike('project_name', `%${project_name}%`)
        .single()
      
      if (!projectError && project) {
        projectId = project.id
        foundProject = project
      }
    } else if (client) {
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id, project_name, client')
        .ilike('client', `%${client}%`)
        .single()
      
      if (!projectError && project) {
        projectId = project.id
        foundProject = project
      }
    }
    
    if (!projectId) {
      return 'I need to know which project to add this task to. Could you provide the project number, name, or client?'
    }
    
    // Add the task
    const { error } = await supabase
      .from('project_tasks')
      .insert([{
        project_id: projectId,
        task_description: task_description,
        is_completed: false
      }])
    
    if (error) throw error
    
    return `Perfect! I've added the task "${task_description}" to ${foundProject?.project_name || 'the project'}.`
    
  } catch (error) {
    console.error('Error adding task:', error)
    return 'Sorry, I had trouble adding that task. Please try again.'
  }
}

async function updateMaterial(params: any): Promise<string> {
  try {
    const { material_name, order_status, order_number, project_number } = params
    
    if (!material_name) {
      return 'I need the material name to update its status.'
    }
    
    const updateData: any = {}
    if (order_status !== undefined) {
      updateData.is_ordered = order_status === 'ordered' || order_status === true
    }
    if (order_number) {
      updateData.order_number = order_number
    }
    
    let query = supabase.from('materials').update(updateData)
    
    // If project context is available, filter by project
    if (project_number) {
      const { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('project_number', project_number)
        .single()
      
      if (project) {
        query = query.eq('project_id', project.id)
      }
    }
    
    query = query.ilike('material_name', `%${material_name}%`)
    
    const { error } = await query
    
    if (error) throw error
    
    return `I've updated the order status for ${material_name}. ${order_status === 'ordered' ? 'The material is now marked as ordered.' : 'The material order status has been updated.'}`
    
  } catch (error) {
    console.error('Error updating material:', error)
    return 'Sorry, I had trouble updating that material. Please try again.'
  }
}

async function getStatus(params: any): Promise<string> {
  try {
    const { project_number, project_name, client } = params
    
    let query = supabase.from('projects').select('*')
    
    if (project_number) {
      query = query.eq('project_number', project_number)
    } else if (project_name) {
      query = query.ilike('project_name', `%${project_name}%`)
    } else if (client) {
      query = query.ilike('client', `%${client}%`)
    } else {
      return 'I need the project number, name, or client to check the status.'
    }
    
    const { data, error } = await query.single()
    
    if (error || !data) {
      return 'I couldn\'t find that project. Please check the project number, name, or client.'
    }
    
    return `Project ${data.project_number} is currently ${data.project_status.replace('_', ' ')}. The client is ${data.client} and the project is "${data.project_name}". The budget is $${data.overall_project_budget} and it has a ${data.priority_level} priority.`
    
  } catch (error) {
    console.error('Error getting status:', error)
    return 'Sorry, I had trouble getting the project status. Please try again.'
  }
}

async function listProjects(params: any): Promise<string> {
  try {
    const { status, limit = 5 } = params
    
    let query = supabase.from('projects').select('*').order('created_at', { ascending: false })
    
    if (status) {
      query = query.eq('project_status', status)
    }
    
    const { data, error } = await query.limit(limit)
    
    if (error) throw error
    
    if (!data || data.length === 0) {
      return 'I don\'t see any projects in the system.'
    }
    
    let response = `Here are your ${data.length} most recent projects: `
    data.forEach((project, index) => {
      response += `${index + 1}. Project ${project.project_number} for ${project.client} - "${project.project_name}" (${project.project_status.replace('_', ' ')})`
      if (index < data.length - 1) response += '. '
    })
    
    return response
    
  } catch (error) {
    console.error('Error listing projects:', error)
    return 'Sorry, I had trouble getting the project list. Please try again.'
  }
}