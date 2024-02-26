const appState = {
    isLoggedIn: false,
    userProfile: null,
    notifications: [],
    userList: [],
};

const listeners = [];

export function subscribe(listener) {
    listeners.push(listener);
}

export function notifyListeners() {
    listeners.forEach(listener => listener());
}

export function updateLoginStatus(playerId, isLoggedIn) {
    const accessToken = localStorage.getItem('access');
    fetch(`https://${host}/api/update-login-status/`, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            player_id: playerId,
            is_logged_in: isLoggedIn
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to update login status');
        }
    })
    .catch(error => {
        console.error('Error updating login status:', error);
    });
}

export function getCurrentLanguage() {
    return document.getElementById('languageCode').getAttribute('data-language');
}

export var translations = {
    'Invalid username or password' : {
        "en": "Invalid username or password",
        "de": "Ungültiger Benutzername oder Passwort",
        "fr": "Nom d'utilisateur ou mot de passe invalide",
        "es": "Nombre de usuario o contraseña inválidos",
        "it": "Nome utente o password non validi",
    },

    'Invalid two-factor authentication code!' : {
        'en': 'Invalid two-factor authentication code!',
        'de': 'Ungültiger Zwei-Faktor-Authentifizierungscode!',
        'fr': 'Code d\'authentification à deux facteurs invalide!',
        'es': '¡Código de autenticación de dos factores inválido!',
        'it': 'Codice di autenticazione a due fattori non valido!',
    },

    'Failed to update login status' : {
        'en': 'Failed to update login status',
        'de': 'Fehler beim Aktualisieren des Anmeldestatus',
        'fr': 'Échec de la mise à jour du statut de connexion',
        'es': 'Error al actualizar el estado de inicio de sesión',
        'it': 'Aggiornamento dello stato di accesso non riuscito',
    },

    'Not authorized' : {
        'en': 'Not authorized',
        'de': 'Nicht autorisiert',
        'fr': 'Non autorisé',
        'es': 'No autorizado',
        'it': 'Non autorizzato',
    },

    'No access token found' : {
        'en': 'No access token found',
        'de': 'Kein Zugriffstoken gefunden',
        'fr': 'Aucun jeton d\'accès trouvé',
        'es': 'No se encontró ningún token de acceso',
        'it': 'Nessun token di accesso trovato',
    },

    'Logout failed!' : {
        'en': 'Logout failed!',
        'de': 'Abmeldung fehlgeschlagen!',
        'fr': 'Échec de la déconnexion!',
        'es': '¡Error al cerrar sesión!',
        'it': 'Disconnessione fallita!',
    },

    'Logout successful!' : {
        'en': 'Logout successful!',
        'de': 'Abmeldung erfolgreich!',
        'fr': 'Déconnexion réussie!',
        'es': '¡Cierre de sesión exitoso!',
        'it': 'Disconnessione riuscita!',
    },

    'Error during Logout:' : {
        'en': 'Error during Logout:',
        'de': 'Fehler beim Abmelden:',
        'fr': 'Erreur pendant la déconnexion:',
        'es': 'Error durante el cierre de sesión:',
        'it': 'Errore durante la disconnessione:',
    },

    'No access token found. You are not logged in!' : {
        'en': 'No access token found. You are not logged in!',
        'de': 'Kein Zugriffstoken gefunden. Sie sind nicht angemeldet!',
        'fr': 'Aucun jeton d\'accès trouvé. Vous n\'êtes pas connecté!',
        'es': '¡No se encontró ningún token de acceso. ¡No has iniciado sesión!',
        'it': 'Nessun token di accesso trovato. Non sei connesso!',
    },

    'Profile could not be fetched!' : {
        'en': 'Profile could not be fetched!',
        'de': 'Profil konnte nicht abgerufen werden!',
        'fr': 'Le profil n\'a pas pu être récupéré!',
        'es': '¡No se pudo obtener el perfil!',
        'it': 'Profilo non poteva essere recuperato!',
    },

    'Match history could not be fetched!' : {
        'en': 'Match history could not be fetched!',
        'de': 'Spielverlauf konnte nicht abgerufen werden!',
        'fr': 'L\'historique des matchs n\'a pas pu être récupéré!',
        'es': '¡No se pudo obtener el historial de partidas!',
        'it': 'Cronologia delle partite non poteva essere recuperata!',
    },

    'Show Match History' : {
        'en': 'Show Match History',
        'de': 'Spielverlauf anzeigen',
        'fr': 'Afficher l\'historique des matchs',
        'es': 'Mostrar historial de partidas',
        'it': 'Mostra cronologia delle partite',
    },

    'Match History' : {
        'en': 'Match History',
        'de': 'Spielverlauf',
        'fr': 'Historique des matchs',
        'es': 'Historial de partidas',
        'it': 'Cronologia delle partite',
    },

    'Hide Match History' : {
        'en': 'Hide Match History',
        'de': 'Spielverlauf ausblenden',
        'fr': 'Masquer l\'historique des matchs',
        'es': 'Ocultar historial de partidas',
        'it': 'Nascondi cronologia delle partite',
    },

    'Notifications could not be fetched!' : {
        'en': 'Notifications could not be fetched!',
        'de': 'Benachrichtigungen konnten nicht abgerufen werden!',
        'fr': 'Les notifications n\'ont pas pu être récupérées!',
        'es': '¡No se pudieron obtener las notificaciones!',
        'it': 'Le notifiche non potevano essere recuperate!',
    },

    'Notifications could not be marked as read!' : {
        'en': 'Notifications could not be marked as read!',
        'de': 'Benachrichtigungen konnten nicht als gelesen markiert werden!',
        'fr': 'Les notifications n\'ont pas pu être marquées comme lues!',
        'es': '¡No se pudieron marcar las notificaciones como leídas!',
        'it': 'Le notifiche non potevano essere contrassegnate come lette!',
    },

    'Notification marked as read!' : {
        'en': 'Notification marked as read!',
        'de': 'Benachrichtigung als gelesen markiert!',
        'fr': 'Notification marquée comme lue!',
        'es': '¡Notificación marcada como leída!',
        'it': 'Notifica contrassegnata come letta!',
    },

    'No email found' : {
        'en': 'No email found',
        'de': 'Keine E-Mail gefunden',
        'fr': 'Aucun e-mail trouvé',
        'es': 'No se encontró ningún correo electrónico',
        'it': 'Nessuna email trovata',
    },

    'No Username found' : {
        'en': 'No Username found',
        'de': 'Kein Benutzername gefunden',
        'fr': 'Aucun nom d\'utilisateur trouvé',
        'es': 'No se encontró ningún nombre de usuario',
        'it': 'Nessun nome utente trovato',
    },

    'No games won' : {
        'en': 'No games won',
        'de': 'Keine Spiele gewonnen',
        'fr': 'Aucun jeu gagné',
        'es': 'No se han ganado juegos',
        'it': 'Nessun gioco vinto',
    },

    'No games lost' : {
        'en': 'No games lost',
        'de': 'Keine Spiele verloren',
        'fr': 'Aucun jeu perdu',
        'es': 'No se han perdido juegos',
        'it': 'Nessun gioco perso',
    },

    'No games tied' : {
        'en': 'No games tied',
        'de': 'Keine Spiele unentschieden',
        'fr': 'Aucun jeu égalisé',
        'es': 'No se han empatado juegos',
        'it': 'Nessun gioco pareggiato',
    },

    'No file input found!' : {
        'en': 'No file input found!',
        'de': 'Keine Dateieingabe gefunden!',
        'fr': 'Aucune entrée de fichier trouvée!',
        'es': '¡No se encontró ninguna entrada de archivo!',
        'it': 'Nessun input file trovato!',
    },

    'Avatar could not be uploaded!' : {
        'en': 'Avatar could not be uploaded!',
        'de': 'Avatar konnte nicht hochgeladen werden!',
        'fr': 'L\'avatar n\'a pas pu être téléchargé!',
        'es': '¡No se pudo subir el avatar!',
        'it': 'L\'avatar non poteva essere caricato!',
    },

    'Success: Avatar was updated!' : {
        'en': 'Success: Avatar was updated!',
        'de': 'Erfolg: Avatar wurde aktualisiert!',
        'fr': 'Succès: l\'avatar a été mis à jour!',
        'es': '¡Éxito: ¡El avatar fue actualizado!',
        'it': 'Successo: l\'avatar è stato aggiornato!',
    },

    'Are you sure you want to delete your account?\nThis cannot be reversed and all your data will be lost!' : {
        'en': 'Are you sure you want to delete your account?\nThis cannot be reversed and all your data will be lost!',
        'de': 'Sind Sie sicher, dass Sie Ihr Konto löschen möchten?\nDies kann nicht rückgängig gemacht werden und alle Ihre Daten gehen verloren!',
        'fr': 'Êtes-vous sûr de vouloir supprimer votre compte?\nCela ne peut pas être inversé et toutes vos données seront perdues!',
        'es': '¿Estás seguro de que quieres eliminar tu cuenta?\n¡Esto no se puede revertir y se perderán todos tus datos!',
        'it': 'Sei sicuro di voler eliminare il tuo account?\nQuesto non può essere invertito e tutti i tuoi dati andranno persi!',
    },

    'Please type DELETE to confirm account deletion:' : {
        'en': 'Please type DELETE to confirm account deletion:',
        'de': 'Bitte geben Sie DELETE ein, um die Löschung des Kontos zu bestätigen:',
        'fr': 'Veuillez taper DELETE pour confirmer la suppression du compte:',
        'es': 'Por favor, escriba DELETE para confirmar la eliminación de la cuenta:',
        'it': 'Si prega di digitare DELETE per confermare l\'eliminazione dell\'account:',
    },

    'Account deletion cancelled!' : {
        'en': 'Account deletion cancelled!',
        'de': 'Kontolöschung abgebrochen!',
        'fr': 'Suppression du compte annulée!',
        'es': '¡Eliminación de cuenta cancelada!',
        'it': 'Eliminazione dell\'account annullata!',
    },

    'Account could not be deleted!' : {
        'en': 'Account could not be deleted!',
        'de': 'Konto konnte nicht gelöscht werden!',
        'fr': 'Le compte n\'a pas pu être supprimé!',
        'es': '¡No se pudo eliminar la cuenta!',
        'it': 'L\'account non poteva essere eliminato!',
    },

    'Account deleted!' : {
        'en': 'Account deleted!',
        'de': 'Konto gelöscht!',
        'fr': 'Compte supprimé!',
        'es': '¡Cuenta eliminada!',
        'it': 'Account eliminato!',
    },

    'Error enabling 2FA' : {
        'en': 'Error enabling 2FA',
        'de': 'Fehler beim Aktivieren von 2FA',
        'fr': 'Erreur lors de l\'activation de 2FA',
        'es': 'Error al habilitar 2FA',
        'it': 'Errore nell\'abilitazione del 2FA',
    },

    'QRCode generated!' : {
        'en': 'QRCode generated!',
        'de': 'QR-Code generiert!',
        'fr': 'QRCode généré!',
        'es': '¡Código QR generado!',
        'it': 'QRCode generato!',
    },

    'Scan the QR Code and enter the secret key from your 2FA app. Enter the generated code to verify setup.' : {
        'en': 'Scan the QR Code and enter the secret key from your 2FA app. Enter the generated code to verify setup.',
        'de': 'Scanne den QR-Code und gib den geheimen Schlüssel aus deiner 2FA-App ein. Gib den generierten Code ein, um die Einrichtung zu verifizieren.',
        'fr': 'Scannez le code QR et entrez la clé secrète de votre application 2FA. Entrez le code généré pour vérifier la configuration.',
        'es': 'Escanee el código QR e ingrese la clave secreta de su aplicación 2FA. Ingrese el código generado para verificar la configuración.',
        'it': 'Scansiona il codice QR e inserisci la chiave segreta dalla tua app 2FA. Inserisci il codice generato per verificare la configurazione.',
    },

    'Enter 2FA code' : {
        'en': 'Enter 2FA code',
        'de': '2FA-Code eingeben',
        'fr': 'Entrez le code 2FA',
        'es': 'Ingrese el código 2FA',
        'it': 'Inserisci il codice 2FA',
    },

    'Verify Code' : {
        'en': 'Verify Code',
        'de': 'Code verifizieren',
        'fr': 'Vérifier le code',
        'es': 'Verificar código',
        'it': 'Verifica codice',
    },

    '2FA verification failed' : {
        'en': '2FA verification failed',
        'de': '2FA-Verifizierung fehlgeschlagen',
        'fr': 'La vérification 2FA a échoué',
        'es': 'La verificación 2FA falló',
        'it': 'Verifica 2FA fallita',
    },

    'Two-Factor authentication setup complete!' : {
        'en': 'Two-Factor authentication setup complete!',
        'de': 'Zwei-Faktor-Authentifizierung eingerichtet!',
        'fr': 'Configuration de l\'authentification à deux facteurs terminée!',
        'es': '¡Configuración de autenticación de dos factores completa!',
        'it': 'Configurazione dell\'autenticazione a due fattori completata!',
    },

    'New password cannot be empty!' : {
        'en': 'New password cannot be empty!',
        'de': 'Neues Passwort darf nicht leer sein!',
        'fr': 'Le nouveau mot de passe ne peut pas être vide!',
        'es': '¡La nueva contraseña no puede estar vacía!',
        'it': 'La nuova password non può essere vuota!',
    },

    'Password could not be changed!' : {
        'en': 'Password could not be changed!',
        'de': 'Passwort konnte nicht geändert werden!',
        'fr': 'Le mot de passe n\'a pas pu être changé!',
        'es': '¡No se pudo cambiar la contraseña!',
        'it': 'La password non poteva essere cambiata!',
    },

    'Password changed!' : {
        'en': 'Password changed!',
        'de': 'Passwort geändert!',
        'fr': 'Mot de passe changé!',
        'es': '¡Contraseña cambiada!',
        'it': 'Password cambiata!',
    },

    'Password changed successfully! Login again.' : {
        'en': 'Password changed successfully! Login again.',
        'de': 'Passwort erfolgreich geändert! Melde dich erneut an.',
        'fr': 'Mot de passe changé avec succès! Connectez-vous à nouveau.',
        'es': '¡Contraseña cambiada con éxito! Inicie sesión de nuevo.',
        'it': 'Password cambiata con successo! Accedi di nuovo.',
    },

    'Please enter a valid tournament ID' : {
        'en': 'Please enter a valid tournament ID',
        'de': 'Bitte geben Sie eine gültige Turnier-ID ein',
        'fr': 'Veuillez entrer un identifiant de tournoi valide',
        'es': 'Por favor, introduzca un ID de torneo válido',
        'it': 'Si prega di inserire un ID torneo valido',
    },

    'Failed to create tournament!' : {
        'en': 'Failed to create tournament!',
        'de': 'Turnier konnte nicht erstellt werden!',
        'fr': 'Échec de la création du tournoi!',
        'es': '¡No se pudo crear el torneo!',
        'it': 'Creazione del torneo non riuscita!',
    },

    'Tournament created! Tournament ID: ' : {
        'en': 'Tournament created! Tournament ID: ',
        'de': 'Turnier erstellt! Turnier-ID: ',
        'fr': 'Tournoi créé! Identifiant du tournoi: ',
        'es': '¡Torneo creado! ID del torneo: ',
        'it': 'Torneo creato! ID torneo: ',
    },

    'Failed to join tournament!' : {
        'en': 'Failed to join tournament!',
        'de': 'Teilnahme am Turnier fehlgeschlagen!',
        'fr': 'Échec de la participation au tournoi!',
        'es': '¡No se pudo unir al torneo!',
        'it': 'Partecipazione al torneo non riuscita!',
    },

    'Joined tournament!' : {
        'en': 'Joined tournament!',
        'de': 'Am Turnier teilgenommen!',
        'fr': 'Tournoi rejoint!',
        'es': '¡Torneo unido!',
        'it': 'Torneo unito!',
    },

    'Please enter a tournament name' : {
        'en': 'Please enter a tournament name',
        'de': 'Bitte gib einen Turniernamen ein',
        'fr': 'Veuillez entrer un nom de tournoi',
        'es': 'Por favor, introduzca un nombre de torneo',
        'it': 'Si prega di inserire un nome torneo',
    },

    'Please enter a valid tournament ID' : {
        'en': 'Please enter a valid tournament ID',
        'de': 'Bitte gib eine gültige Turnier-ID ein',
        'fr': 'Veuillez entrer un identifiant de tournoi valide',
        'es': 'Por favor, introduzca un ID de torneo válido',
        'it': 'Si prega di inserire un ID torneo valido',
    },

    'Start Tournament' : {
        'en': 'Start Tournament',
        'de': 'Turnier starten',
        'fr': 'Démarrer le tournoi',
        'es': 'Iniciar torneo',
        'it': 'Inizia torneo',
    },
    
    'By clicking OK you agree to the Terms of Use.' : {
        'en': 'By clicking OK you agree to the Terms of Use.',
        'de': 'Durch Klicken auf OK stimmst du den Nutzungsbedingungen zu.',
        'fr': 'En cliquant sur OK, vous acceptez les conditions d\'utilisation.',
        'es': 'Al hacer clic en Aceptar, aceptas los Términos de uso.',
        'it': 'Cliccando su OK accetti i Termini di utilizzo.',
    },

    'Regsitration canceled!' : {
        'en': 'Regsitration canceled!',
        'de': 'Registrierung abgebrochen!',
        'fr': 'Inscription annulée!',
        'es': '¡Registro cancelado!',
        'it': 'Registrazione annullata!',
    },

    'Email already exists!' : {
        'en': 'Email already exists!',
        'de': 'E-Mail existiert bereits!',
        'fr': 'L\'e-mail existe déjà!',
        'es': '¡El correo electrónico ya existe!',
        'it': 'L\'email esiste già!',
    },

    'Username already exists!' : {
        'en': 'Username already exists!',
        'de': 'Benutzername existiert bereits!',
        'fr': 'Le nom d\'utilisateur existe déjà!',
        'es': '¡El nombre de usuario ya existe!',
        'it': 'Il nome utente esiste già!',
    },

    'Registration successful!' : {
        'en': 'Registration successful!',
        'de': 'Registrierung erfolgreich!',
        'fr': 'Inscription réussie!',
        'es': '¡Registro exitoso!',
        'it': 'Registrazione riuscita!',
    },

    'This password is too common!' : {
        'en': 'This password is too common!',
        'de': 'Dieses Passwort ist zu unsicher!',
        'fr': 'Ce mot de passe est trop courant!',
        'es': '¡Esta contraseña es demasiado común!',
        'it': 'Questa password è troppo comune!',
    },

    'This password is entirely numeric!' : {
        'en': 'This password is entirely numeric!',
        'de': 'Dieses Passwort ist vollständig numerisch!',
        'fr': 'Ce mot de passe est entièrement numérique!',
        'es': '¡Esta contraseña es completamente numérica!',
        'it': 'Questa password è interamente numerica!',
    },

    'This password is too short. It must contain at least 8 characters!' : {
        'en': 'This password is too short. It must contain at least 8 characters!',
        'de': 'Dieses Passwort ist zu kurz. Es muss mindestens 8 Zeichen enthalten!',
        'fr': 'Ce mot de passe est trop court. Il doit contenir au moins 8 caractères!',
        'es': '¡Esta contraseña es demasiado corta. Debe contener al menos 8 caracteres!',
        'it': 'Questa password è troppo corta. Deve contenere almeno 8 caratteri!',
    },

    'Username could not be changed!' : {
        'en': 'Username could not be changed!',
        'de': 'Benutzername konnte nicht geändert werden!',
        'fr': 'Le nom d\'utilisateur n\'a pas pu être changé!',
        'es': '¡No se pudo cambiar el nombre de usuario!',
        'it': 'Il nome utente non poteva essere cambiato!',
    },

    'Username changed successfully!' : {
        'en': 'Username changed successfully!',
        'de': 'Benuztername erfolgreich geändert!',
        'fr': 'Nom d\'utilisateur changé avec succès!',
        'es': '¡Nombre de usuario cambiado con éxito!',
        'it': 'Nome utente cambiato con successo!',
    },
};

export default appState;