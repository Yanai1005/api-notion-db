import { Hono } from 'hono';
import { Client } from '@notionhq/client';

type Bindings = {
  NOTION_API_KEY: string;
  NOTION_DATABASE_ID: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get('/', (c) => {
  return c.json({ message: 'Notion API Server', endpoints: ['/books'] });
});

// GET: データ取得
app.get('/books', async (c) => {
  try {
    const notion = new Client({ 
      auth: c.env.NOTION_API_KEY,
      fetch: fetch.bind(globalThis)
    });
    
    const response = await notion.dataSources.query({
      data_source_id: c.env.NOTION_DATABASE_ID,
    });
    
    const books = response.results.map((page: any) => ({
      id: page.id,
      name: page.properties.name?.title?.[0]?.text?.content || '',
      isbn: page.properties.isbn?.number || null,
    }));
    
    return c.json(books);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// POST: データ追加
app.post('/books', async (c) => {
  try {
    const notion = new Client({ 
      auth: c.env.NOTION_API_KEY,
      fetch: fetch.bind(globalThis)
    });
    const { name, isbn } = await c.req.json();
    
    const response = await notion.pages.create({
      parent: { database_id: c.env.NOTION_DATABASE_ID },
      properties: {
        name: { title: [{ text: { content: name } }] },
        isbn: { number: Number(isbn) }
      }
    });
    
    return c.json({ success: true, id: response.id }, 201);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

export default app;