import { NextResponse } from 'next/server';
import { insertTestDb, updateTestDb } from '@/lib/models/testDb';

// POST /api/test-db/add
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await insertTestDb(body);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('创建数据失败:', error);
    return NextResponse.json({ error: '创建数据失败' }, { status: 500 });
  }
}