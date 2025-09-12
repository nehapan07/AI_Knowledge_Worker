# Autonomous AI Knowledge Worker

🚀 Overview
Welcome to the Autonomous AI Knowledge Worker project! This application is an advanced, AI-powered system designed to operate as a fully autonomous agent. It seamlessly integrates with various data sources, processes information using generative AI, and delivers unique, actionable insights through a secure and user-friendly dashboard.

As the sole developer, this project encompasses the full lifecycle from ideation and architectural design to development, testing, and deployment, adhering to enterprise-grade software engineering practices.

✨ Key Features
🤖 Fully Autonomous Workflow: Integrates multiple data sources and APIs (News, Financial Data) to create a seamless data-to-insight pipeline.

🧠 Advanced AI Processing: Leverages the Google Gemini API for sophisticated summarization, multimodal reasoning, and the generation of unique insights.

📊 Secure User Dashboard: A stakeholder-facing interface built with React.js provides real-time status updates and access to the generated reports.

🗓️ Task Orchestration: Designed for autonomous task scheduling for recurring reports and analysis.

💾 Context & Memory: The system stores context to improve its performance over time and support historical data analysis.

🛠️ Technology Stack
The project is built on a modern, scalable, and serverless architecture.

Frontend: React.js

Styling: Tailwind CSS

Backend-as-a-Service (BaaS): Google Firebase

Authentication: Firebase Authentication

Database: Cloud Firestore

Serverless Functions: Cloud Functions

Hosting: Firebase Hosting

External APIs:

News: NewsAPI

Financial Data: Alpha Vantage

Generative AI: Google Gemini API

🏗️ System Architecture
The application is founded on a composable, API-first design pattern, divided into three primary tiers:

Client Tier (React.js): The user-facing web application responsible for rendering the UI and managing user interactions.

Backend-as-a-Service Tier (Firebase): Provides the core backend infrastructure for authentication, database, and serverless functions, eliminating the need for server management.

External Services Tier (APIs): Consists of specialized third-party APIs that provide the data and intelligence powering the application's core features.

All external API calls in a production environment are routed through Firebase Functions to ensure API keys are secure and not exposed on the client-side.

⚙️ Setup and Installation
Follow these steps to get the project running on your local machine.

1. Prerequisites
Git

Node.js (version specified in .nvmrc)

A code editor (VS Code is recommended)

2. Clone the Repository
3. 
cd autonomous-ai-knowledge-worker

4. Install Dependencies
npm install

5. Configure Environment Variables
Create a .env file in the root of the project by copying the example file:

cp .env.example .env

Now, open the .env file and add your credentials. You will need to obtain API keys from the following services:

Variable

Description

How to Obtain

REACT_APP_FIREBASE_CONFIG

Firebase project configuration JSON

From your Firebase Project Settings -> SDK setup

611a4bcef0e94e5d984dff5c839bf646

API key for the NewsAPI service

Register at newsapi.org

FYBQO9RZDE2NH5TH

API key for Alpha Vantage

Claim a key at alphavantage.co

AIzaSyBcjRhKG2m76EIJcJTkQk8LYDgpnWwN884

API key for Google Gemini

Create a key in Google AI Studio

Note: For REACT_APP_FIREBASE_CONFIG, you should stringify the JSON configuration object provided by Firebase.

▶️ Running the Application
Once the setup is complete, you can run the development server:

npm run dev

The application will be available at http://localhost:3000 (or another port if 3000 is in use).

✍️ Author
Neha - Software Development Engineer, Intern

This project was developed as part of an internship assignment for Cothon Solutions.


