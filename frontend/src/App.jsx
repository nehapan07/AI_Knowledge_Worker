import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    getAuth, 
    onAuthStateChanged, 
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    sendEmailVerification
} from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, onSnapshot } from "firebase/firestore";

// These variables are provided by the environment and must be used.
const __app_id = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const __firebase_config = typeof __firebase_config !== 'undefined' ? __firebase_config : '{}';
const __initial_auth_token = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Initialize Firebase
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const appId = __app_id;

// --- Helper & UI Components ---

const Card = ({ children, className = '' }) => (
  <div className={`bg-gray-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-lg p-6 ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ title, description }) => (
  <div>
    <h2 className="text-xl font-bold text-slate-100">{title}</h2>
    <p className="text-sm text-slate-400 mt-1">{description}</p>
  </div>
);

const PrimaryButton = ({ onClick, children, isLoading, isDisabled = false, className = '', type = 'button' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={isLoading || isDisabled}
    className={`w-full flex justify-center items-center bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-400/50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900 transition-all duration-300 ${className}`}
  >
    {isLoading ? (
      <>
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Processing...
      </>
    ) : (
      children
    )}
  </button>
);

const FormattedAiAnalysis = ({ analysis, placeholder }) => {
    if (!analysis || !analysis.summary) {
      return <div className="text-slate-500 h-full flex items-center justify-center text-center p-4">{placeholder}</div>;
    }

    const { summary, insights, query } = analysis;

    return (
        <div>
            <h3 className="text-xl font-semibold text-slate-100 mb-6 border-b border-slate-700 pb-3">
                Analysis for: <span className="text-indigo-400">{query}</span>
            </h3>

            <div className="mb-8">
                <div className="flex items-center mb-3">
                    <svg className="w-6 h-6 text-indigo-400 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <h4 className="text-lg font-semibold text-slate-200">Summary</h4>
                </div>
                <p className="text-slate-400 leading-relaxed pl-9">{summary}</p>
            </div>

            {insights && insights.length > 0 && (
                <div>
                    <div className="flex items-center mb-4">
                        <svg className="w-6 h-6 text-indigo-400 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                        <h4 className="text-lg font-semibold text-slate-200">Key Insights</h4>
                    </div>
                    <ul className="space-y-4 pl-9">
                        {insights.map((insight, index) => (
                            <li key={index} className="flex items-start">
                                <span className="bg-indigo-500/20 text-indigo-300 font-bold rounded-full h-6 w-6 flex items-center justify-center mr-4 mt-0.5 flex-shrink-0">{index + 1}</span>
                                <span className="text-slate-300">{insight}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

const Notification = ({ message, show, onEnd, type = 'success' }) => {
    const [visible, setVisible] = useState(false);
    const bgColor = type === 'success' ? 'bg-green-500/80' : 'bg-red-500/80';
    const borderColor = type === 'success' ? 'border-green-400' : 'border-red-400';

    useEffect(() => {
        if (show) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
                setTimeout(onEnd, 300);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [show, onEnd]);

    return (
        <div className={`fixed top-5 right-5 z-50 transition-all duration-300 ease-in-out ${visible ? 'transform translate-x-0 opacity-100' : 'transform translate-x-full opacity-0'}`}>
            <div className={`${bgColor} backdrop-blur-sm text-white font-semibold py-3 px-5 rounded-lg shadow-2xl border ${borderColor} flex items-center`}>
                     {type === 'success' ? (
                        <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    ) : (
                        <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    )}
                    {message}
            </div>
        </div>
    );
};

const HistoryPanel = ({ history, onSelect }) => (
    <Card className="h-full flex flex-col">
        <SectionTitle title="Analysis History" description="Review your past analyses." />
        <div className="mt-4 flex-grow overflow-y-auto custom-scrollbar pr-2">
            {history.length === 0 ? (
                <p className="text-slate-500 text-sm">Your analysis history will appear here.</p>
            ) : (
                <ul className="space-y-3">
                    {history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map((item) => (
                        <li key={item.id}>
                            <button onClick={() => onSelect(item)} className="w-full text-left p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors duration-200">
                                <p className="font-semibold text-indigo-400 truncate">{item.query}</p>
                                <p className="text-xs text-slate-400">{item.timestamp}</p>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    </Card>
);

// --- Auth Screen ---
const AuthScreen = () => {
    const [mode, setMode] = useState('signIn'); // 'signIn', 'register', 'forgot'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleAuthAction = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            if (mode === 'signIn') {
                await signInWithEmailAndPassword(auth, email, password);
            } else if (mode === 'register') {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await sendEmailVerification(userCredential.user);
                setMessage("Registration successful! A verification email has been sent.");
            } else if (mode === 'forgot') {
                await sendPasswordResetEmail(auth, email);
                setMessage("Password reset email sent. Please check your inbox.");
            }
        } catch (err) {
            if (err.code === 'auth/invalid-credential') {
                setError("Invalid email or password. Please try again.");
            } else if (err.code === 'auth/email-already-in-use') {
                setError("This email is already registered. Please sign in.");
            } else if (err.code === 'auth/weak-password') {
                setError("Password is too weak. Please use at least 6 characters.");
            } else {
                setError(err.message);
            }
        }
        setIsLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <Card className="w-full max-w-md">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-extrabold text-slate-100">Autonomous AI Worker</h1>
                    <p className="text-slate-400 mt-2">
                        {mode === 'signIn' && 'Sign in to access your dashboard'}
                        {mode === 'register' && 'Create a new account'}
                        {mode === 'forgot' && 'Reset your password'}
                    </p>
                </div>

                <div className="flex border-b border-slate-700 mb-6">
                    <button onClick={() => {setMode('signIn'); setError(''); setMessage('');}} className={`flex-1 py-2 text-sm font-semibold ${mode === 'signIn' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400'}`}>Sign In</button>
                    <button onClick={() => {setMode('register'); setError(''); setMessage('');}} className={`flex-1 py-2 text-sm font-semibold ${mode === 'register' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400'}`}>Register</button>
                </div>
                
                {error && <p className="bg-red-500/20 text-red-300 text-sm p-3 rounded-md mb-4">{error}</p>}
                {message && <p className="bg-green-500/20 text-green-300 text-sm p-3 rounded-md mb-4">{message}</p>}

                <form onSubmit={handleAuthAction} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-gray-700/80 border border-slate-600 rounded-md py-2 px-3 focus:outline-none focus:ring-indigo-500" />
                    </div>
                    {mode !== 'forgot' && (
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? 'text' : 'password'} 
                                    id="password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                    className="w-full bg-gray-700/80 border border-slate-600 rounded-md py-2 px-3 focus:outline-none focus:ring-indigo-500 pr-10" 
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
                                >
                                    {showPassword ? (
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                                    ) : (
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                    <PrimaryButton type="submit" isLoading={isLoading}>
                        {mode === 'signIn' && 'Sign In'}
                        {mode === 'register' && 'Register'}
                        {mode === 'forgot' && 'Send Reset Email'}
                    </PrimaryButton>
                </form>

                {mode === 'signIn' && (
                    <div className="text-center mt-4">
                        <button onClick={() => {setMode('forgot'); setError(''); setMessage('');}} className="text-sm text-indigo-400 hover:underline">Forgot Password?</button>
                    </div>
                )}
            </Card>
        </div>
    );
};

// --- Main Dashboard ---
const Dashboard = ({ user, onLogout }) => {
    const [file, setFile] = useState(null);
    const [topic, setTopic] = useState('');
    const [stockSymbol, setStockSymbol] = useState('');

    const [rawData, setRawData] = useState(null);
    const [currentAnalysis, setCurrentAnalysis] = useState(null);
    const [history, setHistory] = useState([]);

    const [isLoadingData, setIsLoadingData] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        if (!user?.uid) return;
        const historyCollectionPath = `/artifacts/${appId}/users/${user.uid}/history`;
        const q = query(collection(db, historyCollectionPath));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const historyData = [];
            querySnapshot.forEach((doc) => {
                historyData.push({ id: doc.id, ...doc.data() });
            });
            setHistory(historyData);
        }, (err) => {
            console.error("Error fetching history:", err);
            showNotification("Could not load analysis history.", 'error');
        });
        return () => unsubscribe();
    }, [user]);
    
    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
    };

    const parseAiResponse = (text) => {
        if (!text || typeof text !== 'string') {
            return { summary: 'No content returned from AI.', insights: [] };
        }

        text = text.trim();
        let summary = '';
        let insights = [];

        const insightsHeader = "Key Insights:";
        const summaryHeader = "Summary:";

        const insightsIndex = text.indexOf(insightsHeader);

        if (insightsIndex !== -1) {
            summary = text.substring(0, insightsIndex).trim();
            const insightsText = text.substring(insightsIndex + insightsHeader.length).trim();
            insights = insightsText.split('\n').map(item => item.replace(/^\d+\.\s*/, '').trim()).filter(Boolean);
        } else {
            summary = text;
        }

        if (summary.startsWith(summaryHeader)) {
            summary = summary.substring(summaryHeader.length).trim();
        }

        if (!summary && insights.length === 0) {
            return { summary: text, insights: [] };
        }

        return { summary, insights };
    };

