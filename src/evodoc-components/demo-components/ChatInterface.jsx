"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, BrainCircuit, X, ArrowRight, FileText } from 'lucide-react';
import { useRouter } from "next/navigation";
import { sendMessageToAI } from '@/lib/aiService';
import PrescriptionPage from './PrescriptionPage';
import { Button } from '@/evodoc-components/ui/button';
import { Badge } from '@/evodoc-components/ui/badge';
import { Progress, ProgressTrack, ProgressIndicator } from '@/evodoc-components/ui/progress';
import { ScrollArea } from '@/evodoc-components/ui/scroll-area';

const ChatInterface = ({ person }) => {
    const router = useRouter();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [stage, setStage] = useState('init');

    const [clinicalNotes, setClinicalNotes] = useState(''); // Store doctor's notes

    // Symptom Verification State
    const [verifiedSymptoms, setVerifiedSymptoms] = useState([]);
    const [symptomMode, setSymptomMode] = useState('neutral'); // neutral, removing, adding, adding_diagnosis, clinical_notes

    // Prescription State
    const [finalDiagnosis, setFinalDiagnosis] = useState('');
    const [finalTreatment, setFinalTreatment] = useState('');
    const [showPrescription, setShowPrescription] = useState(false);

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // MAP SIMPLE TO MEDICAL (MOCK LOGIC FOR DEMO)
    const standardizeSymptoms = (simpleList) => {
        const mapping = {
            'High Fever': 'Pyrexia (High Grade)',
            'Shivering': 'Rigors',
            'Body Ache': 'Generalized Myalgia',
            'Pain Swallowing': 'Odynophagia',
            'Fatigue': 'Malaise/Lethargy',
            'Frequent Headaches': 'Cephalgia (Recurrent)',
            'Chest Heaviness': 'Angina Pectoris',
            'Red Itchy Patches': 'Erythematous Scaly Plaques',
            'Silver Scales': 'Psoriatic Scale',
            'Stress Flares': 'Stress-induced Exacerbation',
            'Severe Face Acne': 'Acne Vulgaris (Cystic)',
            'Painful Pimples': 'Inflammatory Papules',
            'Scarring': 'Post-acne Scarring',
            'Bleeding Gums': 'Gingival Bleeding',
            'Bad Breath': 'Halitosis',
            'Loose Teeth': 'Tooth Mobility',
            'Sharp Tooth Pain': 'Acute Dental Pain',
            'Sensitivity to Cold/Hot': 'Dentin Hypersensitivity',
            'Breathlessness': 'Dyspnea',
            'Chest Squeezing': 'Compressive Chest Pain',
            'Pain radiating to Left Arm': 'Radiating Pain (Left Arm)',
            'Racing Heart': 'Tachycardia',
            'Dizziness': 'Vertigo/Presyncope',
            'Palpitations': 'Palpitations',
            'Lower Back Pain': 'Lumbar Pain',
            'Radiating Leg Pain': 'Radiculopathy',
            'Stiffness': 'Stiffness',
            'Knee Pain': 'Gonarthralgia',
            'Morning Stiffness': 'Morning Stiffness > 30mins',
            'Wheezing Cough': 'Bronchospasm/Wheeze',
            'Running Nose': 'Rhinorrhea',
            'Mild Fever': 'Pyrexia (Low Grade)',
            'Red Body Spots': 'Rash (Maculopapular)',
            'Itching': 'Pruritus',
            'Irregular Periods': 'Oligomenorrhea',
            'Weight Gain': 'Weight Gain',
            'Chin Hair Growth': 'Hirsutism',
            'White Discharge': 'Leukorrhea',
            'Foul Smell': 'Malodorous Discharge',
            'Ear Pain': 'Otalgia',
            'Blocked Ear': 'Aural Fullness',
            'Hoarse Voice': 'Hoarseness of Voice',
            'Throat Clearing': 'Throat Clearing',
            'Floaters': 'Vitreous Floaters',
            'Blurry Central Vision': 'Central Scotoma/Blur',
            'Redness': 'Conjunctival Injection',
            'Watering': 'Epiphora',
            'Gritty Sensation': 'Foreign Body Sensation',
            'Insomnia': 'Insomnia',
            'Persistent Sadness': 'Depressed Mood',
            'Anhedonia': 'Anhedonia',
            'Panic Attacks': 'Panic Attacks',
            'Fear of Crowds': 'Agoraphobia'
        };
        return simpleList.map(s => mapping[s] || s);
    };

    // AI CALL HANDLER
    const callAI = async (userPrompt, systemOverride = null) => {
        setIsTyping(true);
        const systemPrompt = systemOverride || {
            role: 'system',
            content: `You are EvoDoc. PATIENT: ${person.name}, ${person.age}y ${person.gender}. 
            History: ${person.history.join(', ')}. Vitals: BP ${person.vitals.bp}.
            Goal: Clinical Decision Support. CURRENT SYMPTOMS: ${verifiedSymptoms.join(', ')}.
            Style: Concise, Medical Terminology.
            CONTEXT: The patient likely has '${person.diagnosis_hint || 'Undiagnosed Condition'}' but evaluate purely on evidence.`
        };

        const history = messages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content }));
        const payload = [systemPrompt, ...history, { role: 'user', content: userPrompt }];

        let response = await sendMessageToAI(payload);

        // DEMO CLINICAL RESPONSE GENERATOR (Simulated AI processing delay)
        if (!response) {
            await new Promise(r => setTimeout(r, 1500));
            if (userPrompt.includes('Differential')) {
                response = `**Differential Diagnosis Analysis**\n\nBased on the clinical presentation (${verifiedSymptoms.join(', ')}), clinical notes (${clinicalNotes || 'None'}), and history of ${person.history[0] || 'NIL'}:\n\n1. **${person.diagnosis_hint || 'Viral Syndrome'}** (High Probability)\n   Matches classic presentation of verified symptoms.\n\n2. **Alternative Diagnosis** (Low Probability)\n   To be considered if primary treatment fails.`;
            } else if (userPrompt.includes('Treatment')) {
                // Comprehensive condition-specific treatment plans
                let treatmentPlan = '';
                const diagnosis = person.diagnosis_hint.toLowerCase();

                if (diagnosis.includes('hypertension') && diagnosis.includes('angina')) {
                    treatmentPlan = `**Treatment & Safety Protocol**

**1. Relevant Medical History**
- Patient has history of ${person.history.join(', ')}
- Monitor for respiratory symptoms due to asthma

**2. Contraindications (Safety)**
- ✓·️ **AVOID:** ${person.contraindications.join(', ')}

**3. Recommended Treatment Plan**

*Diagnostic Tests via Lab*
- ECG (Electrocardiogram)
- Lipid Profile
- Fasting Blood Sugar
- Serum Creatinine

*Pharmacotherapy*
- Amlodipine 5mg (Safe CCB) - Once daily, morning
- Aspirin 75mg - Once daily, after dinner
- Atorvastatin 10mg - Once daily, night
- Sublingual Nitroglycerin - As needed for chest pain

*Lifestyle Modifications*
- Reduce salt intake (<5g/day)
- Regular exercise (30 min walking daily)
- Smoking cessation mandatory
- Stress management`;
                } else if (diagnosis.includes('tonsillitis') || diagnosis.includes('viral fever')) {
                    treatmentPlan = `**Treatment & Safety Protocol**

**1. Relevant Medical History**
- Patient has ${person.history.join(', ')}
- Penicillin allergy noted - using alternative antibiotics

**2. Contraindications (Safety)**
- ✓·️ **AVOID:** ${person.contraindications.join(', ')}

**3. Recommended Treatment Plan**

*Diagnostic Tests via Lab*
- Complete Blood Count (CBC)
- Throat Swab Culture
- Rapid Strep Test

*Pharmacotherapy*
- Azithromycin 500mg - Once daily for 3 days (Penicillin alternative)
- Paracetamol 650mg - Three times daily for fever
- Betadine Gargle - Three times daily
- Warm salt water gargling

*Supportive Care*
- Adequate hydration (3-4 liters/day)
- Soft diet, avoid spicy foods
- Complete rest for 3-4 days`;
                } else if (diagnosis.includes('psoriasis')) {
                    treatmentPlan = `**Treatment & Safety Protocol**

**1. Relevant Medical History**
- Patient has ${person.history.join(', ')}

**2. Contraindications (Safety)**
- ✓·️ **AVOID:** ${person.contraindications.join(', ')}

**3. Recommended Treatment Plan**

*Diagnostic Tests*
- Skin Biopsy (if needed)
- Vitamin D levels
- Liver Function Test (baseline)

*Pharmacotherapy*
- Topical Clobetasol 0.05% - Apply twice daily on affected areas
- Calcipotriol Cream - Once daily, morning
- Moisturizer (Cetaphil/Cerave) - Liberally, multiple times daily
- Vitamin D3 supplements - 60,000 IU weekly

*Lifestyle Modifications*
- Avoid triggers (stress, alcohol)
- Regular moisturization
- Sun exposure (15-20 min daily)`;
                } else if (diagnosis.includes('acne')) {
                    treatmentPlan = `**Treatment & Safety Protocol**

**1. Relevant Medical History**
- Patient has ${person.history.join(', ')}

**2. Contraindications (Safety)**
- ✓·️ **AVOID:** ${person.contraindications.join(', ')}

**3. Recommended Treatment Plan**

*Diagnostic Tests*
- Hormonal profile (if severe)

*Pharmacotherapy*
- Benzoyl Peroxide 2.5% Gel - Apply once daily, night
- Adapalene 0.1% Gel - Apply once daily, night (alternate days initially)
- Clindamycin 1% Gel - Apply twice daily
- Doxycycline 100mg - Once daily for 6 weeks (if moderate-severe)

*Skincare Routine*
- Gentle cleanser twice daily
- Oil-free moisturizer
- Sunscreen SPF 30+ (morning)
- Avoid picking/squeezing`;
                } else if (diagnosis.includes('diabetes')) {
                    treatmentPlan = `**Treatment & Safety Protocol**

**1. Relevant Medical History**
- Patient has ${person.history.join(', ')}

**2. Contraindications (Safety)**
- ✓·️ **AVOID:** ${person.contraindications.join(', ')}

**3. Recommended Treatment Plan**

*Diagnostic Tests via Lab*
- HbA1c
- Fasting Blood Sugar
- Postprandial Blood Sugar
- Lipid Profile
- Kidney Function Test
- Urine Microalbumin

*Pharmacotherapy*
- Metformin 500mg - Twice daily, after meals
- Glimepiride 1mg - Once daily, before breakfast (if needed)
- Vitamin B12 supplements - Once daily

*Lifestyle Modifications*
- Diabetic diet (low carb, high fiber)
- Regular exercise (45 min daily)
- Blood sugar monitoring
- Foot care`;
                } else if (diagnosis.includes('arthritis') || diagnosis.includes('joint pain')) {
                    treatmentPlan = `**Treatment & Safety Protocol**

**1. Relevant Medical History**
- Patient has ${person.history.join(', ')}

**2. Contraindications (Safety)**
- ✓·️ **AVOID:** ${person.contraindications.join(', ')}

**3. Recommended Treatment Plan**

*Diagnostic Tests*
- X-ray of affected joint
- Serum Uric Acid
- RA Factor (if suspected)
- ESR/CRP

*Pharmacotherapy*
- Paracetamol 650mg - Three times daily
- Calcium + Vitamin D3 - Once daily
- Topical Diclofenac Gel - Apply twice daily
- Glucosamine Sulfate - 1500mg daily

*Physical Therapy*
- Hot/cold compress
- Gentle exercises
- Weight management`;
                } else {
                    // Generic supportive care
                    treatmentPlan = `**Treatment & Safety Protocol**

**1. Relevant Medical History**
- Patient has ${person.history.join(', ')}

**2. Contraindications (Safety)**
- ✓·️ **AVOID:** ${person.contraindications.join(', ')}

**3. Recommended Treatment Plan**

*Diagnostic Tests via Lab*
- Complete Blood Count (CBC)
- Urinalysis
- Basic Metabolic Panel

*Pharmacotherapy*
- Symptomatic treatment as needed
- Multivitamins - Once daily
- Adequate hydration

*Supportive Care*
- Rest and recovery
- Balanced diet
- Follow-up in 7 days`;
                }

                response = treatmentPlan;
            } else if (userPrompt.toLowerCase().includes('safety audit')) {
                // Mock Safety Logic - Extract actual drug names from contraindications
                const contraindicatedDrugs = person.contraindications.map(c => {
                    // Extract drug name before parentheses
                    const match = c.match(/^([^(]+)/);
                    return match ? match[1].trim().toLowerCase() : c.toLowerCase();
                });

                const prescriptionLower = userPrompt.toLowerCase();

                // Check for actual contraindicated drugs (not safe alternatives)
                const isUnsafe = contraindicatedDrugs.some(drug => {
                    // Skip if it's marked as safe alternative in prescription
                    if (prescriptionLower.includes('safe') && prescriptionLower.includes(drug.split('-')[0])) {
                        return false; // e.g., "Safe CCB" when "Beta-blockers" is contraindicated
                    }
                    // Check for exact drug class match
                    return prescriptionLower.includes(drug);
                });

                if (isUnsafe) {
                    const detectedDrug = contraindicatedDrugs.find(drug => prescriptionLower.includes(drug));
                    response = `**🚨 SAFETY ALERT: CONTRAINDICATION DETECTED**\n\n**Issue:** You prescribed a medication that conflicts with the patient's record.\n\n**Reasoning:**\n- Patient has reported **${person.contraindications.find(c => c.toLowerCase().includes(detectedDrug))}**.\n- The proposed plan contains conflicting elements.\n\n**Recommendation:**\n- Switch to alternative class.\n- Monitor for anaphylaxis.`;
                } else {
                    response = `**✅ APPROVED**\n\n**Analysis:**\n- The proposed treatment plan does not conflict with known allergies or history.\n- Dosage appears within therapeutic range for age/weight.\n\n**Final Verification:**\n- Proceed with administration.`;
                }
            } else {
                response = "Proceeding with analysis based on verified clinical data.";
            }
        }

        setMessages(prev => [...prev, { role: 'user', content: input }, { role: 'assistant', content: response }]);
        setIsTyping(false);
        setInput('');
        return response;
    };

    // INITIALIZATION
    useEffect(() => {
        if (stage === 'init') {
            const startFlow = async () => {
                setIsTyping(true);
                await new Promise(r => setTimeout(r, 1000));

                // STEP 1: STANDARDIZE
                const medicalTerms = standardizeSymptoms(person.symptoms);
                setVerifiedSymptoms(medicalTerms);
                setIsTyping(false);

                setMessages([{
                    role: 'assistant',
                    content: `**Symptom Standardization Complete**\n\nI have converted the reported symptoms into medical terminology for clinical accuracy:\n\n${medicalTerms.map(s => `• **${s}**`).join('\n')}\n\nWould you like to **Add**, **Remove**, or **Continue** with this list?`,
                    actions: ['Add Symptom', 'Remove Symptom', 'Continue']
                }]);

                setStage('symptom_verification');
            };
            startFlow();
        }
    }, [stage, person]);

    // Auto-show prescription button after safety approval
    useEffect(() => {
        if (stage === 'safety' && messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            const hasApproval = lastMsg && lastMsg.content && lastMsg.content.includes('✅ APPROVED');
            const hasButton = messages.some(m => m.actions && m.actions.includes('View Final Prescription'));

            if (hasApproval && !hasButton) {
                setTimeout(() => {
                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: '**Safety verification complete.** You may now view the final prescription document.',
                        actions: ['View Final Prescription']
                    }]);
                }, 1000);
            }
        }
    }, [messages, stage]);


    // HANDLE ACTIONS & INPUT
    const handleAction = (action) => {
        if (action === 'Remove Symptom') {
            setSymptomMode('removing');
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Select the symptom you wish to remove:',
                isSelection: true,
                options: verifiedSymptoms
            }]);
        } else if (action === 'Add Symptom') {
            setSymptomMode('adding');
            setMessages(prev => [...prev, { role: 'assistant', content: 'Please enter the new clinical symptom to add:' }]);
        } else if (action === 'Continue') {
            setSymptomMode('neutral');
            // INTERCEPT HERE FOR CLINICAL NOTES
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Do you wish to add any **Clinical Notes** or observations before generating the diagnosis?',
                actions: ['Yes, Add Notes', 'No, Proceed']
            }]);
        } else if (action === 'Yes, Add Notes') {
            setSymptomMode('clinical_notes');
            setMessages(prev => [...prev, { role: 'assistant', content: 'Please enter your clinical notes:' }]);
        } else if (action === 'No, Proceed') {
            setSymptomMode('neutral');
            setMessages(prev => [...prev, { role: 'user', content: 'No notes. Proceed to Differential Diagnosis.' }]);
            proceedToDifferential();
        } else if (action === 'Proceed to Treatment') {
            setMessages(prev => [...prev, { role: 'user', content: 'Diagnosis confirmed. Proceed to Treatment.' }]);
            // Extract diagnosis from messages
            const diagnosisMsg = messages.find(m => m.content.includes('Differential Diagnosis'));
            if (diagnosisMsg) {
                setFinalDiagnosis(person.diagnosis_hint || 'Clinical Diagnosis');
            }
            proceedToTreatment();
        } else if (action === 'Add to Diagnosis') {
            setSymptomMode('adding_diagnosis');
            setMessages(prev => [...prev, { role: 'assistant', content: 'Please enter additional diagnosis notes or alternative diagnosis:' }]);
        } else if (action === 'View Final Prescription') {
            // Save to person object so it syncs with PatientProfile
            person.aiMedications = person.aiMedications || [];
            person.aiMedications.push({ name: 'New AI Prescription Plan', dose: 'As Directed', started: 'Today' });
            
            person.aiNotes = person.aiNotes || [];
            person.aiNotes.push({ date: 'Today', text: finalTreatment });

            setShowPrescription(true);
        }
    };

    const proceedToDifferential = async () => {
        setStage('differential');
        const prompt = `Generate a structured Differential Diagnosis based on:
        1. Verified Symptoms: ${verifiedSymptoms.join(', ')}
        2. Patient History: ${person.history.join(', ')}
        3. Clinical Notes: ${clinicalNotes || 'None'}
        
        Format: List top 3 probable diagnoses with brief reasoning. Ask for doctor's opinion.`;

        await callAI(prompt);

        // Add follow-up prompting UI
        setTimeout(() => {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `**Doctor's Opinion Required**\n\nDo you agree with this diagnosis? You can:\n\n1. **Confirm & Proceed** to Treatment.\n2. **Add to Diagnosis** for additional notes.\n3. **Type below** to suggest an alternative (AI will re-evaluate).`,
                actions: ['Proceed to Treatment', 'Add to Diagnosis']
            }]);
        }, 1000);
    };

    const proceedToTreatment = async () => {
        setStage('treatment');
        await callAI(`Diagnosis Confirmed. Generate a Comprehensive Treatment Plan based on confirmed diagnosis.
        
        MANDATORY STRUCTURE:
        1. **Relevant Medical History**: Highlight history items affecting this diagnosis (e.g. "History of Asthma relevant to respiratory symptoms").
        2. **Contraindications & Safety**: List what NOT to do/prescribe (e.g. "Avoid Aspirin due to Allergy").
        3. **Treatment Plan**: 
           - Diagnostic Tests (if needed).
           - Pharmacotherapy (Drugs, Dosage).
           - Lifestyle/Supportive Care.
           
        Patient Context: History: ${person.history.join(', ')}, Vitals: BP ${person.vitals.bp}, Contraindications: ${person.contraindications.join(', ')}.`);

        // Prompt for final check
        setTimeout(() => {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Please enter the final treatment/prescription.`,
            }]);
        }, 1200);
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        // LOCAL EDITING LOOPS
        if (stage === 'symptom_verification') {
            if (symptomMode === 'adding') {
                const newSym = input;
                const newList = [...verifiedSymptoms, newSym];
                setVerifiedSymptoms(newList);
                setSymptomMode('neutral');
                setInput('');

                setMessages(prev => [
                    ...prev,
                    { role: 'user', content: `Add ${newSym}` },
                    {
                        role: 'assistant',
                        content: `**Added:** ${newSym}\n\n**Current List:**\n${newList.map(s => `· ${s}`).join('\n')}\n\nSelect action:`,
                        actions: ['Add Symptom', 'Remove Symptom', 'Continue']
                    }
                ]);
                return;
            } else if (symptomMode === 'clinical_notes') {
                // Capture clinical notes
                setClinicalNotes(input);
                setSymptomMode('neutral');
                setInput('');

                setMessages(prev => [...prev, { role: 'user', content: input }]);
                setMessages(prev => [...prev, { role: 'assistant', content: '**Notes Recorded.** Proceeding to Differential Diagnosis...' }]);

                proceedToDifferential();
                return;
            }
        }

        // NORMAL CHAT FLOW
        setMessages(prev => [...prev, { role: 'user', content: input }]);
        setInput('');

        if (stage === 'differential') {
            if (symptomMode === 'adding_diagnosis') {
                // Doctor added diagnosis notes
                setSymptomMode('neutral');
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: `**Diagnosis notes added.**\n\nProceed to treatment or add more notes?`,
                    actions: ['Proceed to Treatment', 'Add to Diagnosis']
                }]);
                return;
            }
            // IF DOCTOR TYPES HERE, IT MEANS THEY DISAGREE OR HAVE INPUT
            // Re-run diagnosis with new context
            await callAI(`Doctor Feedback: "${input}". Re-evaluate Differential Diagnosis considering this input. Maintain medical rigor.`);

            // Ask again
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: `**Updated Analysis.**\n\nDo you wish to proceed with this diagnosis or refine further?`,
                    actions: ['Proceed to Treatment', 'Add to Diagnosis']
                }]);
            }, 1000);

        } else if (stage === 'treatment') {
            // Store the treatment for prescription
            setFinalTreatment(input);
            setStage('safety');

            // Show "Final Safety Check" message
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '🔍 **Performing Final Safety Check...**\n\nCross-referencing your prescription against patient contraindications and medical history.'
            }]);

            await callAI(`CRITICAL SAFETY AUDIT.
             
             Doctor's Final Prescription: "${input}"
             Patient Allergies/Contraindications: ${person.contraindications.join(', ')}.
             
             Your Job:
             1. CROSS-REFERENCE the prescription against the contraindications.
             2. IF HARMFUL/CONTRAINDICATED:
                - START RESPONSE WITH: "🚨 SAFETY ALERT"
                - Explain the specific mechanism of harm (e.g. "Amoxicillin triggers Penicillin Anaphylaxis").
             3. IF SAFE:
                - START RESPONSE WITH: "✅ APPROVED"
                - Briefly confirm safety.`);
        } else if (stage === 'safety') {
            // Continue conversation
            await callAI(input);
        } else {
            await callAI(input);
        }
    };

    const handleOptionClick = (option) => {
        if (symptomMode === 'removing') {
            const newList = verifiedSymptoms.filter(s => s !== option);
            setVerifiedSymptoms(newList);
            setSymptomMode('neutral');

            setMessages(prev => [
                ...prev,
                { role: 'user', content: `Remove ${option}` },
                {
                    role: 'assistant',
                    content: `**Removed:** ${option}\n\n**Current List:**\n${newList.map(s => `· ${s}`).join('\n')}\n\nSelect action:`,
                    actions: ['Add Symptom', 'Remove Symptom', 'Continue']
                }
            ]);
        }
    };

    const NEON = '#e1ff00';

    const stageProgress = {
        init: 4, symptom_verification: 25, differential: 50, treatment: 75, safety: 100
    };

    const stageActive = (stages) => stages.includes(stage);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'transparent', position: 'relative', overflow: 'hidden' }}>

            {/* Progress Bar */}
            <Progress value={parseInt(stageProgress[stage] || '4')} className="h-[3px] rounded-none bg-white/5">
                <ProgressTrack className="rounded-none bg-white/5 h-[3px]">
                    <ProgressIndicator
                        className="rounded-none transition-all duration-700"
                        style={{ backgroundColor: NEON, boxShadow: `0 0 10px ${NEON}88` }}
                    />
                </ProgressTrack>
            </Progress>

            {/* Stage Labels */}
            <div style={{
                display: 'flex', justifyContent: 'space-between',
                padding: 'clamp(6px, 1vw, 10px) clamp(12px, 2vw, 24px)',
                backgroundColor: 'rgba(25, 25, 25, 0.4)',
                backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                flexShrink: 0,
            }}>
                {[
                    { label: '1. Symptoms', active: stageActive(['symptom_verification','differential','treatment','safety']) },
                    { label: '2. Differential', active: stageActive(['differential','treatment','safety']) },
                    { label: '3. Treatment', active: stageActive(['treatment','safety']) },
                    { label: '4. Safety', active: stageActive(['safety']) },
                ].map(({ label, active }) => (
                    <span key={label} style={{
                        fontSize: 'clamp(8px, 1vw, 10px)',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                        fontFamily: "'Space Grotesk', sans-serif",
                        color: active ? NEON : 'rgba(255,255,255,0.25)',
                        transition: 'color 0.3s',
                        position: 'relative',
                    }}>
                        {active && <span style={{ position: 'absolute', bottom: -3, left: 0, right: 0, height: '2px', backgroundColor: NEON, borderRadius: 2 }} />}
                        {label}
                    </span>
                ))}
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 min-h-0">
                <div style={{ padding: 'clamp(12px, 2vw, 24px)', display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 2vw, 20px)' }}>
                {messages.map((msg, idx) => (
                    msg.role !== 'system' && (
                        <div key={idx} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', animation: 'chatFadeIn 0.3s ease-out' }}>
                            <div style={{
                                maxWidth: 'min(85%, 600px)',
                                position: 'relative',
                                display: 'flex', flexDirection: 'column', gap: 10,
                                ...(msg.role === 'user' ? {
                                    background: 'rgba(25, 25, 25, 0.6)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    borderRadius: '20px 4px 20px 20px',
                                    padding: 'clamp(12px, 2vw, 18px) clamp(14px, 2.5vw, 22px)',
                                    color: '#e5e7eb',
                                } : {
                                    background: 'rgba(225, 255, 0, 0.03)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                                    border: `1px solid ${NEON}44`,
                                    borderRadius: '4px 20px 20px 20px',
                                    padding: 'clamp(14px, 2.5vw, 22px) clamp(16px, 3vw, 26px)',
                                    color: '#e5e7eb',
                                    boxShadow: `0 4px 30px rgba(225,255,0,0.06)`,
                                }),
                            }}>
                                {/* AI Icon */}
                                {msg.role === 'assistant' && (
                                    <div style={{
                                        position: 'absolute', top: -10, left: -10,
                                        width: 28, height: 28,
                                        backgroundColor: '#111315',
                                        border: `1.5px solid ${NEON}`,
                                        borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: `0 0 14px ${NEON}55`,
                                    }}>
                                        <BrainCircuit size={13} color={NEON} />
                                    </div>
                                )}

                                {/* Message Text */}
                                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(0.85rem, 1.4vw, 1rem)', lineHeight: 1.65, whiteSpace: 'pre-wrap', fontWeight: 400 }}>
                                    {msg.content.split('**').map((chunk, i) =>
                                        i % 2 === 1
                                            ? <strong key={i} style={{ color: '#fff', fontWeight: 700 }}>{chunk}</strong>
                                            : chunk
                                    )}
                                </div>

                                {/* Action Buttons */}
                                {msg.actions && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                                        {msg.actions.map((action, i) => (
                                            action === 'View Final Prescription' ? (
                                                <Button
                                                    key={i}
                                                    size="sm"
                                                    onClick={() => handleAction(action)}
                                                    className="bg-neon-green text-black font-black uppercase tracking-wider hover:bg-white gap-2 shadow-[0_0_24px_rgba(225,255,0,0.4)]"
                                                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                                >
                                                    <FileText size={14} /> {action}
                                                </Button>
                                            ) : (
                                                <Button
                                                    key={i}
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleAction(action)}
                                                    className="border-neon-green/40 text-neon-green bg-neon-green/8 hover:bg-neon-green hover:text-black uppercase tracking-wider text-xs font-bold"
                                                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                                >
                                                    {action}
                                                </Button>
                                            )
                                        ))}
                                        {msg.actions.includes('View Final Prescription') && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => router.push('/')}
                                                className="border-white/15 text-white bg-white/8 hover:bg-white hover:text-black uppercase tracking-wider text-xs font-bold gap-2"
                                                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                            >
                                                Restart Demo <ArrowRight size={14} strokeWidth={3} />
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {/* Selection Chips */}
                                {msg.isSelection && msg.options && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                                        {msg.options.map((opt, i) => (
                                            <Button
                                                key={i}
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleOptionClick(opt)}
                                                className="border-red-500/25 text-red-400 bg-red-500/10 hover:bg-red-500 hover:text-white gap-1.5 text-xs font-semibold"
                                                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                            >
                                                <X size={11} /> {opt}
                                            </Button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <div style={{
                            border: `1px solid ${NEON}33`, borderRadius: '4px 16px 16px 16px',
                            padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 8,
                            backgroundColor: 'rgba(225, 255, 0, 0.05)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                        }}>
                            <div style={{ display: 'flex', gap: 5 }}>
                                {[0,1,2].map(i => (
                                    <div key={i} style={{
                                        width: 7, height: 7, borderRadius: '50%', backgroundColor: NEON,
                                        animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                                    }} />
                                ))}
                            </div>
                            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, color: NEON, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                                Processing
                            </span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div style={{
                padding: 'clamp(10px, 1.5vw, 16px) clamp(12px, 2vw, 20px)',
                backgroundColor: 'transparent',
                borderTop: '1px solid rgba(255,255,255,0.07)',
                flexShrink: 0,
            }}>
                <div style={{ position: 'relative', maxWidth: 800, margin: '0 auto' }}>
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        placeholder={
                            symptomMode === 'adding' ? 'Type new symptom...' :
                            symptomMode === 'adding_diagnosis' ? 'Type diagnosis notes...' :
                            stage === 'differential' ? 'Type alternative diagnosis...' :
                            stage === 'treatment' ? 'Enter final prescription...' :
                            stage === 'safety' ? 'Type follow-up...' : '...'
                        }
                        disabled={isTyping || symptomMode === 'removing' || (stage === 'symptom_verification' && symptomMode === 'neutral') || (stage === 'differential' && symptomMode === 'neutral')}
                        rows={1}
                        style={{
                            width: '100%',
                            backgroundColor: 'rgba(25, 25, 25, 0.6)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 14, padding: 'clamp(10px,1.5vw,14px) clamp(42px,6vw,52px) clamp(10px,1.5vw,14px) clamp(12px,2vw,18px)',
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: 'clamp(0.87rem, 1.3vw, 1rem)',
                            outline: 'none', resize: 'none',
                            minHeight: 48, lineHeight: 1.5,
                            opacity: (isTyping || symptomMode === 'removing') ? 0.45 : 1,
                            transition: 'border-color 0.2s, box-shadow 0.2s',
                        }}
                        onFocus={e => { e.target.style.borderColor = `${NEON}66`; e.target.style.boxShadow = `0 0 0 3px ${NEON}14`; }}
                        onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                    />
                    <Button
                        size="icon-sm"
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping || symptomMode === 'removing'}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-neon-green text-black hover:bg-white disabled:bg-neon-green/30 disabled:text-black/40 rounded-lg"
                    >
                        <Send size={14} strokeWidth={2.5} />
                    </Button>
                </div>
            </div>

            {/* Prescription Modal */}
            {showPrescription && (
                <PrescriptionPage
                    person={person}
                    diagnosis={finalDiagnosis}
                    treatment={finalTreatment}
                    verifiedSymptoms={verifiedSymptoms}
                    onClose={() => setShowPrescription(false)}
                />
            )}

            <style>{`
                @keyframes chatFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes dotBounce { 0%, 80%, 100% { transform: translateY(0); opacity: 0.4; } 40% { transform: translateY(-6px); opacity: 1; } }
            `}</style>
        </div>
    );
};

export default ChatInterface;

