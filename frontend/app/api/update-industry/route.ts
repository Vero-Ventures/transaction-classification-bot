import { getServerSession } from 'next-auth';
import { options } from '../auth/[...nextauth]/options';
import prisma from '@/lib/db';

export async function POST(req: Request) {
  // Get the current session and return an unauthorized response if it doesn't exist.
  const session = await getServerSession(options);
  if (!session) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Get the industry and email from the request body.
  const { industry, email } = await req.json();

  // Return a bad request response if the industry or email is not provided.
  if (!industry || !email) {
    return Response.json(
      { message: 'Industry or email not provided' },
      { status: 400 }
    );
  }

  // Update the user's industry in the database.
  try {
    await prisma.user.update({
      where: { email },
      data: { industry },
    });
    // Return a success response if the industry is updated successfully.
    return Response.json(
      { message: 'Industry updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    // Catch any errors and return an internal server error response.
    console.error('Error updating industry:', error);
    return Response.json({ message: 'Internal server error' }, { status: 500 });
  }
}
