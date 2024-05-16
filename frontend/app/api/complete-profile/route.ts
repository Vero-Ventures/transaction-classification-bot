import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, industry, receiveEmails } = await request.json();

    // Update the user profile in the database
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        profileComplete: true,
        industry,
        receiveEmails,
      },
    });

    return Response.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    return Response.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
