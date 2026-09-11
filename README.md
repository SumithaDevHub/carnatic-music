# Carnatic Music Learning Portal

A simple digital learning portal created to preserve and organize our Carnatic music notes, learnings, and resources.

The portal allows learners to explore Carnatic music content through folders and topics, with supporting audio, images, and PDF resources.

## About

This portal is a digital version of the notes and learnings that have been part of our Carnatic music journey.

What began as a co-curricular activity gradually became something much more meaningful to us. This project is our attempt to preserve those learnings in a digital space and keep our musical journey close to us.

We are grateful to our parents for introducing us to Carnatic music and supporting us throughout the journey, and to our mentor, **Mrs. Vidya Rani Ma'am**, our Carnatic Music Teacher, for guiding us.

## Features

### Public Library

- Browse published folders
- Unlimited nested folders
- Explore topics within folders
- Read formatted learning material
- View Points to Remember
- Listen to audio resources
- View images and PDFs
- Download resources when permitted

### Admin

- Secure admin login
- Create and manage folders
- Create nested subfolders
- Create and manage topics
- Rename, move, publish/unpublish and delete content
- Add and edit topic content
- Upload audio, images and PDFs
- Control whether media can be downloaded

## Tech Stack

- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Supabase**
  - PostgreSQL
  - Authentication
  - Storage
  - Row Level Security
- **Tiptap**
- **Vercel**

## Project Structure

```text
src/
├── app/
│   ├── admin/
│   │   ├── folder/
│   │   ├── topic/
│   │   └── login/
│   │
│   ├── browse/
│   ├── folder/
│   ├── topic/
│   └── page.tsx
│
└── lib/
    └── supabase/
        ├── client.ts
        ├── server.ts
        ├── admin.ts
        └── proxy.ts
```

# Carnatic Music Learning Portal

🌐 **Live Website:** https://carnatic-music.vercel.app/

A simple digital learning portal created to preserve and organize our Carnatic music notes, learnings, and resources.
