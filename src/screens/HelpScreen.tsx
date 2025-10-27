import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, LifeBuoy, Bot, User, Send, LoaderCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import { GoogleGenAI } from "@google/genai";

const faqData = [
    {
        question: "Come inizio a usare l'applicazione?",
        answer: "È semplice! Dopo aver effettuato l'accesso o la registrazione, la prima cosa da fare è creare un 'Progetto'. Un progetto è un contenitore per i tuoi immobili (es. 'Immobili Milano Centro'). Una volta creato il progetto, puoi iniziare ad aggiungere i tuoi immobili dalla sezione 'Immobili', e da lì potrai collegare contratti, inquilini, spese e tutto il resto."
    },
    {
        question: "Come posso mettere al sicuro i miei dati?",
        answer: "La sicurezza dei dati è fondamentale. Vai su 'Impostazioni' -> 'Gestione Dati Applicazione'. Lì troverai due opzioni: 'Esporta Dati' per creare un file di backup (.json) di tutto il tuo lavoro e salvarlo sul tuo computer, e 'Importa Dati' per ripristinare un backup precedente. Ti consigliamo di fare backup regolari!"
    },
    {
        question: "Come funzionano i report personalizzati?",
        answer: "La sezione 'Report' è molto potente. Prima scegli un tipo di report (es. 'Immobili'). Se è un report 'Anagrafiche', vedrai un'opzione per selezionare esattamente quali colonne di dati vuoi includere. Dopo aver scelto le colonne, puoi applicare filtri (per data, per immobile, etc.) e poi cliccare 'Genera Report' per vedere i risultati. Puoi esportare i dati in formato CSV o PDF."
    },
    {
        question: "Non vedo i miei dati! Cosa è successo?",
        answer: "Non ti preoccupare, è quasi sempre un problema di selezione. Assicurati di aver selezionato il 'Progetto' corretto. Se hai più progetti, i dati sono separati tra di loro. Puoi cambiare progetto dal menu in alto a destra (cliccando sul tuo nome) o dal pulsante 'Cambia Progetto'."
    },
    {
        question: "Cos'è un 'Campo Personalizzato'?",
        answer: "A volte, le informazioni standard non bastano. I campi personalizzati ti permettono di aggiungere dati specifici ai tuoi immobili, contratti o inquilini. Ad esempio, potresti aggiungere un campo 'Codice POD' a un immobile per salvare il codice del contatore elettrico. Li trovi nella pagina di dettaglio dell'immobile."
    }
];

const FaqItem: React.FC<{ item: typeof faqData[0], isOpen: boolean, onToggle: () => void }> = ({ item, isOpen, onToggle }) => {
    return (
        <div className="border-b">
            <button
                onClick={onToggle}
                className="w-full flex justify-between items-center text-left p-4 hover:bg-gray-50"
            >
                <span className="font-semibold text-dark">{item.question}</span>
                <ChevronDown className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                <div className="p-4 pt-0 text-gray-700">
                    <p>{item.answer}</p>
                </div>
            </div>
        </div>
    );
};

interface Message {
    role: 'user' | 'model';
    content: string;
}

const AiAssistant: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: input };
        const conversationHistory = [...messages, userMessage];
        
        setMessages(prev => [...prev, userMessage, { role: 'model', content: '' }]);
        setInput('');
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            const systemInstruction = "Sei un assistente virtuale esperto per l'applicazione 'Gestore Immobili PRO'. Il tuo scopo è aiutare gli utenti a capire e utilizzare al meglio l'app. L'applicazione serve a gestire proprietà immobiliari. Le sue sezioni principali sono: Dashboard (riepilogo), Immobili (elenco proprietà), Inquilini, Contratti, Pagamenti, Scadenze, Manutenzioni, Spese, Documenti, Report e Analisi Finanziaria. Rispondi in modo chiaro, conciso e amichevole. Utilizza la formattazione markdown (come grassetto o elenchi puntati) per migliorare la leggibilità. Basa le tue risposte sulla conoscenza fornita riguardo le funzionalità dell'app.";
            
            const contents = conversationHistory.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.content }]
            }));

            const responseStream = await ai.models.generateContentStream({
                model: 'gemini-2.5-flash',
                contents: contents,
                 config: {
                    systemInstruction: systemInstruction,
                 },
            });
            
            let currentResponse = '';
            for await (const chunk of responseStream) {
                const chunkText = chunk.text;
                if (chunkText) {
                    currentResponse += chunkText;
                    setMessages(prev => {
                        const newMessages = [...prev];
                        newMessages[newMessages.length - 1] = { ...newMessages[newMessages.length - 1], content: currentResponse };
                        return newMessages;
                    });
                }
            }

        } catch (error) {
            console.error("Error calling Gemini API:", error);
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { ...newMessages[newMessages.length - 1], content: "Spiacente, si è verificato un errore. Riprova più tardi." };
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Card className="flex flex-col h-[600px]">
            <div className="p-4 border-b flex items-center gap-3">
                <Bot size={24} className="text-primary"/>
                <h2 className="text-xl font-bold text-dark">Assistente AI</h2>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'model' && <div className="bg-primary p-2 rounded-full text-white"><Bot size={18}/></div>}
                        <div className={`max-w-md rounded-lg p-3 ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-gray-100 text-dark'}`}>
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                         {msg.role === 'user' && <div className="bg-gray-200 p-2 rounded-full text-dark"><User size={18}/></div>}
                    </div>
                ))}
                 {isLoading && messages[messages.length - 1]?.content === '' && (
                     <div className="flex items-start gap-3">
                         <div className="bg-primary p-2 rounded-full text-white"><Bot size={18}/></div>
                         <div className="max-w-md rounded-lg p-3 bg-gray-100 text-dark flex items-center gap-2">
                            <span className="font-semibold">L'assistente sta scrivendo</span>
                             <LoaderCircle size={16} className="animate-spin" />
                         </div>
                     </div>
                 )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Chiedi qualcosa sull'app..."
                        className="flex-1 input"
                        disabled={isLoading}
                    />
                    <button type="submit" className="p-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:bg-gray-400" disabled={isLoading || !input.trim()}>
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </Card>
    );
};


const HelpScreen: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <LifeBuoy size={28} className="text-primary"/>
                <h1 className="text-2xl font-bold text-dark">Aiuto e Supporto</h1>
            </div>
            <p className="text-gray-600">
                Benvenuto nella sezione di aiuto. Qui troverai le risposte alle domande più comuni e un assistente AI pronto a rispondere alle tue domande sull'app.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <Card className="overflow-hidden">
                    <div className="p-4 border-b">
                        <h2 className="text-xl font-bold text-dark">Domande Frequenti (FAQ)</h2>
                    </div>
                    {faqData.map((item, index) => (
                        <FaqItem
                            key={index}
                            item={item}
                            isOpen={openIndex === index}
                            onToggle={() => handleToggle(index)}
                        />
                    ))}
                </Card>
                <AiAssistant />
            </div>
        </div>
    );
};

export default HelpScreen;
