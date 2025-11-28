import { NextRequest, NextResponse } from 'next/server';
import sequelize from '../../../lib/database';
import Event from '../../../models/Event';
import User from '../../../models/User';
import EventRequest from '../../../models/EventRequest';
import { uploadImage, validateImageFile } from '../../../lib/imageUpload';
import '../../../lib/sync'; // Auto-sync database

export async function GET(request: NextRequest) {
  try {
    console.log('Events API: Authenticating and fetching events...');
    await sequelize.authenticate();

    const events = await Event.findAll({
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'profilePicture'],
        },
        {
          model: EventRequest,
          as: 'requests',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'profilePicture'],
            },
          ],
        },
      ],
      order: [['date', 'ASC']],
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Events POST API: Creating event with potential image...');
    
    const formData = await request.formData();
    
    // Extract form fields
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const date = formData.get('date') as string;
    const location = formData.get('location') as string;
    const maxAttendees = formData.get('maxAttendees') as string;
    const createdBy = formData.get('createdBy') as string;
    const eventPicture = formData.get('eventPicture') as File;

    // Validate required fields
    if (!title || !description || !date || !location || !createdBy) {
      return NextResponse.json(
        { error: 'Title, description, date, location, and creator are required' },
        { status: 400 }
      );
    }

    await sequelize.authenticate();

    let eventPictureUrl: string | null = null;

    // Handle image upload if provided
    if (eventPicture && eventPicture.size > 0) {
      console.log('Uploading event picture...');
      
      // Validate image
      const validation = validateImageFile(eventPicture);
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        );
      }

      try {
        eventPictureUrl = await uploadImage(eventPicture, 'events');
        console.log('Event picture uploaded successfully:', eventPictureUrl);
      } catch (uploadError) {
        console.error('Failed to upload event picture:', uploadError);
        return NextResponse.json(
          { error: 'Failed to upload event picture' },
          { status: 500 }
        );
      }
    }

    // Create event with or without picture
    const event = await Event.create({
      title: title.trim(),
      description: description.trim(),
      date: new Date(date),
      location: location.trim(),
      maxAttendees: maxAttendees ? parseInt(maxAttendees) : undefined,
      createdBy: parseInt(createdBy),
      status: 'upcoming',
      eventPicture: eventPictureUrl || undefined,
    });

    const createdEvent = await Event.findByPk(event.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'profilePicture'],
        },
      ],
    });

    return NextResponse.json(createdEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
