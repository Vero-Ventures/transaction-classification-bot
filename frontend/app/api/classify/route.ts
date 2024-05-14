import { NextRequest, NextResponse } from 'next/server';
import { classify } from '@/actions/classify';
import { Transaction } from '@/types/Transaction';

export async function POST(request: NextRequest) {
  try {
    const transactions: Transaction[] = await request.json();
    await classify(transactions);

    return NextResponse.json({
      message: 'Transactions classified successfully',
    });
  } catch (error) {
    console.error('Error classifying classify:', error);
    return NextResponse.json(
      { message: 'Error classifying classify', error },
      { status: 500 }
    );
  }
}
