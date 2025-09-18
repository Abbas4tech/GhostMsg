# GhostMsg - Anonymous Messaging Platform

GhostMsg is a Next.js application that allows users to receive anonymous messages. Share your unique profile link and let others send you messages without revealing their identity.

## Features

- 🔐 User authentication with email/password
- 🌐 Public profile URLs for receiving anonymous messages
- 🤖 AI-powered message suggestions (using Google AI Studio)
- 📧 Email notifications (via Resend)
- 💬 Anonymous messaging system
- 📱 Responsive design

## Prerequisites

Before running this application, make sure you have:

- Node.js (v18 or higher)
- MongoDB database
- Resend account for email functionality
- Google AI Studio API key

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
MONGODB_URI=your_mongodb_connection_string
RESEND_API_KEY=your_resend_api_key
NEXT_AUTH_SECRET=your_nextauth_secret
GOOGLE_AI_STUDIO_SECRET=your_google_ai_studio_api_key
```

### Getting API Keys

1. **MongoDB URI**: Create a database at [MongoDB Atlas](https://www.mongodb.com/atlas) and get the connection string.

2. **Resend API Key**: Sign up at [Resend](https://resend.com) and get your API key from the dashboard.

3. **NextAuth Secret**: Generate a secure random string for NextAuth.js (can use `openssl rand -base64 32`).

4. **Google AI Studio Secret**: Get your API key from [Google AI Studio](https://makersuite.google.com/).

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd ghostmsg
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables as described above.

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Sign Up**: Create an account with your email, username, and password.

2. **Get Your Profile Link**: After logging in, you'll receive a unique profile URL (e.g., `ghostmsg.com/yourusername`).

3. **Share Your Link**: Share this link with others to receive anonymous messages.

4. **View Messages**: Check your dashboard to read anonymous messages sent to you.

```bash
Sample User 
Username = Test
Password = Abbas@123
```

## Technologies Used

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Email**: Resend
- **AI Features**: Google AI Studio

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support

If you have any questions or issues, please open an issue on GitHub or contact us at abbas4engg@gmail.com.

## Screenshots

<img width="1918" height="870" alt="image" src="https://github.com/user-attachments/assets/f4117395-4db6-4302-8acf-dbb584f6a012" />

<img width="1916" height="866" alt="image" src="https://github.com/user-attachments/assets/8b8576e8-0f79-41e3-aa38-644e4816e08b" />

<img width="1918" height="868" alt="image" src="https://github.com/user-attachments/assets/e5606482-c450-4ef0-ac22-229e9ca6dedd" />

---

**Note**: This application is designed for positive and constructive anonymous messaging. Please use responsibly and respect others' privacy.
