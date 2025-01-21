// Navigare între pași
let currentStep = 1;

// Funcție pentru a naviga între pași
function goToStep(stepNumber, cabinaType = null) {
    const steps = document.querySelectorAll('.step');
    steps.forEach(step => step.classList.remove('active')); // Ascunde toți pașii

    // Afișează pasul selectat
    const currentStepElement = document.getElementById(`step-${stepNumber}`);
    if (currentStepElement) {
        currentStepElement.classList.add('active');
    }

    // Salvează tipul de cabină selectat (dacă există)
    if (cabinaType) {
        sessionStorage.setItem('selectedCabinaType', cabinaType);
    }

    currentStep = stepNumber;
}

// Funcție pentru a popula dropdown-uri din baza de date
function populateDropdowns() {
    const endpoints = {
        feroneriaSelect: 'balamale', // Exemplu: pentru tabelul 'balamale'
        finisajSelect: 'profile',    // Exemplu: pentru tabelul 'profile'
    };

    Object.keys(endpoints).forEach(dropdownId => {
        const url = `/api/${endpoints[dropdownId]}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                const dropdown = document.getElementById(dropdownId);
                if (dropdown) {
                    dropdown.innerHTML = ''; // Curăță opțiunile existente
                    data.forEach(item => {
                        const option = document.createElement('option');
                        option.value = item.CodProdus;
                        option.textContent = `${item.CodProdus} - ${item.Denumire}`;
                        dropdown.appendChild(option);
                    });
                }
            })
            .catch(error => {
                console.error(`Eroare la popularea dropdown-ului ${dropdownId}:`, error);
            });
    });
}

// Finalizează configurarea
function finalizeConfiguration() {
    const feroneria = document.getElementById('feroneriaSelect').value;
    const finisajul = document.getElementById('finisajSelect').value;
    const dimensiunile = document.getElementById('dimensionsInput').value;

    if (!feroneria || !finisajul || !dimensiunile) {
        alert('Vă rugăm să completați toate informațiile!');
        return;
    }

    const selectedCabinaType = sessionStorage.getItem('selectedCabinaType');

    alert(`
        Configurație finalizată:
        - Tip Cabina: ${selectedCabinaType}
        - Feronerie: ${feroneria}
        - Finisaj: ${finisajul}
        - Dimensiuni: ${dimensiunile}
    `);

    // Poți trimite datele la server folosind un apel POST
    const data = {
        cabinaType: selectedCabinaType,
        feroneria,
        finisajul,
        dimensiunile,
    };

    fetch('/api/saveConfiguration', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(result => {
            console.log('Configurație salvată:', result);
        })
        .catch(error => {
            console.error('Eroare la salvarea configurației:', error);
        });
}

// Încarcă dropdown-urile la pornirea paginii
document.addEventListener('DOMContentLoaded', () => {
    populateDropdowns(); // Populează dropdown-urile din baza de date
    goToStep(1); // Începe de la pasul 1
});
