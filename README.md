# StyleAI

StyleAI is a sophisticated AI-powered fashion styling assistant application designed to provide personalized style recommendations based on image analysis. Leveraging cutting-edge AI techniques, the platform helps users discover and refine their personal style through automated analysis of user-provided images.

## Project Overview

StyleAI addresses a common challenge many people face: uncertainty about which clothing styles, colors, and fashion choices best complement their unique physical characteristics. Rather than wasting time on trial and error or seeking potentially unreliable advice, StyleAI offers a scientific, AI-driven approach to personal styling.

Our application analyzes facial features, body proportions, and physical attributes from user photos to generate tailored fashion recommendations. Users receive not only style advice but also visual previews showing how they would look in the recommended outfits, enabling confident shopping decisions without the need for costly personal styling services.

StyleAI consists of two main components:

- A modern, responsive **Next.js frontend** with React 19
- A robust **Flask-based API backend** for image processing and AI analysis

The application allows users to:

1. Upload photos of themselves through camera capture or file upload
2. Receive personalized style analysis based on facial and body features
3. Get color palette recommendations that complement their natural attributes
4. View curated outfit and style suggestions tailored to their unique characteristics
5. See visual previews of themselves wearing recommended styles
6. Download and save their style profile for future reference

## Key Features

### User-Focused Features

- **AI-Powered Physical Attribute Analysis**: Analyzes facial features, body type, and personal characteristics to identify strengths and potential areas for enhancement
- **Personalized Color Palette**: Identifies the most flattering colors based on user's skin tone, hair color, and other attributes
- **Style Categorization**: Classifies users into style categories (Classic, Professional, Elegant, etc.) to tailor recommendations
- **Outfit Recommendations**: Suggests specific clothing combinations and styles based on AI analysis
- **Virtual Try-On Previews**: Generates images showing users wearing recommended outfits to visualize the final look
- **Style Discovery**: Helps users explore styles they might not have considered but which complement their features

### Future Development Features

- **Real-Time Fashion Updates**: System will continuously collect the latest fashion trends and match them with user profiles
- **Style Exploration**: Advanced categorization of fashion datasets to recommend new styles suitable for users' body types and appearances
- **Extended Style Recommendations**: Enhanced AI models to suggest more varied and seasonally appropriate outfits

### Technical Features

- **Advanced Image Processing**: Resizes, compresses, and optimizes images for analysis
- **User Authentication**: Secure user account management with Clerk
- **Responsive UI**: Beautiful, modern interface that works on all devices
- **Real-time Camera Integration**: In-app photo capture with camera device selection
- **Docker Containerization**: Easy deployment with containerized services
- **AI-Driven Backend**: Utilizes machine learning models for style analysis and recommendations

## Technology Stack

### Frontend (styleAI/)

- **Framework**: Next.js 15.2.2 with React 19
- **Styling**: Tailwind CSS 4.x
- **Animation**: Framer Motion, GSAP
- **3D Effects**: Three.js for advanced visual elements
- **State Management**: Zustand for global state management
- **Authentication**: Clerk for secure user management

### Backend API (styleAI-api/)

- **Framework**: Flask (Python)
- **Image Processing**: Pillow (PIL)
- **ML Libraries**: Transformers, PyTorch, scikit-learn (optional)
- **Database**: PostgreSQL connection support
- **Security**: CORS protection, environment-based configuration

## Architecture

```
styleAI/
├── frontend (Next.js application)
│   ├── src/
│   │   ├── app/                   # Next.js app router
│   │   │   ├── getBestFitCloth/  # Style recommendation workflows
│   │   │   │   ├── uploadImages/  # Image upload and camera integration
│   │   │   │   ├── loading/       # Analysis processing screens
│   │   │   │   └── generateReport/  # Results visualization
│   │   ├── components/            # Reusable UI components
│   │   ├── lib/                   # Utility libraries
│   │   └── utils/                 # Helper functions
│   └── public/                    # Static assets
│
├── styleAI-api/                   # Backend API
│   ├── app/
│   │   ├── routes/
│   │   │   └── personalized.py    # Style analysis endpoints
│   │   ├── utils/
│   │   │   ├── image_utils.py     # Image processing utilities
│   │   │   ├── style_matching.py  # Style matching algorithms
│   │   │   └── algorithms/        # AI analysis algorithms
│   │   └── mock_data.py           # Development mock data
│   └── nginx/                     # Nginx server configuration
```

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.8+ (for local backend development)
- Clerk account (for authentication features)

## Quick Start

The easiest way to run StyleAI is using Docker Compose:

```bash
# Clone this repository
git clone https://github.com/yourusername/styleAI.git
cd styleAI

# Start all services
docker-compose up -d

# Or use the deployment script
./docker-deploy.sh
```

After running the above commands:

- Frontend will be available at: http://localhost:3000
- API will be available at: http://localhost:5001
- Nginx proxy will be available at: http://localhost:80

## Manual Setup

### Frontend Setup

```bash
cd styleAI
npm install
npm run dev
```

The frontend development server will start at http://localhost:3000

### API Setup

```bash
cd styleAI-api
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

The API server will start at http://localhost:5001

## API Endpoints

### Health Check

- `GET /health`: Check if the API server is running

### Personalized Analysis

- `POST /api/personalized/analysis`: Get personalized style analysis
  - Request: `{"jobId": "your-job-id"}`
  - Response: Analysis data including facial features, body features, recommended colors, and style categories

### Style Recommendations

- `POST /api/personalized/wear-suit-pictures`: Get outfit recommendations
  - Request: `{"jobId": "your-job-id"}`
  - Response: List of recommended outfits with URLs and descriptions

### Image Processing

- `POST /api/image/process`: Process and compress images for analysis
- `POST /api/image/download`: Prepare images for download

## Workflow

1. **User Authentication**: Users sign up or log in using Clerk authentication
2. **Image Upload**: Users upload images through camera capture or file selection
3. **Processing**: Images are compressed, optimized, and sent to the API for analysis
4. **AI Analysis**: Backend processes images to extract style features and characteristics
5. **Results**: User receives personalized style analysis and recommendations
6. **Outfit Suggestions**: System provides outfit and style suggestions based on analysis
7. **Visual Preview**: User can see how they would look wearing the recommended styles

## Environment Variables

### Frontend

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
- `CLERK_SECRET_KEY`: Your Clerk secret key
- `NEXT_PUBLIC_API_URL`: URL of the backend API

### Backend

- `FLASK_APP`: Main Flask application file
- `FLASK_ENV`: Environment (development/production)
- `FLASK_DEBUG`: Enable/disable debug mode
- `MAX_CONTENT_LENGTH`: Maximum file upload size (default: 16MB)

## Deployment

The application is fully containerized and can be deployed using Docker Compose. See the `docker-deploy.sh` script for deployment options.

## Development

### Adding New Style Features

To add new style analysis features:

1. Update the AI models in `styleAI-api/app/utils/algorithms/`
2. Modify the analysis parsing in `styleAI-api/app/routes/personalized.py`
3. Update the frontend visualization in `styleAI/src/app/getBestFitCloth/`

### Extending the Frontend

The React components are organized in a modular fashion to make it easy to extend the UI:

- Add new pages in the `styleAI/src/app/` directory using Next.js app router
- Create reusable components in `styleAI/src/components/`
- Add new styles in the Tailwind CSS configuration

## License

[MIT](LICENSE)
