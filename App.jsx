import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';

/* --- Simulated Backend (JSON in memory) --- */
const initialProducts = [
  {
    id: 1,
    name: 'Tomato',
    description: 'Fresh organic tomatoes directly from farmers.',
    price: 20,
    currency: 'INR',
    farmer: { name: 'Ravi Kumar', location: 'Punjab, India' },
    images: [
      'https://images.unsplash.com/photo-1606857521015-7f91b44e9e42',
    ],
  },
  {
    id: 2,
    name: 'Wheat',
    description: 'Premium quality wheat grains in bulk.',
    price: 1500,
    currency: 'INR',
    farmer: { name: 'Anjali Sharma', location: 'Haryana, India' },
    images: [
      'https://images.unsplash.com/photo-1589883661923-647c4a0f2056',
    ],
  },
];

function App() {
  const [products, setProducts] = useState(initialProducts);

  const handleImageUpload = (id, file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, images: [...p.images, e.target.result] } : p
        )
      );
    };
    if (file) reader.readAsDataURL(file);
  };

  return (
    <Router>
      <nav className="flex gap-6 p-4 bg-blue-800 text-white">
        <Link to="/">Home</Link>
        <Link to="/shop">Shop</Link>
        <Link to="/services">Services</Link>
        <Link to="/pricing">Pricing</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop products={products} />} />
        <Route
          path="/shop/:id"
          element={<ProductDetail products={products} onUpload={handleImageUpload} />}
        />
        <Route path="/services" element={<Services />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>

      <AIAssistant />
    </Router>
  );
}

function Home() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-4xl font-bold text-blue-700">Farmers Marketplace</h1>
      <p className="text-pink-600 mt-2">Direct bulk ordering from farmers with no agents.</p>
    </div>
  );
}

function Shop({ products }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
      {products.map((p) => (
        <Link
          to={`/shop/${p.id}`}
          key={p.id}
          className="p-4 border rounded-xl shadow hover:shadow-lg transition"
        >
          <img src={p.images[0]} alt={p.name} className="h-40 w-full object-cover rounded-md" />
          <h2 className="text-xl font-semibold mt-2">{p.name}</h2>
          <p className="text-sm text-gray-600">{p.currency} {p.price}</p>
        </Link>
      ))}
    </div>
  );
}

function ProductDetail({ products, onUpload }) {
  const { id } = useParams();
  const product = products.find((p) => p.id === parseInt(id));

  if (!product) return <p className="p-8">Product not found.</p>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-700">{product.name}</h1>
      <p className="text-gray-700 mt-2">{product.description}</p>
      <p className="mt-2 font-semibold text-pink-600">
        Price: {product.currency} {product.price}
      </p>
      <div className="mt-4">
        <h3 className="font-semibold">Farmer Details:</h3>
        <p>{product.farmer.name}, {product.farmer.location}</p>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4">
        {product.images.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt={`${product.name} ${idx}`}
            className="h-48 w-full object-cover rounded-lg shadow"
          />
        ))}
      </div>
      <div className="mt-6">
        <label className="block mb-2 font-medium">Upload Product Photo:</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onUpload(product.id, e.target.files[0])}
          className="block w-full text-sm"
        />
      </div>
      <button className="mt-6 px-6 py-2 bg-pink-600 text-white rounded-xl shadow hover:bg-pink-700">
        Add to Cart / Bulk Order
      </button>
    </div>
  );
}

function Services() {
  return <div className="p-8">Services Page (logistics, quality checks, etc.)</div>;
}
function Pricing() {
  return <div className="p-8">Pricing Page with currency toggle (INR ⇄ USD).</div>;
}
function About() {
  return <div className="p-8">About Us Page with mission and vision.</div>;
}
function Contact() {
  return <div className="p-8">Contact Us Page with form and farmer/buyer support.</div>;
}

/* --- AI Assistant with Voice + Auto Language Detection (OpenAI APIs) --- */
function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! 👋 Are you a Farmer or Buyer?' },
  ]);
  const [input, setInput] = useState('');
  const [recording, setRecording] = useState(false);

  const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY;

  const detectLanguage = async (text) => {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: 'system', content: "Detect the language of this text. Reply with ISO code only." },
            { role: 'user', content: text }
          ]
        }),
      });
      const data = await res.json();
      const lang = data.choices?.[0]?.message?.content?.trim().toLowerCase() || 'en';
      return lang;
    } catch (err) {
      return 'en';
    }
  };

  const speak = async (text) => {
    try {
      const ttsRes = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini-tts",
          voice: "alloy",
          input: text,
        }),
      });
      const audioBlob = await ttsRes.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (e) {
      console.warn('TTS failed', e);
    }
  };

  const sendMessage = async (customInput) => {
    const text = customInput || input;
    if (!text.trim()) return;
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');

    try {
      const lang = await detectLanguage(text);
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: 'system', content: `You are an agricultural assistant. Reply in ${lang}.` },
            ...newMessages.map((m) => ({ role: m.role, content: m.content }))
          ],
        }),
      });
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not fetch a reply.';
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
      await speak(reply);
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: 'Error connecting to AI.' }]);
    }
  };

  const startRecording = async () => {
    setRecording(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      let chunks = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append("file", blob, "voice.webm");
        formData.append("model", "whisper-1");

        const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENAI_KEY}`,
          },
          body: formData,
        });
        const data = await res.json();
        sendMessage(data.text);
      };
      mediaRecorder.start();
      setTimeout(() => {
        mediaRecorder.stop();
        setRecording(false);
      }, 5000);
    } catch (err) {
      console.error('Voice recording failed', err);
      setRecording(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-pink-600 text-white px-4 py-3 rounded-full shadow-lg animate-bounce"
      >
        💬 AI Assistant
      </button>

      {open && (
        <div className="fixed bottom-20 right-6 w-80 h-96 bg-white rounded-2xl shadow-2xl flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-2 chat-scroll">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-lg ${m.role === 'assistant' ? 'bg-blue-100 text-blue-900' : 'bg-pink-100 text-pink-900'} `}
              >
                {m.content}
              </div>
            ))}
          </div>
          <div className="p-2 border-t flex items-center">
            <input
              className="flex-1 border rounded-lg p-2 text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
            />
            <button
              onClick={() => sendMessage()}
              className="ml-2 bg-pink-600 text-white px-3 py-2 rounded-lg"
            >
              Send
            </button>
            <button
              onClick={startRecording}
              className={`ml-2 px-3 py-2 rounded-lg ${recording ? 'bg-gray-400' : 'bg-blue-600 text-white'}`}
              disabled={recording}
              title="Hold to record (5s)"
            >
              🎤
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