const API_BASE_URL = "https://autonomous-ai-worker-47e2bf98e0e7.onrender.com";

const handleApiCall = async (endpoint, params, query) => {
        setIsLoadingData(true);
        setError('');
        setRawData(null);
        setCurrentAnalysis(null);
        try {
            const response = await axios.get(`${API_BASE_URL}${endpoint}`, { params });

            setRawData({ data: response.data, query });
            showNotification("Data source loaded successfully!");
        } catch (err) {
            let errorMessage = `An error occurred: ${err.response?.data?.error || err.message}.`;
            if (err.code === 'ERR_NETWORK') {
                errorMessage = "Network request failed. Check if the backend server is running.";
            }
            setError(errorMessage);
            console.error(err);
        }
        setIsLoadingData(false);
    };

    const handleFetchNews = () => handleApiCall('/api/news', { topic }, `News: ${topic}`);

    const handleFetchStockData = () => handleApiCall('/api/stock', { symbol: stockSymbol }, `Stock: ${stockSymbol}`);
    
    const handleAnalyzeWithAI = async () => {
        if (!rawData) { setError("No data to analyze."); return; }
        setIsAnalyzing(true);
        setError('');
        
        try {
            const response = await axios.post(`${API_BASE_URL}/api/analyze`, { data: rawData.data });
            const text = response.data.analysis;
            const newAnalysis = {
                query: rawData.query,
                timestamp: new Date().toLocaleString(),
                ...parseAiResponse(text)
            };
            
            setCurrentAnalysis(newAnalysis);
            
            // Save to history in the background without holding up the UI.
            // A catch is added to show a non-blocking notification on failure.
            addDoc(collection(db, `/artifacts/${appId}/users/${user.uid}/history`), newAnalysis)
                .catch(dbError => {
                    console.error("Firestore save error:", dbError);
                    showNotification("Failed to save analysis to history.", "error");
                });

        } catch (err) {
            setError(`AI Analysis Error: ${err.response?.data?.error || err.message}.`);
            console.error("AI Analysis Error Details:", err);
        } finally {
            // This ensures the spinner ALWAYS stops, even if there's an error.
            setIsAnalyzing(false);
        }
    };

    const processFileUpload = () => {
        if (!file) { setError("Please select a file first."); return; }
        setRawData({
            data: { status: "File processed for pipeline (POC)", fileName: file.name },
            query: `File: ${file.name}`
        });
        showNotification(`File "${file.name}" uploaded successfully!`);
    };
    
    if (!user.emailVerified) {
        return (
            <div className="bg-gray-900 min-h-screen flex items-center justify-center">
                <Card className="text-center">
                    <h2 className="text-2xl font-bold text-slate-100">Please Verify Your Email</h2>
                    <p className="text-slate-400 mt-4">A verification link has been sent to <span className="font-semibold text-indigo-400">{user.email}</span>. Please check your inbox and click the link to activate your account.</p>
                    <PrimaryButton onClick={onLogout} className="mt-6">Back to Sign In</PrimaryButton>
                </Card>
            </div>
        );
    }

    return (
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-700 min-h-screen text-white">
        <Notification message={notification.message} show={notification.show} onEnd={() => setNotification({ show: false, message: '', type: 'success' })} type={notification.type} />

        <header className="bg-indigo-900/90 backdrop-blur-md border-b border-indigo-700 p-6 shadow-lg">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                     <h1 className="text-3xl font-extrabold text-white tracking-wide">AI Knowledge Worker</h1>
                     <div>
                        <span className="text-md text-indigo-300 mr-6 hidden sm:inline">Welcome, {user.email}</span>
                        <button onClick={onLogout} className="text-md font-semibold text-white hover:text-indigo-300 transition-colors duration-300">Logout</button>
                     </div>
            </div>
        </header>

        <main className="p-6 sm:p-10 lg:p-12">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Column */}
                    <div className="lg:col-span-1 space-y-10">
                        <Card className="bg-indigo-800/70 border border-indigo-600 shadow-xl">
                            <SectionTitle title="1. Choose Data Source" description="Select a file or fetch from an API." />
                            <div className="mt-6">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-indigo-700/80 hover:bg-indigo-600 border-2 border-dashed border-indigo-500 rounded-xl p-8 flex flex-col justify-center items-center transition-colors duration-300">
                                    <svg className="w-14 h-14 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-4-4V7a4 4 0 014-4h10a4 4 0 014 4v5a4 4 0 01-4 4H7z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12v6m0 0l-3-3m3 3l3-3" /></svg>
                                    <span className="mt-3 text-base text-indigo-300 font-medium">{file ? file.name : "Click to upload a document"}</span>
                                </label>
                                <input id="file-upload" type="file" className="sr-only" onChange={(e) => setFile(e.target.files[0])} />
                            </div>
                            <PrimaryButton onClick={processFileUpload} isDisabled={!file} className="mt-6 text-base py-3 rounded-lg shadow-lg">Use Uploaded File</PrimaryButton>
                            
                            <div className="relative my-8"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-indigo-600" /></div><div className="relative flex justify-center"><span className="bg-indigo-800 px-3 text-sm text-indigo-400">OR</span></div></div>
                            
                            <div className="space-y-8">
                                <div>
                                    <label htmlFor="news-topic" className="block text-sm font-medium text-indigo-300 mb-2">News Topic</label>
                                    <input type="text" id="news-topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., 'AI advancements'" className="w-full bg-indigo-700/80 border border-indigo-600 rounded-lg py-3 px-4 text-indigo-200 placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                    <PrimaryButton onClick={handleFetchNews} isLoading={isLoadingData} isDisabled={!topic} className="mt-4 text-base py-3 rounded-lg shadow-lg">Fetch News</PrimaryButton>
                                </div>
                                <div>
                                    <label htmlFor="stock-symbol" className="block text-sm font-medium text-indigo-300 mb-2">Stock Symbol</label>
                                    <input type="text" id="stock-symbol" value={stockSymbol} onChange={(e) => setStockSymbol(e.target.value.toUpperCase())} placeholder="e.g., 'AAPL'" className="w-full bg-indigo-700/80 border border-indigo-600 rounded-lg py-3 px-4 text-indigo-200 placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                    <PrimaryButton onClick={handleFetchStockData} isLoading={isLoadingData} isDisabled={!stockSymbol} className="mt-4 text-base py-3 rounded-lg shadow-lg">Fetch Stock Info</PrimaryButton>
                                </div>
                            </div>
                        </Card>
                         <Card className="bg-indigo-800/70 border border-indigo-600 shadow-xl">
                            <SectionTitle title="2. Generate Insights" description="Analyze the selected data source." />
                            <PrimaryButton onClick={handleAnalyzeWithAI} isLoading={isAnalyzing} isDisabled={!rawData} className="mt-6 text-base py-3 rounded-lg shadow-lg">Analyze with AI</PrimaryButton>
                         </Card>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-2 space-y-10">
                        <Card className="min-h-[400px] bg-indigo-800/70 border border-indigo-600 shadow-xl">
                           {error && <div className="bg-red-600/80 border border-red-500 text-red-200 text-sm rounded-lg p-5 mb-6">{error}</div>}
                           <FormattedAiAnalysis analysis={currentAnalysis} placeholder="Your AI-generated summary and key insights will appear here." />
                        </Card>
                        <HistoryPanel history={history} onSelect={setCurrentAnalysis} />
                    </div>
                </div>
            </div>
        </main>
      </div>
    );
};

// --- Main App Component ---
export default function App() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const authPromise = async () => {
        if (__initial_auth_token) {
          try {
            await auth.signInWithCustomToken(__initial_auth_token);
          } catch (e) {
            console.error("Custom token sign-in failed:", e);
            await auth.signInAnonymously();
          }
        } else {
          await auth.signInAnonymously();
        }
      };
      
      authPromise();

      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          setIsLoading(false);
      });
      
      return () => unsubscribe();
    }, []);
    
    if (isLoading) {
        return <div className="bg-gray-900 min-h-screen flex items-center justify-center text-white">Loading...</div>;
    }
    
    return (
        <div className="bg-gray-900 min-h-screen">
             <style>{`
                 @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                 body { font-family: 'Inter', sans-serif; }
                 .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                 .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                 .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #4a5568; border-radius: 4px; }
                 .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #718096; }
             `}</style>
            {user ? <Dashboard user={user} onLogout={() => signOut(auth)} /> : <AuthScreen />}
        </div>
    );
}
