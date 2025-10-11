
import React, { useState } from 'react';
import { ChevronDown, LifeBuoy } from 'lucide-react';
import Card from '../components/ui/Card';

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
                Benvenuto nella sezione di aiuto. Qui troverai le risposte alle domande più comuni sul funzionamento dell'applicazione.
            </p>
            <Card className="overflow-hidden">
                {faqData.map((item, index) => (
                    <FaqItem
                        key={index}
                        item={item}
                        isOpen={openIndex === index}
                        onToggle={() => handleToggle(index)}
                    />
                ))}
            </Card>
        </div>
    );
};

export default HelpScreen;
