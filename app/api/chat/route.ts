import { NextRequest, NextResponse } from 'next/server'
import { LexRuntimeV2Client, RecognizeTextCommand } from "@aws-sdk/client-lex-runtime-v2"

const client = new LexRuntimeV2Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function POST(req: NextRequest) {
  const { messages } = await req.json()
  const userMessage = messages[messages.length - 1].content

  const params = {
    botId: process.env.AWS_LEX_BOT_ID,
    botAliasId: process.env.AWS_LEX_BOT_ALIAS_ID,
    localeId: 'en_US',
    sessionId: 'test-session',
    text: userMessage,
  }

  try {
    const command = new RecognizeTextCommand(params)
    const lexResponse = await client.send(command)

    let botMessage = lexResponse.messages?.[0]?.content || "I'm sorry, I didn't understand that."

    return NextResponse.json({ messages: [{ content: botMessage, role: 'assistant' }] })
  } catch (error) {
    console.error('Error communicating with Lex:', error)
    return NextResponse.json({ error: 'Failed to communicate with the chatbot' }, { status: 500 })
  }
}

