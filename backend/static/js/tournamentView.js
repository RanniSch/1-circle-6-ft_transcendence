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
        document.getElementById('tournamentViewInput').value = '';
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

        // verify if final match should be set up
        if (data.status === 'Finals' || data.status === 'Ongoing') {
            const finalMatch = data.matches.find(match => match.match_round === 2);
            if (!finalMatch) {
                setupFinalMatch(tournamentId);
            } else if (finalMatch && finalMatch.status === 'Completed') {
                updateTournamentFinished(tournamentId);
            }
        }
    })
    .catch(error => {
        console.error('Error TournamentView:', error);
    });
}

function shouldSetupFinalMatch(tournamentData) {
    const firstRoundMatches = tournamentData.matches.filter(match => match.match_round === 1).every(match => match.status === 'Completed');
    return firstRoundMatches;
}

function setupFinalMatch(tournamentId) {
    const accessToken = localStorage.getItem('access');

    fetch(`https://${host}/api/tournaments/${tournamentId}/setup-final/`, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json'
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to setup final match');
        }
        return response.json();
    })
    .then(data => {
        console.log('Final match setup successfully:', data);
        loadTournamentVisualization(tournamentId);
    })
    .catch(error => {
        console.error('Error setting up final match:', error);
    });
}

function renderTournamentBracket(data) {
    const tournamenViewDiv = document.getElementById('tournamentView');
    tournamenViewDiv.innerHTML = '';

    const title = document.createElement('h2');
    title.textContent = `Tournament Bracket for ${data.name}`;
    tournamenViewDiv.classList.add('tournamentInfo');
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
        const firstRoundMatches = data.matches.filter(match => match.match_round === 1);
        if (firstRoundMatches.length > 0) {
            const matchesTitle = document.createElement('h3');
            matchesTitle.textContent = 'First Round:';
            tournamenViewDiv.appendChild(matchesTitle);

            const matchesList = document.createElement('ul');
            firstRoundMatches.forEach(match => {
                const matchItem = document.createElement('li');
                matchItem.textContent = `${match.player1_username} vs ${match.player2_username} - ${new Date(match.scheduled_time).toLocaleString('de-DE')}`;
                matchesList.appendChild(matchItem);
            });
            tournamenViewDiv.appendChild(matchesList);
        } else {
            const noMatches = document.createElement('p');
            noMatches.textContent = 'No first Round matches scheduled yet.';
            tournamenViewDiv.appendChild(noMatches);
        }
        const finalMatches = data.matches.filter(match => match.match_round === 2);
        if (finalMatches.length > 0) {
            const matchesTitleFinal = document.createElement('h3');
            matchesTitleFinal.textContent = 'Final:';
            tournamenViewDiv.appendChild(matchesTitleFinal);

            const matchesListFinal = document.createElement('ul');
            finalMatches.forEach(match => {
                const matchItem = document.createElement('li');
                matchItem.textContent = `${match.player1_username} vs ${match.player2_username} - ${new Date(match.scheduled_time).toLocaleString('de-DE')}`;
                matchesListFinal.appendChild(matchItem);
            });
            tournamenViewDiv.appendChild(matchesListFinal);
        } else {
            const noFinalMatches = document.createElement('p');
            noFinalMatches.textContent = 'No final match scheduled yet.';
            tournamenViewDiv.appendChild(noFinalMatches);
        }
    } else {
        const noMatches = document.createElement('p');
        noMatches.textContent = 'No matches scheduled yet.';
        tournamenViewDiv.appendChild(noMatches);
    }

    // Tournament winner
    if (data.status === 'Completed') {
        const finale = data.matches.filter(match => match.match_round === 2 && match.status === 'Completed');
        if (finale) {
            const winnerTitle = document.createElement('h3');
            winnerTitle.textContent = 'Tournament Winner:';
            tournamenViewDiv.appendChild(winnerTitle);

            const winnerName = document.createElement('p');
            winnerName.textContent = finale.winner_username ? `Congratulations ${finalMatch.winner_username}!` : 'No winner yet.';
            tournamenViewDiv.appendChild(winnerName);
        } else {
            const noWinner = document.createElement('p');
            noWinner.textContent = 'No winner yet.';
            tournamenViewDiv.appendChild(noWinner);
        }
    }
}