## Features

- Self-Whitelist: Players can add themselves to the whitelist without admin assistance.

- Live Status: Real-time info on server status and player count.

- Mining Minigame: Mine resources and earn XP directly within Discord.

- Auto-Leveling System: Gain XP, level up, and receive Discord roles automatically.

- Economy System: Sell found emeralds for additional XP boosts.

## 🛠 Commands

| **Command**     | **Description**                                              | **Visibility**      |
| --------------- | ------------------------------------------------------------ | ------------------- |
| `/whitelist`    | Add your Minecraft username to the whitelist.                | Ephemeral (Private) |
| `/serverstatus` | Displays online status, player count, and more.              | Ephemeral (Private) |
| `/mine`         | Mine resources (Stone to Emerald). (Available once per hour) | Public              |
| `/sell`         | Sell collected emeralds for XP boosts.                       | Public              |
| `/sell`         | (Admin) Make a player an operator on your server             | Ephermal (Private)  |

## Levels & Ranks

Earn XP through mining and selling to increase your rank. Your rank is automatically assigned as a Discord role:

    Level 1 → 🟢 Novice

    Level 3 → 🔵 Apprentice

    Level 5 → ⚒️ Miner

    Level 7 → 🟠 Expert

    Level 10 → 💎 Master

    Level 15 → 👑 Legend

## Self-Hosting (Docker)

The easiest way to run CraftyDC is by using Docker Compose.
### 1. Preparation

Create a folder for the bot and set up a `.env` file (or `stack.env` for Portainer) with your credentials:
```env
CRAFTY_API_KEY=Your_Crafty_API_key
BOT_TOKEN=Your_Discord_Bot_token
CRAFTY_SERVER_ID=Your_Crafty_Server_ID
CRAFTY_HOST=https://your-crafty-ip:8443
MINECRAFT_SERVER_IP=your.server.ip
CLIENT_ID=Client_ID_of_the_bot
GUILD_ID=Your_Discord_Server_ID

ENABLE_VOX_CRAFT=false
MONGO_URI=mongodb://mongodb-ip:27017/discordbot #if vox-craft enabled
VOX_CHANNEL=VOX_CRAFT_CHANNEL_ID #if vox-craft enabled

ENABLE_WELCOME_MSG=false
WELCOME_MSG=This is your Custom message #if msg enabled
WELCOME_CHANNEL_ID=ID_of_the_welcome_channel # if msg enabled

ENABLE_WELCOME_ROLE=false
DEFAULT_ROLE_ID=ID_of_the_default_role #if welcome role enabled
```
### 2. Docker Compose
Create a `docker-compose.yml` file in the same directory:
```YAML
services:
  # discord-deploy registers the commands once and then exits.
  discord-deploy:
    image: n1xka/crafty-dc:latest
    env_file: .env # use stack.env for Portainer
    command: ["node", "deploy.js"]
    restart: "no"

  discord-bot:
    image: n1xka/crafty-dc:latest
    container_name: discord-bot
    env_file: .env # use stack.env for Portainer
    depends_on:
      - discord-deploy
    restart: unless-stopped
    command: ["node", "index.js"]
```
### 3. Deployment

Run the following command in your terminal:
```bash
docker-compose up -d
```

## License

This project is licensed under the GNU General Public License (GPL). This means you are free to use, share, and modify the code, provided that your changes are also published under the GPL
