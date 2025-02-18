import { Hono } from 'hono'
import { Bindings } from '../types/bindings'
import { AIController } from '../controllers/openai'

const openai = new Hono<{ Bindings: Bindings }>()

openai.post('/generate', async (c) => {
  const controller = new AIController(c.env.OPENAI_API_KEY)
  return controller.generate(c)
})

export default openai