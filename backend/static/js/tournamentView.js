import { getCurrentLanguage, translations } from "./appstate.js";

function translate(key) {
    var currentLanguage = getCurrentLanguage();
    return translations[key][currentLanguage];
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('viewTournamentButton').addEventListener('click', function() {
        const tournamentId = document.getElementById('tournamentViewInput').value.trim();
        if (tournamentId) {
            loadTournamentVisualization(tournamentId);
        } else {
            alert(translate('Please enter a valid tournament ID'));
        }
    })
});

function loadTournamentVisualization(tournamentId) {
    const accessToken = localStorage.getItem('access');

    fetch(`https://${host}/api/tournaments/${tournamentId}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json'
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to retrieve tournament data');
        }
        return response.json();
    })
    .then(data => {
        renderTournamentBracket(data);
    })
    .catch(error => {
        console.error('Error TournamentView:', error);
    });
}

function renderTournamentBracket(data) {
    const tournamenViewDiv = document.getElementById('tournamentView');
    tournamenViewDiv.innerHTML = '';

    const title = document.createElement('h2');
    title.textContent = `Tournament Bracket for ${data.name}`;
    tournamenViewDiv.appendChild(title);

    const creationDate = new Date(data.start_date);
    const formattedDate = creationDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
                            + ' '
                            + creationDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    const dateParagraph = document.createElement('p');
    dateParagraph.textContent = `Created on: ${formattedDate}`;
    tournamenViewDiv.appendChild(dateParagraph);

    // Tournament matches
}