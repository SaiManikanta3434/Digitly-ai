import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  let query = '';
  
  try {
    const { query: requestQuery, data } = await request.json();
    query = requestQuery;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      // Fallback to simulated response if no API key
      return NextResponse.json({
        entities: [],
        explanation: 'OpenAI API key not configured. Using simulated response.',
        confidence: 0.5
      });
    }

    // Prepare context for AI
    const dataSummary = {
      clients: data.clients?.length || 0,
      workers: data.workers?.length || 0,
      tasks: data.tasks?.length || 0,
      sampleData: {
        clients: data.clients?.slice(0, 3) || [],
        workers: data.workers?.slice(0, 3) || [],
        tasks: data.tasks?.slice(0, 3) || []
      }
    };

    const systemPrompt = `You are an AI assistant that helps users search and analyze data about clients, workers, and tasks. 

The data structure includes:
- Clients: ClientID, ClientName, ClientGroup, PriorityLevel, RequestedTaskIDs, PreferredPhases, MaxBudget, AttributesJSON
- Workers: WorkerID, WorkerName, WorkerGroup, Skills, AvailableSlots, MaxLoadPerPhase, HourlyRate, AttributesJSON  
- Tasks: TaskID, TaskName, Duration, RequiredSkills, PreferredPhases, PriorityLevel, Dependencies, MaxConcurrent, AttributesJSON

Current data summary: ${dataSummary.clients} clients, ${dataSummary.workers} workers, ${dataSummary.tasks} tasks.

Respond with a JSON object containing:
{
  "entities": [array of matching entities],
  "explanation": "human-readable explanation of what was found",
  "confidence": number between 0 and 1,
  "query": "interpreted query",
  "filters": "suggested filters to apply"
}

Be helpful and provide insights about the data. If no specific matches are found, suggest related searches.`;

    const userPrompt = `User query: "${query}"

Please analyze this query and provide a response based on the data structure described above.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Try to parse JSON response
    try {
      const parsedResponse = JSON.parse(response);
      return NextResponse.json(parsedResponse);
    } catch (parseError) {
      // If response is not valid JSON, return a structured response
      return NextResponse.json({
        entities: [],
        explanation: response,
        confidence: 0.7,
        query: query,
        filters: null
      });
    }

  } catch (error) {
    console.error('AI Search API Error:', error);
    
    // Fallback response
    return NextResponse.json({
      entities: [],
      explanation: 'Sorry, I encountered an error processing your query. Please try again.',
      confidence: 0,
      query: query,
      filters: null
    }, { status: 500 });
  }
} 