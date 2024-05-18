import { find_industry } from '@/actions/quickbooks';
import { getServerSession } from 'next-auth';
import { options } from '../auth/[...nextauth]/options';
import { NextRequest } from 'next/server';

export async function POST(req: Request) {
  const session = await getServerSession(options);

  if (!session) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { industry, email } = await req.json();

  if (!industry || !email) {
    return Response.json(
      { message: 'Industry or email not provided' },
      { status: 400 }
    );
  }

  try {
    await prisma.user.update({
      where: { email },
      data: { industry },
    });
    return Response.json(
      { message: 'Industry updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating industry:', error);
    return Response.json({ message: 'Internal server error' }, { status: 500 });
  }
}
