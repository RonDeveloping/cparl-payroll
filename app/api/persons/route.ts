// src/app/api/persons/route.ts
import { createPersonWithDetails } from ".../../../lib/db/person.services";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const person = await createPersonWithDetails(body);

    return Response.json(person, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Failed to create person" },
      { status: 500 }
    );
  }
}
