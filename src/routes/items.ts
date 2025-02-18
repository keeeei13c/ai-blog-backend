import { Hono } from 'hono'
import { Bindings } from '../types/bindings'
import { itemsController } from '../controllers/items'

const items = new Hono<{ Bindings: Bindings }>()

items.get('/', itemsController.getAll)
items.post('/', itemsController.create)
items.get('/:id', itemsController.getOne)
items.put('/:id', itemsController.update)
items.delete('/:id', itemsController.delete)

export default items
