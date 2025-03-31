# Thryve - Mental Health Tracking App

A comprehensive mental health tracking application that helps users monitor their well-being, set goals, and receive AI-powered insights.

## Core Features

### 1. User Authentication & Profile

- Secure login and signup system
- Profile management with customizable settings
- Password change functionality
- User preferences for notifications and theme

### 2. Mood Tracking

- Daily mood entries with 5-point scale
- Activity tracking with predefined categories
- Sleep quality monitoring
- Energy level assessment
- Social interaction counting
- Stress level tracking
- Notes and observations

### 3. Goals & Progress

- Create and manage personal goals
- Multiple goal types:
  - Mood goals
  - Sleep goals
  - Activity goals
  - Social interaction goals
- Visual progress tracking
- Goal status management (active/completed/abandoned)
- Deadline setting and overdue alerts

### 4. Emergency Contacts

- Add and manage emergency contacts
- Multiple notification methods (SMS/Email)
- Customizable alert thresholds
- Contact verification system
- Priority-based notification preferences

### 5. Risk Assessment

- AI-powered risk analysis
- Real-time risk level indicators
- Early warning system
- Risk factor tracking
- Historical risk comparison
- Emergency alerts for high-risk situations

### 6. Crisis Plan

- Personalized safety plan creation
- Emergency contact list
- Warning signs identification
- Coping strategies
- Professional help contacts
- Safe places documentation
- Personal strengths recognition

### 7. Data Export

- Complete data export in JSON format
- Includes:
  - User profile
  - Mood entries
  - Goals and progress
  - Emergency contacts
  - Crisis plan
  - Risk assessments
  - AI insights and predictions

### 8. AI Insights & Analytics

- Mood pattern analysis
- Risk predictions
- Personalized recommendations
- Trend analysis
- Activity impact assessment
- Seasonal trend identification
- Correlation analysis

## Getting Started

### Prerequisites

- Node.js 18.x or later
- MongoDB
- OpenAI API key
- Email service credentials
- SMS service credentials

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/thryve.git
cd thryve
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials.

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create a `.env.local` file with the following variables:

```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
JWT_EXPIRE=your_jwt_expiration
NEXT_PUBLIC_APP_URL=http://localhost:3000
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=your_resend_from_email OR onboarding@resend.dev
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number


```

## Tech Stack

- **Frontend**: Next.js 14, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **AI**: OpenAI GPT-4
- **Email**: Resend
- **SMS**: Twilio
- **Charts**: Chart.js

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
