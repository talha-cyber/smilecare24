console.log('Quiz Logic (Shared): Script Block START');

const quiz = (() => {
    console.log('Quiz Logic (Shared): IIFE executing');

    const steps = [
        { id: 1, name: 'anrede', type: 'text', next: 2, required: true },
        { id: 2, name: 'alter', type: 'number', next: 3, required: true, min: 0, max: 120 },
        { id: 3, name: 'startdatum', type: 'date', next: 'description', required: true },
        { id: 4, name: 'zaehne_fehlen', type: 'radio', next: (answer) => answer === 'Ja' ? 5 : 6, required: true },
        { id: 5, name: 'anzahl_zaehne', type: 'radio', next: 6, required: true, skipIf: (answers) => answers.zaehne_fehlen !== 'Ja' },
        { id: 6, name: 'in_behandlung', type: 'radio', next: (answer) => answer === 'Ja' ? 7 : 8, required: true },
        { id: 7, name: 'behandlung_art', type: 'textarea', next: 8, required: true, skipIf: (answers) => answers.in_behandlung !== 'Ja' },
        { id: 8, name: 'personal_data', type: 'form', next: 'final', required: true, fields: [
                { name: 'vorname', selector: '#q8-vorname', required: true, type: 'text' },
                { name: 'nachname', selector: '#q8-nachname', required: true, type: 'text' },
                { name: 'strasse', selector: '#q8-strasse', required: true, type: 'text' },
                { name: 'hausnummer', selector: '#q8-hausnummer', required: true, type: 'text' },
                { name: 'plz', selector: '#q8-plz', required: true, type: 'text', pattern: /^\d{5}$/ },
                { name: 'stadt', selector: '#q8-stadt', required: true, type: 'text' },
                { name: 'email', selector: '#q8-email', required: true, type: 'email' },
                { name: 'telefon', selector: '#q8-telefon', required: true, type: 'tel', pattern: /^[0-9 +()-/]{7,}$/ },
                { name: 'iban', selector: '#q8-iban', required: true, type: 'text', pattern: /^[A-Z]{2}\d{2}[A-Z\d]{11,30}$/ },
                { name: 'datenschutz_zugestimmt', selector: '#q8-datenschutz', required: true, type: 'checkbox' }
            ]
        }
    ];

    const intermediateScreenId = 'description-screen';
    const finalScreenId = 'final-screen';
    const transitionDuration = 500; // Matches CSS transition for steps
    const userAnswers = {};
    const navigationHistory = [];
    let currentStepIndex = 0;
    let isPhase2 = false;
    let isInitialQuizLoad = true;

    function getStepElement(stepId) {
        const id = (typeof stepId === 'number') ? `step-${stepId}` : stepId;
        // Assume this operates within a #calculator element found by the init function
        const calculatorElement = document.getElementById('calculator');
        if (!calculatorElement) {
            // console.warn('Quiz Logic (Shared): #calculator element not found when trying to get step element.');
            return null;
        }
        return calculatorElement.querySelector(`#${id}`); // More robust to query within the specific calculator
    }

    function getNextButtonForStep(stepId) {
        const stepElement = getStepElement(stepId);
        return stepElement ? stepElement.querySelector('.next-button') : null;
    }

    function getBackButtonForStep(stepId) {
        const stepElement = getStepElement(stepId);
        return stepElement ? stepElement.querySelector('.back-button') : null;
    }

    function getErrorElement(stepId, fieldName = null) {
        const stepElement = getStepElement(stepId);
        if (!stepElement) {
            // console.error(`Quiz Logic (Shared): getErrorElement: stepElement not found for stepId: ${stepId}`);
            return null;
        }
        const baseId = (typeof stepId === 'number') ? `error-${stepId}` : `error-${stepId.replace('step-', '')}`;
        const elementId = fieldName ? `${baseId}-${fieldName}` : baseId;
        return stepElement.querySelector(`#${elementId}`);
    }

    function showErrorMessage(stepId, message, fieldName = null) {
        // console.log(`Quiz Logic (Shared): showErrorMessage for step ${stepId}, field '${fieldName || 'general'}', message: '${message}'`);
        const errorElement = getErrorElement(stepId, fieldName);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        } else {
            // console.error(`Quiz Logic (Shared): showErrorMessage: Error element NOT FOUND for step ${stepId}, field '${fieldName || 'general'}'`);
        }
    }

    function hideErrorMessage(stepId, fieldName = null) {
        // console.log(`Quiz Logic (Shared): hideErrorMessage for step ${stepId}, field '${fieldName || 'general'}'`);
        const errorElement = getErrorElement(stepId, fieldName);
        if (errorElement) {
            errorElement.style.display = 'none';
        }

        const currentStepConfig = steps.find(s => {
            const sId = s.id.toString();
            const stepIdStr = stepId.toString().replace('step-', '');
            return sId === stepIdStr;
        });

        if (currentStepConfig && currentStepConfig.type === 'form') {
            if (!fieldName) {
                // console.log(`Quiz Logic (Shared): Clearing all field errors for form step ${stepId}`);
                currentStepConfig.fields.forEach(field => {
                    const specificFieldError = getErrorElement(stepId, field.name);
                    if (specificFieldError) {
                        specificFieldError.style.display = 'none';
                    }
                });
            }
        }
    }

    function getInputValue(stepConfig) {
        const stepElement = getStepElement(stepConfig.id);
        if (!stepElement) return null;

        switch (stepConfig.type) {
            case 'text':
            case 'number':
            case 'date':
            case 'email':
            case 'tel':
            case 'textarea':
                const input = stepElement.querySelector(`#q${stepConfig.id}-${stepConfig.name}, textarea[name='${stepConfig.name}']`);
                return input ? input.value.trim() : null;
            case 'radio':
                const checkedRadio = stepElement.querySelector(`input[name='${stepConfig.name}']:checked`);
                return checkedRadio ? checkedRadio.value : null;
            case 'form':
                const formData = {};
                stepConfig.fields.forEach(field => {
                    const inputEl = stepElement.querySelector(field.selector);
                    if (field.type === 'checkbox') {
                        formData[field.name] = inputEl ? inputEl.checked : false;
                    } else {
                        formData[field.name] = inputEl ? inputEl.value.trim() : '';
                    }
                });
                return formData;
            default:
                return null;
        }
    }

    function validateInput(value, config) {
        if (config.required && (value === null || value === '')) {
            return "__REQUIRED_EMPTY__";
        }
        if (!config.required && (value === null || value === '')) return null;

        let typeForValidation = config.validation || config.type;
        if (config.selector) {
            if (config.selector.includes('[type="number"]')) typeForValidation = 'number';
            else if (config.selector.includes('[type="email"]')) typeForValidation = 'email';
            else if (config.selector.includes('[type="date"]')) typeForValidation = 'date';
            else if (config.selector.includes('[type="tel"]')) typeForValidation = 'tel';
        }

        switch (typeForValidation) {
            case 'number':
                if (isNaN(value) || value === '') return 'Bitte gib eine gültige Zahl ein.';
                const num = Number(value);
                if (config.min !== undefined && num < config.min) return `Wert muss mindestens ${config.min} sein.`;
                if (config.max !== undefined && num > config.max) return `Wert darf maximal ${config.max} sein.`;
                break;
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) return 'Bitte gib eine gültige E-Mail Adresse ein.';
                break;
            case 'date':
                let validatedValue = value;
                if (/^(\d{2})\.(\d{2})\.(\d{4})$/.test(value)) {
                    const parts = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
                    if (parts) {
                        validatedValue = `${parts[3]}-${parts[2]}-${parts[1]}`;
                    }
                }
                if (validatedValue && validatedValue !== '') {
                    const selectedDate = new Date(validatedValue);
                    if (isNaN(selectedDate.getTime())) {
                        return 'Ungültiges Datum. Bitte überprüfe Deine Eingabe.';
                    }
                }
                break;
            case 'tel':
                const telPattern = config.pattern || /^[0-9\s+()\/]{7,}$/;
                if (!telPattern.test(value)) return 'Ungültiges Telefonnummernformat.';
                break;
            case 'text':
                if (config.pattern && !config.pattern.test(value)) {
                    if (config.name === 'plz') return 'PLZ muss 5 Ziffern haben.';
                    if (config.name === 'iban') return 'Ungültige IBAN. Format: DE12345678901234567890';
                    return 'Eingabe entspricht nicht dem erwarteten Format.';
                }
                break;
            case 'checkbox':
                if (config.required && !value) {
                    return 'Diese Zustimmung ist erforderlich.';
                }
                break;
        }
        return null;
    }

    function validateStep(stepConfig) {
        let overallStepIsValid = true;
        hideErrorMessage(stepConfig.id);

        if (stepConfig.type === 'form') {
            const currentValues = getInputValue(stepConfig);
            stepConfig.fields.forEach(field => {
                const valueToValidate = currentValues[field.name];
                hideErrorMessage(stepConfig.id, field.name);
                const error = validateInput(valueToValidate, field);
                if (error) {
                    if (error !== "__REQUIRED_EMPTY__") {
                        showErrorMessage(stepConfig.id, error, field.name);
                    }
                    overallStepIsValid = false;
                }
            });
            if (overallStepIsValid) {
                userAnswers[stepConfig.name] = currentValues;
            }
        } else {
            const value = getInputValue(stepConfig);
            const error = validateInput(value, stepConfig);
            if (error) {
                if (error !== "__REQUIRED_EMPTY__") {
                    showErrorMessage(stepConfig.id, error);
                }
                overallStepIsValid = false;
            } else {
                userAnswers[stepConfig.name] = value;
            }
        }
        return overallStepIsValid;
    }

    function checkStepCompletion(stepConfig) {
        const stepElement = getStepElement(stepConfig.id);
        const nextButton = getNextButtonForStep(stepConfig.id);
        if (!stepElement || !nextButton) return;

        let isComplete = false;
        if (stepConfig.type === 'form') {
            isComplete = true;
            const currentValues = getInputValue(stepConfig);
            stepConfig.fields.forEach(field => {
                if (field.required) {
                    if (field.type === 'checkbox') {
                        if (!currentValues[field.name]) {
                            isComplete = false;
                        }
                    } else {
                        if (!currentValues[field.name]) {
                            isComplete = false;
                        }
                    }
                }
            });
        } else {
            const value = getInputValue(stepConfig);
            isComplete = (value !== null && value !== '');
            if (stepConfig.type === 'number' && stepConfig.required && value === '0') {
                isComplete = true;
            }
        }
        nextButton.disabled = !isComplete;
    }

    function showStep(stepIdToShow) {
        const stepElement = getStepElement(stepIdToShow);
        if (stepElement) {
            const calculatorElement = document.getElementById('calculator');
            if (calculatorElement) {
                 calculatorElement.querySelectorAll('.step').forEach(s => {
                    if (s.id !== stepIdToShow) { // Simplified: if it's not the current step, hide it
                        s.classList.add('hidden');
                    }
                });
            }


            hideErrorMessage(stepIdToShow);
            stepElement.classList.remove('hidden');

            if (navigationHistory[navigationHistory.length - 1] !== stepIdToShow) {
                navigationHistory.push(stepIdToShow);
            }

            const backButton = getBackButtonForStep(stepIdToShow);
            if (backButton) {
                backButton.disabled = navigationHistory.length <= 1;
            }

            let currentConfig = steps.find(s => s.id.toString() === stepIdToShow.toString() || `step-${s.id}` === stepIdToShow);
            if (!currentConfig && (stepIdToShow === intermediateScreenId || stepIdToShow === finalScreenId)) {
                // Special screen
            }

            if (currentConfig && typeof currentConfig === 'object') {
                checkStepCompletion(currentConfig);
            } else if (stepIdToShow === intermediateScreenId) {
                const nextButton = getNextButtonForStep(intermediateScreenId);
                if(nextButton) nextButton.disabled = false;
            } else if (stepIdToShow === finalScreenId){
                const nextButton = getNextButtonForStep(finalScreenId);
                if(nextButton) nextButton.disabled = true;
            }

            const firstInput = stepElement.querySelector('input:not([type=radio]):not([disabled]), textarea:not([disabled])');
            if (firstInput && !isInitialQuizLoad) {
                setTimeout(() => firstInput.focus(), 50);
            }
            if (isInitialQuizLoad) {
                isInitialQuizLoad = false;
            }
        }
    }

    function hideStep(stepIdToHide) {
        const stepElement = getStepElement(stepIdToHide);
        if (stepElement) {
            stepElement.classList.add('hidden');
        }
    }

    function updateDescriptionScreen() {
        let calculatedPrice = 25;
        let tarifOption = "Basis-Schutz";
        const benefits = [
            "Regelmäßige Zahnreinigung",
            "Füllungen und Inlays",
            "Wurzelbehandlungen"
        ];

        if (userAnswers.alter) {
            const age = parseInt(userAnswers.alter, 10);
            if (age > 50) calculatedPrice += 10;
            if (age > 65) calculatedPrice += 15;
        }

        const descScreen = getStepElement(intermediateScreenId);
        if (!descScreen) return;

        const tarifOptionEl = descScreen.querySelector('#tarif-option');
        const tarifPriceEl = descScreen.querySelector('#tarif-price');
        const benefitListEl = descScreen.querySelector('#benefit-list');

        if(tarifOptionEl) tarifOptionEl.textContent = tarifOption;
        if(tarifPriceEl) tarifPriceEl.textContent = calculatedPrice;
        if(benefitListEl) {
            benefitListEl.innerHTML = '';
            benefits.forEach(benefit => {
                const li = document.createElement('li');
                li.textContent = benefit;
                benefitListEl.appendChild(li);
            });
        }
        userAnswers.calculated_tarif_price = calculatedPrice;
        userAnswers.calculated_tarif_option = tarifOption;
    }

    function nextStep() {
        // console.log('Quiz Logic (Shared): quiz.nextStep() called. Current step index:', currentStepIndex);
        const descriptionScreenElement = getStepElement(intermediateScreenId);
        if (descriptionScreenElement && !descriptionScreenElement.classList.contains('hidden')) {
            hideStep(intermediateScreenId);
            setTimeout(() => {
                const phase2StartIndex = steps.findIndex(step => step.id === 4);
                if (phase2StartIndex !== -1) {
                    currentStepIndex = phase2StartIndex;
                    showStep(`step-${steps[currentStepIndex].id}`); // Ensure step prefix
                }
            }, transitionDuration);
            return;
        }

        const currentConfig = steps[currentStepIndex];
        if (!currentConfig) {
            // console.error('Quiz Logic (Shared): No currentConfig found in nextStep() for index:', currentStepIndex);
            return;
        }

        const currentId = currentConfig.id;
        if (currentConfig.required) {
            if (!validateStep(currentConfig)) {
                return;
            }
        }

        if (userAnswers[currentConfig.name] === undefined || (currentConfig.type === 'form' && validateStep(currentConfig))) {
            userAnswers[currentConfig.name] = getInputValue(currentConfig);
        }

        hideStep(`step-${currentId}`); // Ensure step prefix

        let nextStepId = null;
        if (typeof currentConfig.next === 'function') {
            const currentAnswer = userAnswers[currentConfig.name];
            nextStepId = currentConfig.next(currentAnswer);
        } else {
            nextStepId = currentConfig.next;
        }

        setTimeout(() => {
            if (nextStepId === 'description') {
                updateDescriptionScreen();
                showStep(intermediateScreenId);
                isPhase2 = true;
            } else if (nextStepId === 'final') {
                showStep(finalScreenId);
                const webAppUrl = 'https://script.google.com/macros/s/AKfycbxgnpai_J_4oaXf_Xzi09c_WX1lwjLxJfsNlTrNBzFooXbK5lySLLaVTBpATS3ejFfkWw/exec';
                // console.log('Quiz Logic (Shared): Sending userAnswers:', JSON.parse(JSON.stringify(userAnswers)));
                fetch(webAppUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({ data: JSON.stringify(userAnswers) })
                })
                .then(response => response.json())
                .then(data => {
                    // if (data.status === 'success') {
                    //     console.log('Quiz data submitted successfully to Google Sheet (Shared Logic):', userAnswers);
                    // } else {
                    //     console.error('Error reported by Google Apps Script (Shared Logic):', data.message || 'Unknown error', userAnswers);
                    // }
                })
                .catch((error) => {
                    // console.error('Error submitting quiz data to Google Sheet (Shared Logic):', error, userAnswers);
                });
            } else {
                let nextNumericId = parseInt(nextStepId, 10);
                let nextIndex = steps.findIndex(step => step.id === nextNumericId);

                while (nextIndex !== -1 && steps[nextIndex].skipIf && steps[nextIndex].skipIf(userAnswers)) {
                    const skippedConfig = steps[nextIndex];
                    if (typeof skippedConfig.next === 'function') {
                        const answerForSkipLogic = userAnswers[skippedConfig.name] || getInputValue(skippedConfig);
                        nextStepId = skippedConfig.next(answerForSkipLogic);
                    } else {
                        nextStepId = skippedConfig.next;
                    }
                    nextNumericId = parseInt(nextStepId, 10);
                    nextIndex = steps.findIndex(step => step.id === nextNumericId);
                }


                if (nextStepId === 'description') {
                    updateDescriptionScreen();
                    showStep(intermediateScreenId);
                    isPhase2 = true;
                } else if (nextStepId === 'final') {
                    showStep(finalScreenId);
                     const webAppUrl = 'https://script.google.com/macros/s/AKfycbxgnpai_J_4oaXf_Xzi09c_WX1lwjLxJfsNlTrNBzFooXbK5lySLLaVTBpATS3ejFfkWw/exec';
                    // console.log('Quiz Logic (Shared): Sending userAnswers (after skip):', JSON.parse(JSON.stringify(userAnswers)));
                    fetch(webAppUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: new URLSearchParams({ data: JSON.stringify(userAnswers) })
                    })
                    .then(response => response.json())
                    .then(data => {
                        // if (data.status === 'success') {
                        //     console.log('Quiz data submitted successfully to Google Sheet (Shared Logic, skip):', userAnswers);
                        // } else {
                        //     console.error('Error reported by Google Apps Script (Shared Logic, skip):', data.message || 'Unknown error', userAnswers);
                        // }
                    })
                    .catch((error) => {
                        // console.error('Error submitting quiz data to Google Sheet (Shared Logic, skip):', error, userAnswers);
                    });
                } else if (nextIndex !== -1) {
                    currentStepIndex = nextIndex;
                    showStep(`step-${steps[currentStepIndex].id}`); // Ensure step prefix
                }
            }
        }, transitionDuration);
    }

    function previousStep() {
        // console.log('Quiz Logic (Shared): quiz.previousStep() called');
        if (navigationHistory.length <= 1) return;

        const currentStepIdFromHistory = navigationHistory.pop();
        const previousStepId = navigationHistory[navigationHistory.length - 1];

        if (!previousStepId) {
            navigationHistory.push(currentStepIdFromHistory);
            return;
        }

        hideStep(currentStepIdFromHistory); // currentStepIdFromHistory is already like "step-X" or "description-screen"

        // Determine the index for the previous step
        let previousIndex = steps.findIndex(s => `step-${s.id}` === previousStepId || s.id.toString() === previousStepId);


        if (previousStepId === intermediateScreenId) {
            // If going back to description screen, find the step that leads to it.
            // This logic might need review based on actual navigation flow for description screen.
            // For now, just show it. currentStepIndex will be set when navigating *from* it.
        } else if (previousIndex !== -1) {
             currentStepIndex = previousIndex;
        } else {
             // Fallback or if previousStepId is a special screen not in `steps` numerically
             currentStepIndex = 0; // Default to first step if lost
        }
        
        if (previousStepId === intermediateScreenId || previousStepId === finalScreenId) {
             isPhase2 = (previousStepId === intermediateScreenId || navigationHistory.some(id => steps.findIndex(s => `step-${s.id}` === id && s.id >=4) !== -1) );
        } else if (previousIndex !== -1) {
            isPhase2 = steps[previousIndex].id >= 4;
        }


        showStep(previousStepId);
    }

    function initQuiz() {
        console.log('Quiz Logic (Shared): initQuiz() called');
        steps.forEach(stepConfig => {
            const stepElement = getStepElement(`step-${stepConfig.id}`); // Ensure step prefix
            if (!stepElement) return;

            const nextBtn = getNextButtonForStep(`step-${stepConfig.id}`);
            const backBtn = getBackButtonForStep(`step-${stepConfig.id}`);

            if (nextBtn) {
                nextBtn.removeAttribute('onclick');
                nextBtn.addEventListener('click', nextStep);
            }
            if (backBtn) {
                backBtn.removeAttribute('onclick');
                backBtn.addEventListener('click', previousStep);
            }

            const handleEnterKey = (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    if (nextBtn && !nextBtn.disabled) {
                        nextBtn.click();
                    }
                }
            };

            if (stepConfig.type === 'form') {
                stepConfig.fields.forEach(field => {
                    const input = stepElement.querySelector(field.selector);
                    if (input) {
                        input.addEventListener('input', () => checkStepCompletion(stepConfig));
                        input.addEventListener('blur', () => validateStep(stepConfig));
                        input.addEventListener('keydown', handleEnterKey);
                    }
                });
            } else if (stepConfig.type === 'radio') {
                const radios = stepElement.querySelectorAll(`input[name='${stepConfig.name}']`);
                radios.forEach(radio => {
                    radio.addEventListener('change', () => {
                        const labels = stepElement.querySelectorAll('.options label');
                        labels.forEach(lbl => lbl.classList.remove('checked-label'));
                        if (radio.checked) {
                            const parentLabel = radio.closest('label');
                            if (parentLabel) parentLabel.classList.add('checked-label');
                        }
                        checkStepCompletion(stepConfig);
                    });
                });
            } else {
                const input = stepElement.querySelector(`#q${stepConfig.id}-${stepConfig.name}, textarea[name='${stepConfig.name}']`);
                if (input) {
                    input.addEventListener('input', () => checkStepCompletion(stepConfig));
                    input.addEventListener('blur', () => validateStep(stepConfig));
                    input.addEventListener('keydown', handleEnterKey);
                }
            }
        });

        const descNextBtn = getNextButtonForStep(intermediateScreenId);
        const descBackBtn = getBackButtonForStep(intermediateScreenId);

        if (descNextBtn) {
            descNextBtn.removeAttribute('onclick');
            descNextBtn.addEventListener('click', nextStep);
        }
        if (descBackBtn) {
            descBackBtn.removeAttribute('onclick');
            descBackBtn.addEventListener('click', previousStep);
        }

        if (steps.length > 0) {
            const firstStepId = `step-${steps[0].id}`;
            navigationHistory.push(firstStepId); // Push initial step to history
            showStep(firstStepId);
        }
    }

    // Expose only initQuiz, nextStep, and previousStep if they are called from HTML onclicks
    // Since onclicks are removed and event listeners are used, only initQuiz needs to be exposed
    // However, if any HTML still has onclick="quiz.nextStep()", those need to be exposed.
    // The current plan removes onclicks, so only initQuiz is strictly needed.
    // But for safety or future direct calls, exposing them is fine.
    return {
        initQuiz: initQuiz,
        nextStep: nextStep,       // Keep exposed if any inline onlick attributes remain or for debugging
        previousStep: previousStep // Keep exposed if any inline onlick attributes remain or for debugging
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    // console.log('Quiz Logic (Shared): DOMContentLoaded event fired.');
    if (document.getElementById('calculator')) { // Check if the quiz container exists
        if (quiz && typeof quiz.initQuiz === 'function') {
            // console.log('Quiz Logic (Shared): #calculator found, initializing quiz.');
            quiz.initQuiz();
        } else {
            console.error('Quiz Logic (Shared): quiz object or quiz.initQuiz function not found.');
        }
    } else {
        // console.log('Quiz Logic (Shared): No #calculator element found on this page. Quiz not initialized.');
    }
});

console.log('Quiz Logic (Shared): Script Block END'); 