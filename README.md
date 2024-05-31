# ft_transcendence

## How to run

* Recommended OS: Linux
* have docker installed and running -> simply open docker desktop<br>
![github-8](https://github.com/RanniSch/ft_transcendence/assets/104382315/687d004c-b7c4-40a8-903e-7b4d320e4dfc)

* In your terminal run: ```make```
* Open the browser and type in **localhost**
* In your terminal run: ```make down``` to turn off the containers after playing Pong

## Not sure what commands are available?

* type ```make help```
* this will display all available commands of the Makefile

<br>

# About the project
The final project "ft_transcendence" of the 42 Core Curriculum is about creating a website for the mighty Pong competition. You can play Pong against another player, against the computer with an AI opponent or you can set up a tournament with several players.
Django" was chosen as the **backend framework**, "Bootstrap Toolkit" as the **frontend framework** and "PostfreSQL" as the **database** for the backend and more.



https://github.com/RanniSch/ft_transcendence/assets/104382315/c6733f06-ba41-41a4-a987-ec854501bd2c



### Other functions: 
On the website a **user management system** is implemented with standard user management, authentication, users across tournaments and remote authentication.
This allows users to subscribe to the site and registered users to log in securely. Users can choose a unique display name to play in the tournaments. Users can update their information and upload an avatar, with a default option if none is provided. Users can add others as friends and view their online status. User profiles display statistics such as wins and losses. Each user has a match history, including 1v1 games, dates and relevant details, which is accessible to logged-in users.
With the implementation of the **remote authentication system**: "OAuth 2.0 Authentication with 42", users can authenticate with their 42 account and safely sign in by securely exchanging authentication tokens and user information between the web application and the authentication provider.

![github-1](https://github.com/RanniSch/ft_transcendence/assets/104382315/1b7a714b-32b3-4693-816d-82d09fd300ce)


![github-2](https://github.com/RanniSch/ft_transcendence/assets/104382315/e3800bb3-cd71-4caa-b96a-be9d439e6cb0)


![github-6](https://github.com/RanniSch/ft_transcendence/assets/104382315/9bc6fb2f-4017-450f-90cb-2f2ebc1f016d)


A **gameplay and user experience** is provided as it is possible to play a second game of Hangman against another player or alone. For both games there is a user history to record and display the gameplay of individual users. A statistics and matchmaking system is provided to allow users to find opponents and participate in fair and balanced matches. The user's game history and matchmaking data is securely stored and kept up to date.

There are **game customisation** options for all games available on the platform, such as power-ups, changing the colour of the game background and a default version of the game. The customisations can be accessed via a user-friendly settings menu to adjust game parameters.
User and game statistics dashboards are also provided, showing statistics for individual users and game sessions.

Playing Pong against the computer is not just a normal algorithm, but an **AI opponent** that provides a challenging and engaging gaming experience for users. It mimics human behaviour, which means that the AI implementation simulates keyboard input. The constraint is that the AI can only refresh its view of the game once per second, so it has to anticipate bounces and other actions. In addition, the AI's logic and decision-making processes allow the AI player to make intelligent and strategic moves.


![github-3](https://github.com/RanniSch/ft_transcendence/assets/104382315/fb950a9a-18a8-4bff-a26e-01fcb554c08f)

![github-5](https://github.com/RanniSch/ft_transcendence/assets/104382315/7c6c1160-4d70-4433-8401-ab09d758667c)


![github-4](https://github.com/RanniSch/ft_transcendence/assets/104382315/8ef98d96-2794-4b3f-b84a-dedf8f6041a4)

For **cybersecurity**, GDPR compliance options are implemented with user anonymisation, local data management, account deletion, two-factor authentication (2FA) and JWT.
GDPR compliance options enable users to exercise their privacy rights. GDPR-compliant features allow users to request anonymisation of their personal data, ensuring their identity and sensitive information is protected. Tools are provided for users to manage their local data, including the ability to view, edit or delete their personal information stored in the system. There is also a streamlined process for users to request the permanent deletion of their accounts, including all associated data, ensuring compliance with data protection regulations. **Two-factor authentication** (2FA) and the use of JSON Web Tokens (JWT) for security and user authentication are enhanced. An easy-to-use setup process is provided to enable 2FA with the option for authenticator applications. JWT tokens are securely issued and validated to prevent unauthorised access to user accounts and sensitive data.

For **accessibility**, the site is supported on all devices, browser compatibility is extended and multiple languages are supported. The site works seamlessly on all types of devices as it is responsive and adapts to different screen sizes.


![github-7](https://github.com/RanniSch/ft_transcendence/assets/104382315/e61b56c4-4037-4346-8aa1-cdc6a8ecc929)

