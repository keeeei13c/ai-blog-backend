import type { Context } from 'hono'
import type { Bindings } from '../types/bindings'
import type { Item } from '../types/items'
import { createResponse } from '../utils/response'

export const itemsController = {
  getAll: async (c: Context<{ Bindings: Bindings }>) => {
    try {
      const items = await c.env.DB.prepare(
        'SELECT * FROM items ORDER BY created_at DESC'
      ).all()

      return c.json(createResponse.success(items.results))
    } catch (error) {
      console.error('DB Error:', error)
      return c.json(createResponse.error('Failed to fetch items'), 500)
    }
  },

  getOne: async (c: Context<{ Bindings: Bindings }>) => {
    try {
      const item = await c.env.DB.prepare(
        'SELECT * FROM items WHERE id = ?'
      )
      .bind(c.req.param('id'))
      .first<Item>()

      if (!item) {
        return c.json(createResponse.error('Item not found'), 404)
      }

      return c.json(createResponse.success(item))
    }
    catch (error) {
      console.error('DB Error:', error)
      return c.json(createResponse.error('Failed to fetch item'), 500)
    }
  },

  create: async (c: Context<{ Bindings: Bindings }>) => {
    try {
      const body = await c.req.json<Item>()
      
      if (!body.name) {
        return c.json(createResponse.error('Name is required'), 400)
      }

      const id = crypto.randomUUID()

      await c.env.DB.prepare(
        'INSERT INTO items (id, name) VALUES (?, ?)'
      )
      .bind(id, body.name)
      .run()

      const newItem = await c.env.DB.prepare(
        'SELECT * FROM items WHERE id = ?'
      )
      .bind(id)
      .first<Item>()

      return c.json(createResponse.success(newItem, 201))
    } catch (error) {
      console.error('DB Error:', error)
      return c.json(createResponse.error('Failed to create item'), 500)
    }
  },

  update: async (c: Context<{ Bindings: Bindings }>) => {
    try {
      const body = await c.req.json<Item>()
      
      if (!body.name) {
        return c.json(createResponse.error('Name is required'), 400)
      }

      await c.env.DB.prepare(
        'UPDATE items SET name = ? WHERE id = ?'
      )
      .bind(body.name, c.req.param('id'))
      .run()

      const updatedItem = await c.env.DB.prepare(
        'SELECT * FROM items WHERE id = ?'
      )
      .bind(c.req.param('id'))
      .first<Item>()

      return c.json(createResponse.success(updatedItem))
    } catch (error) {
      console.error('DB Error:', error)
      return c.json(createResponse.error('Failed to update item'), 500)
    }
  },

  delete: async (c: Context<{ Bindings: Bindings }>) => {
    try {
      await c.env.DB.prepare(
        'DELETE FROM items WHERE id = ?'
      )
      .bind(c.req.param('id'))
      .run()

      return c.json(createResponse.success(null))
    } catch (error) {
      console.error('DB Error:', error)
      return c.json(createResponse.error('Failed to delete item'), 500)
    }
  }
}