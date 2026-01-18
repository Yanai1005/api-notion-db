import { Hono } from 'hono';

type Bindings = {
  NOTION_API_KEY: string;
  NOTION_DATABASE_ID: string;
};

const app = new Hono<{ Bindings: Bindings }>();

const NOTION_VERSION = '2022-06-28';

app.get('/', (c) => {
  return c.json({ message: 'Notion API Server', endpoints: ['/books', '/debug'] });
});

// デバッグ用エンドポイント
app.get('/debug', (c) => {
  return c.json({
    api_key_set: !!c.env.NOTION_API_KEY,
    api_key_length: c.env.NOTION_API_KEY?.length || 0,
    database_id: c.env.NOTION_DATABASE_ID,
  });
});

// データベース情報取得（共有確認用）
app.get('/database-info', async (c) => {
  try {
    const API_KEY = c.env.NOTION_API_KEY;
    const DB_ID = c.env.NOTION_DATABASE_ID;
    
    const response = await fetch(`https://api.notion.com/v1/databases/${DB_ID}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Notion-Version': NOTION_VERSION,
      },
    });
    
    const data: any = await response.json();
    
    return c.json(data);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// GET: 全データ取得
app.get('/books', async (c) => {
  try {
    const API_KEY = c.env.NOTION_API_KEY;
    const DB_ID = c.env.NOTION_DATABASE_ID;
    
    const response = await fetch(`https://api.notion.com/v1/databases/${DB_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Notion-Version': NOTION_VERSION,
      },
    });
    
    const data: any = await response.json();
    
    if (!response.ok) {
      return c.json({ error: data }, 500);
    }
    
    const books = data.results.map((page: any) => ({
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
    const API_KEY = c.env.NOTION_API_KEY;
    const DB_ID = c.env.NOTION_DATABASE_ID;
    
    const { name, isbn } = await c.req.json();
    
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Notion-Version': NOTION_VERSION,
      },
      body: JSON.stringify({
        parent: { database_id: DB_ID },
        properties: {
          name: {
            title: [{ text: { content: name } }]
          },
          isbn: {
            number: Number(isbn)
          }
        }
      })
    });
    
    const data: any = await response.json();
    
    if (!response.ok) {
      return c.json({ error: data }, 500);
    }
    
    return c.json({ success: true, id: data.id }, 201);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

export default app;