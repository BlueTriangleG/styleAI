import { NextResponse } from 'next/server';
import { getAllTestDb, getTestDbById } from '@/lib/models/testDb';

// GET /api/test-db/get
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const data = await getTestDbById(Number(id));
      if (!data) {
        return NextResponse.json({ error: '数据不存在' }, { status: 404 });
      }
      return NextResponse.json(data);
    }

    const data = await getAllTestDb();
    return NextResponse.json(data);
  } catch (error) {
    console.error('获取数据失败:', error);
    return NextResponse.json({ error: '获取数据失败' }, { status: 500 });
  }
}