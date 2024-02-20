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

    // participants list
    if (data.participants && data.participants.length) {
        const participantTitle = document.createElement('h3');
        participantTitle.textContent = 'Participants:';
        tournamenViewDiv.appendChild(participantTitle);
        
        const participantList = document.createElement('ul');
        data.participants.forEach(participantId => {
            const participantItem = document.createElement('li');
            participantItem.textContent = participantId;
            participantList.appendChild(participantItem);
        });
        tournamenViewDiv.appendChild(participantList);
    } else {
        const noParticipants = document.createElement('p');
        noParticipants.textContent = 'No participants yet.';
        tournamenViewDiv.appendChild(noParticipants);
    }

    // Tournament matches
    if (data.matches && data.matches.length) {
        const matchesTitle = document.createElement('h3');
        matchesTitle.textContent = 'Matches:';
        tournamenViewDiv.appendChild(matchesTitle);

        const matchesList = document.createElement('ul');
        data.matches.forEach(match => {
            const matchItem = document.createElement('li');
            matchItem.textContent = `${match.player1_username} vs ${match.player2_username} - ${new Date(match.scheduled_time).toLocaleString('de-DE')}`;
            matchesList.appendChild(matchItem);
        });
        tournamenViewDiv.appendChild(matchesList);
    } else {
        const noMatches = document.createElement('p');
        noMatches.textContent = 'No matches scheduled yet.';
        tournamenViewDiv.appendChild(noMatches);
    }
}