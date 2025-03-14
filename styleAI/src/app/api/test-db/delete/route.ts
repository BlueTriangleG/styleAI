import { NextResponse } from 'next/server';
import { deleteTestDb } from '@/lib/models/testDb';

// DELETE /api/test-db/delete?id=xxx
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '缺少ID参数' }, { status: 400 });
    }

    const data = await deleteTestDb(Number(id));

    if (!data) {
      return NextResponse.json({ error: '数据不存在' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('删除数据失败:', error);
    return NextResponse.json({ error: '删除数据失败' }, { status: 500 });
  }
}